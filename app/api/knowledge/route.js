import handler from '../../../lib/knowledge-handler.js';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const headers = new Headers();
  const response = { code: 200, setHeader(key, value) { headers.set(key, value); }, status(code) { this.code = code; return this; }, json(body) { return Response.json(body, { status: this.code, headers }); } };
  return handler(request, response);
}
