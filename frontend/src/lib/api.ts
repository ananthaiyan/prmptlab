export const API_BASE = "http://localhost:8000/api";

let authToken: string | null = null;
let currentUserId: string | null = null;

export function setAuthToken(token: string | null, userId?: string | null) {
  authToken = token;
  if (userId) currentUserId = userId;
}

export class PlanLimitError extends Error {
  resource: string;
  current: number;
  limit: number;
  requiredPlan: string;

  constructor(detail: any) {
    super(detail.message || `Plan limit reached for ${detail.resource}`);
    this.name = "PlanLimitError";
    this.resource = detail.resource;
    this.current = detail.current;
    this.limit = detail.limit;
    this.requiredPlan = detail.required_plan || "PLUS";
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  if (currentUserId) {
    headers.set("X-User-Id", currentUserId);
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore json parse error
    }

    const detail = errorData.detail;
    if (detail && typeof detail === "object" && detail.error === "PLAN_LIMIT_REACHED") {
      throw new PlanLimitError(detail);
    }

    const message = (typeof detail === "string" ? detail : errorData.message) || res.statusText || "Request failed";
    throw new Error(message);
  }

  return res.json();
}

export async function getProjects() {
  return fetchWithAuth(`${API_BASE}/projects`);
}

export async function getProject(id: string) {
  return fetchWithAuth(`${API_BASE}/projects/${id}`);
}

export async function getPrompts(projectId: string) {
  return fetchWithAuth(`${API_BASE}/projects/${projectId}/prompts`);
}

export async function getTestSuites(projectId: string) {
  return fetchWithAuth(`${API_BASE}/projects/${projectId}/test-suites`);
}

export async function getTestCases(suiteId: string) {
  return fetchWithAuth(`${API_BASE}/test-suites/${suiteId}/test-cases`);
}

export async function getEvaluations(projectId?: string) {
  const url = projectId ? `${API_BASE}/evaluations?project_id=${projectId}` : `${API_BASE}/evaluations`;
  return fetchWithAuth(url);
}

export async function runEvaluation(promptId: string, suiteId: string, model: string = "qwen/qwen3.8-27b") {
  return fetchWithAuth(`${API_BASE}/evaluations/run`, {
    method: "POST",
    body: JSON.stringify({ prompt_id: promptId, suite_id: suiteId, model }),
  });
}

export async function getEvaluationResults(runId: string) {
  return fetchWithAuth(`${API_BASE}/evaluations/${runId}/results`);
}

export async function createPrompt(projectId: string, name: string, content: string) {
  return fetchWithAuth(`${API_BASE}/projects/${projectId}/prompts`, {
    method: "POST",
    body: JSON.stringify({ name, content }),
  });
}

export async function createProject(name: string, description: string = "") {
  return fetchWithAuth(`${API_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function createTestSuite(projectId: string, name: string, description: string = "") {
  return fetchWithAuth(`${API_BASE}/projects/${projectId}/test-suites`, {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function createTestCase(suiteId: string, testCase: any) {
  return fetchWithAuth(`${API_BASE}/test-suites/${suiteId}/test-cases`, {
    method: "POST",
    body: JSON.stringify(testCase),
  });
}

export async function createBulkTestCases(suiteId: string, testCases: any[]) {
  return fetchWithAuth(`${API_BASE}/test-suites/${suiteId}/test-cases/bulk`, {
    method: "POST",
    body: JSON.stringify(testCases),
  });
}

export async function generateRedTeamTests(promptContent: string, count: number = 10) {
  return fetchWithAuth(`${API_BASE}/redteam/generate`, {
    method: "POST",
    body: JSON.stringify({ prompt_content: promptContent, count }),
  });
}

export async function getModels() {
  return fetchWithAuth(`${API_BASE}/models`);
}

export async function getSubscription() {
  return fetchWithAuth(`${API_BASE}/billing/subscription`);
}

export async function createCheckoutSession(plan: string) {
  return fetchWithAuth(`${API_BASE}/billing/checkout`, {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}
