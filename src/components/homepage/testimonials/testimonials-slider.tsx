'use client'

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { ToggleButton } from '@/components/ui/toggle-button'

type TestimonialsSliderProps = {
  children: ReactNode
  slideCount: number
}

export function TestimonialsSlider({
  children,
  slideCount,
}: TestimonialsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [activeIndex, setActiveIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return

    setActiveIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        emblaApi.scrollPrev()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        emblaApi.scrollNext()
      }
    },
    [emblaApi],
  )

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi],
  )

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div
      className="focus-visible:ring-ring focus-visible:ring-offset-ink mt-8 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials, use left and right arrow keys to move between testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        ref={emblaRef}
        className="cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div className="-ml-4 flex items-start">{children}</div>
      </div>

      <div className="mt-7 flex justify-center">
        <div
          className="flex h-1.5 w-28 gap-1.5"
          aria-label="Choose testimonial"
        >
          {Array.from({ length: slideCount }, (_, index) => (
            <ToggleButton
              key={index}
              variant="dot"
              pressed={index === activeIndex}
              aria-label={`Show testimonial ${index + 1}`}
              className="border-paper/25 bg-paper/10 hover:border-gold/60 focus-visible:ring-offset-ink aria-pressed:border-gold aria-pressed:bg-gold"
              onClick={() => scrollTo(index)}
            >
              <span className="sr-only">Show testimonial {index + 1}</span>
            </ToggleButton>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Testimonial {activeIndex + 1} of {slideCount}
        </p>
      </div>
    </div>
  )
}
