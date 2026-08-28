import { LoginPanel } from '../_components/login-panel'
import { getAccountLoginStartHref } from '../_lib/return-path'

export default function LoginLoading() {
  return (
    <div className="min-h-136 md:min-h-128">
      <LoginPanel loginHref={getAccountLoginStartHref(null)} />
    </div>
  )
}
