
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import LandingPage from "@/components/LandingPage";
import AgentLoader from "@/components/AgentLoader";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // One loader; no separate text-based loading screen.


  return <LandingPage />;
}
