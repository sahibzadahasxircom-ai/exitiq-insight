export type IntegrationStatus = "not_connected" | "waiting" | "connected" | "failed";

export interface Integration {
  id: string;
  name: string;
  reason: string;
  setupTime: string;
  status: IntegrationStatus;
  icon: string;
  type: "javascript" | "api" | "stripe" | "webhook";
}

export interface VerificationResult {
  success: boolean;
  error?: string;
}

export interface IntegrationConfig {
  javascript?: {
    snippet: string;
  };
  api?: {
    apiKey: string;
    endpoint: string;
  };
  stripe?: {
    clientId: string;
  };
  webhook?: {
    url: string;
    secret: string;
  };
}
