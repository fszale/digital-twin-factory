import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    jobId?: string;
    deploymentId?: string;
    conversationId?: string;
    status?: string;
    modelProfile?: string;
    modelName?: string;
    usefulnessScore?: number;
    scoreConfidence?: number;
  };

  if (!body.jobId || !body.deploymentId || !body.conversationId || !body.status) {
    return badRequest("missing_required_fields", ["jobId", "deploymentId", "conversationId", "status"]);
  }

  const repository = getRepository();
  const conversation = await repository.getConversation(body.conversationId);
  if (!conversation) {
    return badRequest("conversation_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(request, body.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const now = new Date().toISOString();
  const run = await repository.createRun({
    jobId: body.jobId,
    deploymentId: body.deploymentId,
    conversationId: body.conversationId,
    status: body.status,
    modelProfile: body.modelProfile,
    modelName: body.modelName,
    usefulnessScore: body.usefulnessScore,
    scoreConfidence: body.scoreConfidence,
    startedAt: now,
    completedAt: body.status === "completed" ? now : undefined
  });

  return jsonResponse({ run }, { status: 201 });
}
