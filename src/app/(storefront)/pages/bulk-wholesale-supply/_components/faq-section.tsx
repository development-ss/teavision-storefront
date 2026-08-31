import { Faq } from '@/components/homepage/faq'

import { FAQ_ITEMS } from '../_lib/data'

const faqItems = FAQ_ITEMS.map((item) => ({
  question: item.question,
  answer: item.answer,
}))

export function FaqSection() {
  return <Faq items={faqItems} spacing="none" />
}
