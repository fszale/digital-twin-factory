import Link from "next/link";

import { requireDeploymentAccessForServerRender } from "@/lib/server/access.ts";
import { getDeploymentDashboardData } from "@/lib/server/dashboard.ts";
import { getApiKeyEnvNameForProvider, isProviderConfigured, summarizePreferredModel } from "@/lib/server/models.ts";
import { getRepository } from "@/lib/server/repository.ts";

function renderSetupError(message: string) {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Deployment Dashboard</p>
        <h1>Configuration needed</h1>
        <p className="lead">{message}</p>
      </section>
      <section className="panel">
        <h2>Next steps</h2>
        <p>Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then apply `supabase/schema.sql`.</p>
      </section>
    </main>
  );
}

export default async function DeploymentDashboardPage({
  params
}: {
  params: Promise<{ deploymentId: string }>;
}) {
  const { deploymentId } = await params;

  try {
    const access = await requireDeploymentAccessForServerRender(deploymentId);
    if ("error" in access) {
      return renderSetupError(access.error);
    }

    const data = await getDeploymentDashboardData(getRepository(), deploymentId);

    return (
      <main className="dashboard-shell">
        <section className="dashboard-header">
          <p className="eyebrow">Deployment Dashboard</p>
          <h1>{deploymentId}</h1>
          <p className="lead">
            Conversations, latest synthesized summaries, and HITL escalations for this deployment.
          </p>
          <p className="muted">
            Signed in as {access.user.email ?? access.user.authUserId} with role {access.user.platformRole}.
          </p>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Deployment config</h2>
              <span className="badge">
                {data.deploymentConfig ? data.deploymentConfig.preferredModelProvider : "missing"}
              </span>
            </div>
            {data.deploymentConfig ? (
              <>
                <p>{summarizePreferredModel(data.deploymentConfig)}</p>
                <p className="muted">
                  API key env: {getApiKeyEnvNameForProvider(data.deploymentConfig.preferredModelProvider)} ·{" "}
                  {isProviderConfigured(data.deploymentConfig.preferredModelProvider) ? "configured" : "missing"}
                </p>
                <p className="muted">
                  Allowed models: {data.deploymentConfig.allowedModels.join(", ") || "None declared"}
                </p>
                <p className="muted">
                  Channels: {data.deploymentConfig.enabledChannels.join(", ") || "None declared"}
                </p>
              </>
            ) : (
              <p className="empty">No deployment config stored yet. Add one through the deployment config API.</p>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Conversations</h2>
              <span className="badge">{data.conversations.length}</span>
            </div>
            {data.conversations.length === 0 ? (
              <p className="empty">No conversations captured yet.</p>
            ) : (
              <div className="stack">
                {data.conversations.map(({ conversation, latestSummary }) => (
                  <article className="card" key={conversation.id}>
                    <div className="card-row">
                      <strong>{conversation.title ?? "Untitled conversation"}</strong>
                      <span className="muted">{conversation.channelType}</span>
                    </div>
                    <p className="muted">Requester: {conversation.requesterId}</p>
                    <p className="muted">Status: {conversation.status}</p>
                    <p className="muted">Last activity: {conversation.lastActivityAt}</p>
                    <p>{latestSummary?.content ?? "No synthesized summary yet."}</p>
                    <p>
                      <Link href={`/dashboard/deployments/${deploymentId}/conversations/${conversation.id}`}>
                        Review conversation
                      </Link>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>HITL Escalations</h2>
              <span className="badge">{data.escalations.length}</span>
            </div>
            {data.escalations.length === 0 ? (
              <p className="empty">No HITL escalations recorded yet.</p>
            ) : (
              <div className="stack">
                {data.escalations.map(({ escalation, deliveries, latestSummary }) => (
                  <article className="card" key={escalation.id}>
                    <div className="card-row">
                      <strong>{escalation.reasonCode}</strong>
                      <span className="status-pill">{escalation.status}</span>
                    </div>
                    <p className="muted">Requested human: {escalation.requestedHumanId ?? "Not specified"}</p>
                    <p className="muted">Delivery status: {escalation.deliveryStatus}</p>
                    <p className="muted">
                      Channels: {deliveries.map((delivery) => delivery.channelType).join(", ") || "None"}
                    </p>
                    {escalation.resolutionSummary ? (
                      <p className="muted">Resolution: {escalation.resolutionSummary}</p>
                    ) : null}
                    <p>{latestSummary?.content ?? "No handoff summary generated yet."}</p>
                    {latestSummary?.openQuestions.length ? (
                      <ul className="flat-list">
                        {latestSummary.openQuestions.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ul>
                    ) : null}
                    {escalation.status !== "resolved" && escalation.status !== "cancelled" ? (
                      <div className="stack">
                        <form
                          action={`/dashboard/deployments/${deploymentId}/escalations/${escalation.id}/resolve`}
                          method="post"
                        >
                          <label className="muted" htmlFor={`resolution-${escalation.id}`}>
                            Resolution summary
                          </label>
                          <textarea
                            id={`resolution-${escalation.id}`}
                            name="resolutionSummary"
                            rows={3}
                            defaultValue="Human reviewed and resolved."
                          />
                          <button type="submit">Mark resolved</button>
                        </form>
                        <form
                          action={`/dashboard/deployments/${deploymentId}/escalations/${escalation.id}/cancel`}
                          method="post"
                        >
                          <button type="submit">Cancel escalation</button>
                        </form>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown dashboard error";
    return renderSetupError(message);
  }
}
