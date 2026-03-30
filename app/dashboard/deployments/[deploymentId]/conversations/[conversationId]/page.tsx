import Link from "next/link";

import { requireDeploymentAccessForServerRender } from "@/lib/server/access.ts";
import { getRepository } from "@/lib/server/repository.ts";

function renderSetupError(message: string) {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Conversation Review</p>
        <h1>Configuration needed</h1>
        <p className="lead">{message}</p>
      </section>
    </main>
  );
}

export default async function ConversationDetailPage({
  params
}: {
  params: Promise<{ deploymentId: string; conversationId: string }>;
}) {
  const { deploymentId, conversationId } = await params;

  try {
    const access = await requireDeploymentAccessForServerRender(deploymentId);
    if ("error" in access) {
      return renderSetupError(access.error);
    }

    const repository = getRepository();
    const conversation = await repository.getConversation(conversationId);
    if (!conversation || conversation.deploymentId !== deploymentId) {
      return renderSetupError("conversation_not_found");
    }

    const [messages, summary] = await Promise.all([
      repository.listConversationMessages(conversationId),
      repository.getLatestConversationSummary(conversationId)
    ]);

    return (
      <main className="dashboard-shell">
        <section className="dashboard-header">
          <p className="eyebrow">Conversation Review</p>
          <h1>{conversation.title ?? "Untitled conversation"}</h1>
          <p className="lead">
            Review the full chat transcript, latest synthesized context, and requester metadata for owner-led HITL.
          </p>
          <p className="muted">
            Deployment <code>{deploymentId}</code> · Signed in as{" "}
            {access.user.email ?? access.user.authUserId}
          </p>
          <p>
            <Link href={`/dashboard/deployments/${deploymentId}`}>Back to deployment dashboard</Link>
          </p>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Conversation</h2>
              <span className="badge">{messages.length} messages</span>
            </div>
            <p className="muted">Requester: {conversation.requesterId}</p>
            <p className="muted">Channel: {conversation.channelType}</p>
            <p className="muted">Status: {conversation.status}</p>
            <div className="stack">
              {messages.map((message) => (
                <article className="card" key={message.id}>
                  <div className="card-row">
                    <strong>{message.authorType}</strong>
                    <span className="muted">{message.createdAt}</span>
                  </div>
                  <p className="muted">
                    {message.direction} · {message.authorId}
                  </p>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Latest Summary</h2>
              <span className="badge">{summary?.summaryType ?? "none"}</span>
            </div>
            {summary ? (
              <>
                <p>{summary.content}</p>
                <p className="muted">Handoff ready: {summary.isHandoffReady ? "yes" : "no"}</p>
                {summary.openQuestions.length ? (
                  <>
                    <h3>Open questions</h3>
                    <ul className="flat-list">
                      {summary.openQuestions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : (
              <p className="empty">No synthesized summary yet.</p>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    return renderSetupError(error instanceof Error ? error.message : "Unknown conversation error");
  }
}
