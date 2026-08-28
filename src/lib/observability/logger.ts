import { redactRecord } from './redact'

export type LogLevel = 'info' | 'warn' | 'error'

export type ObservabilityEventName =
  | 'checkout_handoff_ready'
  | 'checkout_handoff_failed'
  | 'cart_buyer_identity_sync_failed'
  | 'account_oauth_failed'
  | 'shopify_storefront_failed'
  | 'shopify_admin_failed'
  | 'customer_account_failed'
  | 'sanity_failed'
  | 'searchanise_failed'
  | 'trustoo_failed'
  | 'hulkapps_failed'
  | 'contact_provider_failed'
  | 'shopify_webhook_received'
  | 'shopify_webhook_rejected'
  | 'sanity_webhook_received'
  | 'sanity_webhook_rejected'
  | 'draft_preview_enabled'
  | 'draft_preview_rejected'
  | 'seo_url_export_completed'
  | 'seo_url_export_failed'
  | 'seo_url_export_rejected'
  | 'route_action_failed'

type LogContext = Record<string, unknown>

export function logEvent(
  level: LogLevel,
  eventName: ObservabilityEventName,
  context: LogContext = {},
) {
  const payload = {
    event: eventName,
    level,
    context: redactRecord(context),
  }

  console[level]('[observability]', payload)
}
