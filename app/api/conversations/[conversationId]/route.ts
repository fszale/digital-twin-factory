import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { jsonResponse, notFound } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ conversationId: string }> }
): Promise<Response> {
  const { conversationId } = await context.params;
  const repository = getRepository();
  const conversation = await repository.getConversation(conversationId);

  if (!conversation) {
    return notFound("conversation_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(_request, conversation.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const [messages, latestSummary] = await Promise.all([
    repository.listConversationMessages(conversationId),
    repository.getLatestConversationSummary(conversationId)
  ]);

  return jsonResponse({
    conversation,
    messages,
    latestSummary
  });
}
