export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

export function badRequest(message: string, details?: unknown): Response {
  return jsonResponse({ error: message, details }, { status: 400 });
}

export function notFound(message: string): Response {
  return jsonResponse({ error: message }, { status: 404 });
}

export function unauthorized(message: string): Response {
  return jsonResponse({ error: message }, { status: 401 });
}

export function forbidden(message: string): Response {
  return jsonResponse({ error: message }, { status: 403 });
}
