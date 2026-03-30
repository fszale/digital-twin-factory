import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse, notFound } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ conversationId: string }> }
): Promise<Response> {
  const { conversationId } = await context.params;
  const repository = getRepository();
  const conversation = await repository.getConversation(conversationId);

  if (!conversation) {
    return notFound("conversation_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(request, conversation.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json()) as {
    direction?: "inbound" | "outbound";
    authorType?: "human" | "digital_twin" | "system";
    authorId?: string;
    body?: string;
    structuredPayload?: Record<string, unknown>;
  };

  if (!body.direction || !body.authorType || !body.authorId || !body.body) {
    return badRequest("missing_required_fields", ["direction", "authorType", "authorId", "body"]);
  }

  const message = await repository.appendMessage({
    conversationId,
    direction: body.direction,
    authorType: body.authorType,
    authorId: body.authorId,
    body: body.body,
    structuredPayload: body.structuredPayload
  });

  return jsonResponse({ message }, { status: 201 });
}
