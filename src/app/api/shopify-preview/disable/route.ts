import { clearProductPreviewSession } from '@/lib/shopify/preview-session'

export async function GET(request: Request): Promise<Response> {
  await clearProductPreviewSession()
  return Response.redirect(new URL('/', request.url))
}
