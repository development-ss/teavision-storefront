# TKT-03154 verification

Status: ready to close. Deployed; live logout, account switch, fresh callback, standard hosted-checkout identity, and Shop Pay identity passed. Temporary test item removed.

## Release

- Date: 7 September 2026.
- Production commit: `076aca8e69ff8fae26f37e1967b0a563d0c6f6d5`.
- Base: `843ac2a137c818ecee9098a2c0ffe884b4907484`, the previously deployed commit.
- Vercel deployment: `FNukrfmQsmi6R2Ttcczi7sANew33`, Ready and assigned to `www.teavision.com.au`.
- Only the logout button, account browser regression, and fake provider logout support were released. Other unpushed workspace changes were excluded.

## Defect and correction

The dashboard's logout button used Next.js client navigation. Clicking it produced "Failed to fetch RSC payload" and fell back to a second, local-only logout request. The next sign-in silently restored the previous Shopify account. Full-page navigation through the same logout route allowed a new email to be entered.

The button now uses the existing `reloadDocument` option. The browser completes the provider logout redirect instead of fetching it as an RSC navigation.

Production OAuth settings were also corrected in Vercel before deployment:

| Variable                                       | Production                                      | Preview (preserved)                                        |
| ---------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI`        | `https://www.teavision.com.au/account/callback` | `https://teavision-storefront.vercel.app/account/callback` |
| `SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI` | `https://www.teavision.com.au/account/login`    | `https://teavision-storefront.vercel.app/account/login`    |

The shared entries were split into separate environment scopes. Production remained configured throughout the edits; Preview values were restored separately before deployment. No client ID, session secret, permissions, or Shopify payment settings were changed.

## Completed verification

- The new regression failed before the code fix with the same RSC error and local-only logout observed on production.
- With the fix, development browser tests passed for sign-in, logout/session clearing, and cart isolation when changing customer identity (3 tests).
- An isolated checkout using production's locked dependencies (Next.js 16.2.9) passed its production build and both account browser tests.
- In that isolated checkout, 47 targeted cart, callback, logout, checkout-route, and fake-provider tests passed. Targeted ESLint passed.
- After deployment, the actual Log out button returned the signed-in Gmail account to `https://www.teavision.com.au/account/login` without the prior RSC error.
- Clicking Sign in with Shopify then showed the email-entry screen instead of restoring the old account.
- The live OAuth request contained the corrected `https://www.teavision.com.au/account/callback` redirect.
- The user completed a fresh email-code sign-in as `franz@switchsupply.com` after logging out of `evangelistafranz@gmail.com`. The callback succeeded on the first attempt and returned to the correct production account dashboard.
- The new account's cart displayed `franz@switchsupply.com` as the confirmation email. No new warning/error console entries were recorded during the live login/logout check.
- The user explicitly approved: "Yes, accept terms and inspect only" for the current live store, stopping before payment or order submission.
- Standard Shopify hosted checkout displayed the new account, `franz@switchsupply.com`, with the same cart lines.
- The user completed Shop Pay's separate email verification. Its full checkout panel displayed `franz@switchsupply.com`, with no previous Gmail address. The account menu exposed Switch account and Check out as guest. No payment was submitted.
- Removed the temporary Aniseed Whole 50g item and confirmed "Your cart is empty". Organic Cold & Flu, which appeared during a separate workflow, was already absent when cleanup began; this verification did not remove it.

## Closure result

The reported stale-account behavior is resolved in the verified live flow: logout clears the prior account, a fresh sign-in succeeds, and the account dashboard, cart, standard Shopify checkout, and Shop Pay display the newly signed-in email. No closure checks remain within the approved inspection scope. The ticket itself has not been changed.

The user-approved real accounts are `franz@switchsupply.com` and `evangelistafranz@gmail.com` only. Live post-release verification switched from the Gmail account to the Switch Supply account and checked the displayed email through both checkout paths.

The earlier "verification failed" callback followed a prolonged sign-in flow. Pending authentication cookies expire after 600 seconds. Expiry is a plausible explanation, not a proven diagnosis. Fresh sign-in after the release succeeded on the first attempt. State and nonce validation remain unchanged.

No payment was submitted or order created by this verification. Actual order-confirmation email delivery was not tested; the approved scope was inspection of the displayed checkout identity before payment.
