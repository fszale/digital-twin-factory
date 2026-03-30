import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    factoryId?: string;
    workspaceId?: string;
    deploymentId?: string;
    channelType?: string;
    requesterId?: string;
    title?: string;
    externalThreadRef?: string;
  };

  if (!body.factoryId || !body.deploymentId || !body.channelType || !body.requesterId) {
    return badRequest("missing_required_fields", [
      "factoryId",
      "deploymentId",
      "channelType",
      "requesterId"
    ]);
  }

  const access = await requireDeploymentAccessFromRequest(request, body.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const repository = getRepository();
  const conversation = await repository.createConversation({
    factoryId: body.factoryId,
    workspaceId: body.workspaceId,
    deploymentId: body.deploymentId,
    channelType: body.channelType,
    requesterId: body.requesterId,
    title: body.title,
    externalThreadRef: body.externalThreadRef,
    status: "open"
  });

  return jsonResponse({ conversation }, { status: 201 });
}
