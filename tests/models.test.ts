import assert from "node:assert/strict";
import test from "node:test";

import { getApiKeyEnvNameForProvider, summarizePreferredModel } from "../lib/server/models.ts";

test("getApiKeyEnvNameForProvider maps providers to env vars", () => {
  assert.equal(getApiKeyEnvNameForProvider("openai"), "OPENAI_API_KEY");
  assert.equal(getApiKeyEnvNameForProvider("xai"), "XAI_API_KEY");
});

test("summarizePreferredModel includes preferred and fallback models", () => {
  const summary = summarizePreferredModel({
    deploymentId: "filip__factory-1",
    factoryId: "factory-1",
    digitalTwinId: "filip",
    analysisOnly: true,
    preferredModelProvider: "xai",
    preferredModel: "grok-4.2",
    preferredModelProfile: "deep",
    fallbackModelProvider: "openai",
    fallbackModel: "chatgpt-default",
    allowedModels: ["xai/grok-4.2", "openai/chatgpt-default"],
    enabledChannels: ["web_chat"]
  });

  assert.match(summary, /xai\/grok-4.2/);
  assert.match(summary, /Fallback: openai\/chatgpt-default/);
});
