import { getProviderApiKey } from "./env.ts";
import type { DeploymentConfigRecord, ModelProvider } from "./types.ts";

export function getApiKeyEnvNameForProvider(provider: ModelProvider): "OPENAI_API_KEY" | "XAI_API_KEY" {
  return provider === "openai" ? "OPENAI_API_KEY" : "XAI_API_KEY";
}

export function isProviderConfigured(provider: ModelProvider): boolean {
  return Boolean(getProviderApiKey(provider));
}

export function summarizePreferredModel(config?: DeploymentConfigRecord): string {
  if (!config) {
    return "No deployment config stored yet.";
  }

  const fallback =
    config.fallbackModelProvider && config.fallbackModel
      ? ` Fallback: ${config.fallbackModelProvider}/${config.fallbackModel}.`
      : "";

  return `${config.preferredModelProvider}/${config.preferredModel} (${config.preferredModelProfile})${fallback}`;
}
