export function requireSupabaseEnv(): {
  url: string;
  serviceRoleKey: string;
} {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return { url, serviceRoleKey };
}

export function getPlatformBootstrapSecret(): string | undefined {
  return process.env.PLATFORM_BOOTSTRAP_SECRET;
}

export function getProviderApiKey(provider: "openai" | "xai"): string | undefined {
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY;
  }
  return process.env.XAI_API_KEY;
}
