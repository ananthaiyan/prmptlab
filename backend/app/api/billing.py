import hashlib
import hmac
import logging

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import UserContext, get_current_user
from app.config import get_settings
from app.db.database import get_db
from app.db.models import Subscription
from app.services.entitlements import get_user_usage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/billing", tags=["Billing"])


class CheckoutRequest(BaseModel):
    plan: str  # PLUS, PRO


@router.get("/subscription")
async def get_subscription(
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    usage_data = await get_user_usage(user.user_id, db)
    stmt = select(Subscription).where(Subscription.user_id == user.user_id, Subscription.status == "active")
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()

    return {
        "user_id": user.user_id,
        "plan": usage_data["plan"],
        "status": sub.status if sub else "active",
        "current_period_end": sub.current_period_end.isoformat() if (sub and sub.current_period_end) else None,
        "usage": usage_data["usage"],
        "limits": usage_data["limits"],
    }


@router.post("/checkout")
async def create_checkout_session(
    body: CheckoutRequest,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if body.plan not in ["PLUS", "PRO"]:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    settings = get_settings()

    api_key = getattr(settings, "dodo_payments_api_key", "")
    product_id = getattr(settings, f"dodo_{body.plan.lower()}_product_id", "")

    if not product_id:
        product_id = "pdt_0NoNWjXG3YzINx4f3LH54" if body.plan == "PLUS" else "pdt_0NoNWrDehmngq7hqySbyI"

    # If Dodo Payments API key is provided, call Dodo API
    if api_key:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://test.dodopayments.com/subscriptions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "billing": {"country": "US"},
                        "product_cart": [{"product_id": product_id, "quantity": 1}],
                        "metadata": {"user_id": user.user_id, "plan": body.plan},
                        "return_url": "http://localhost:3000/settings"
                    },
                    timeout=10.0
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    checkout_url = data.get("checkout_url") or data.get("payment_link")
                    if checkout_url:
                        return {"checkout_url": checkout_url, "plan": body.plan, "mode": "live_api"}
                logger.warning("Dodo API call failed: %s %s", res.status_code, res.text)
        except Exception as e:
            logger.error("Failed to connect to Dodo Payments API: %s", e)

    # Direct Dodo checkout link
    if body.plan == "PLUS":
        checkout_url = "https://checkout.dodopayments.com/buy/pdt_0NoNWjXG3YzINx4f3LH54?quantity=1"
    else:
        checkout_url = "https://checkout.dodopayments.com/buy/pdt_0NoNWrDehmngq7hqySbyI?quantity=1"

    return {
        "checkout_url": checkout_url,
        "plan": body.plan,
        "mode": "live"
    }


@router.post("/dodo/webhook")
async def dodo_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    dodo_signature: str | None = Header(None, alias="x-dodo-signature")
):
    body_bytes = await request.body()
    settings = get_settings()
    webhook_secret = getattr(settings, "dodo_payments_webhook_secret", "")

    if webhook_secret and dodo_signature:
        expected_sig = hmac.new(webhook_secret.encode(), body_bytes, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, dodo_signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = data.get("type") or data.get("event")
    payload = data.get("data") or data

    logger.info("Received Dodo webhook event: %s", event_type)

    user_id = payload.get("metadata", {}).get("user_id") or payload.get("customer", {}).get("metadata", {}).get("user_id")
    plan = payload.get("metadata", {}).get("plan") or payload.get("plan", "PLUS")
    subscription_id = payload.get("subscription_id") or payload.get("id")
    customer_id = payload.get("customer_id")

    if not user_id:
        return {"status": "ignored", "reason": "No user_id in metadata"}

    stmt = select(Subscription).where(Subscription.user_id == user_id)
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()

    if not sub:
        sub = Subscription(user_id=user_id)
        db.add(sub)

    if event_type in ["subscription.created", "subscription.active", "payment.succeeded"]:
        sub.plan = plan
        sub.status = "active"
        sub.provider_subscription_id = subscription_id
        sub.provider_customer_id = customer_id
    elif event_type in ["subscription.cancelled", "subscription.expired"]:
        sub.status = "cancelled"
        sub.plan = "FREE"

    await db.commit()
    return {"status": "success", "user_id": user_id, "plan": sub.plan}
