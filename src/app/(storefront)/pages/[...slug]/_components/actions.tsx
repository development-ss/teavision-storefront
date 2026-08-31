import { Button } from '@/components/ui/button'

import type { PageProfile } from '../_lib/page-profile'

type ActionsProps = {
  currentPath: string
  profile: PageProfile
}

export function Actions({ currentPath, profile }: ActionsProps) {
  const secondaryAction =
    profile.secondaryAction.href === currentPath
      ? null
      : profile.secondaryAction

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button href={profile.primaryAction.href} className="w-full sm:w-auto">
        {profile.primaryAction.label}
      </Button>
      {secondaryAction ? (
        <Button
          href={secondaryAction.href}
          variant="inverseSecondary"
          className="w-full sm:w-auto"
        >
          {secondaryAction.label}
        </Button>
      ) : null}
    </div>
  )
}
