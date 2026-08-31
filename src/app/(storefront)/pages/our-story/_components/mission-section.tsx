import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

import { STORY_VALUES } from '../_lib/data'
import { SectionHeading } from './section-heading'
import { StoryValuesAccordion } from './story-values-accordion'

export function MissionSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Mindfulness · Sincerity · Wholesomeness"
          title="Our Mission &"
          highlight="Core Values"
          copy="Teavision is committed to making tea more than just a drink — it's a way to inspire health, mindfulness, and connection. Our five core values guide everything we do as leading wholesale tea suppliers."
        />

        <Card overflow="hidden" radius="lg">
          <StoryValuesAccordion values={STORY_VALUES} />
        </Card>
      </Section.Container>
    </Section.Root>
  )
}
