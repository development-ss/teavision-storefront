# Legal Approval Matrix

## Scope

This matrix tracks launch coverage for code-owned Teavision legal policy routes. It records route implementation status, owner/legal approval state, last review date, and proof status without treating draft wording as final legal advice.

Final policy wording remains owner/legal gated. The storefront routes are live so launch reviewers can verify URLs, redirects, footer links, canonical metadata, and the approval status recorded in this matrix before final approval is recorded.

## Policy Route Matrix

| URL                         | Status                              | Owner/legal approval | Last reviewed | Proof                                                                                                          |
| --------------------------- | ----------------------------------- | -------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| `/pages/privacy-policy`     | implemented - policy copy published | pending              | 2026-08-28    | Customer-supplied privacy wording published; owner/legal approval proof remains pending.                       |
| `/pages/shipping-policy`    | implemented - policy copy published | pending              | 2026-08-28    | Customer-supplied shipping wording published; owner/legal approval proof remains pending.                      |
| `/pages/refund-policy`      | implemented - policy copy published | pending              | 2026-08-28    | Customer-supplied refund wording published; owner/legal approval proof remains pending.                        |
| `/pages/terms-of-service`   | implemented - policy copy published | pending              | 2026-08-28    | Customer-supplied Terms of Service wording published; owner/legal approval proof remains pending.              |
| `/pages/cookie-preferences` | implemented - consent controls live | pending              | 2026-08-28    | Plain-language consent copy and preference controls are published; owner/legal approval proof remains pending. |

## Owner/Legal Approval Evidence

No final owner/legal approval has been claimed in this implementation.

| URL                         | Approval state | Evidence owner       | Proof location                                                                   |
| --------------------------- | -------------- | -------------------- | -------------------------------------------------------------------------------- |
| `/pages/privacy-policy`     | pending        | Owner/legal reviewer | Pending owner/legal review.                                                      |
| `/pages/shipping-policy`    | pending        | Owner/legal reviewer | Pending owner/legal review.                                                      |
| `/pages/refund-policy`      | pending        | Owner/legal reviewer | Pending owner/legal review.                                                      |
| `/pages/terms-of-service`   | pending        | Owner/legal reviewer | Pending owner/legal review.                                                      |
| `/pages/cookie-preferences` | pending        | Owner/legal reviewer | Pending owner/legal wording review; consent preference controls are implemented. |

## Redirect Evidence

The following legacy Shopify policy URLs are represented in the code-owned redirect registry and should return permanent Next.js redirects to canonical `/pages/*` policy routes:

| Source                                    | Destination               | Expected behavior      |
| ----------------------------------------- | ------------------------- | ---------------------- |
| `/policies/privacy-policy`                | `/pages/privacy-policy`   | Permanent 308 redirect |
| `/policies/shipping-policy`               | `/pages/shipping-policy`  | Permanent 308 redirect |
| `/policies/refund-policy`                 | `/pages/refund-policy`    | Permanent 308 redirect |
| `/pages/terms-conditions`                 | `/pages/terms-of-service` | Permanent 308 redirect |
| `/pages/terms-conditions-1`               | `/pages/terms-conditions` | Permanent 308 redirect |
| `/terms-of-service`                       | `/pages/terms-of-service` | Permanent 308 redirect |
| `/policies/terms-of-service`              | `/pages/terms-of-service` | Permanent 308 redirect |
| `/7868339/policies/privacy-policy.html`   | `/pages/privacy-policy`   | Permanent 308 redirect |
| `/7868339/policies/shipping-policy.html`  | `/pages/shipping-policy`  | Permanent 308 redirect |
| `/7868339/policies/refund-policy.html`    | `/pages/refund-policy`    | Permanent 308 redirect |
| `/7868339/policies/terms-of-service.html` | `/pages/terms-of-service` | Permanent 308 redirect |

## Remaining Owner-Gated Items

- Review and approve the published cookie-preferences wording before treating it as final.
- Record owner/legal approval evidence for the published privacy, shipping,
  refund, and Terms of Service wording.
- Record approver, approval date, and proof location for each policy route.
- Re-check implemented consent preference controls on `/pages/cookie-preferences` during owner/legal wording review.
- Re-run the launch route matrix after owner/legal approval and before indexability is flipped.
