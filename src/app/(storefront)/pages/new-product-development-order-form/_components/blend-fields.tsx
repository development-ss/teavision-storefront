'use client'

import { useState } from 'react'

import { FormLabel } from '@/components/ui/form-label'
import { Radio } from '@/components/ui/radio'
import { Textarea } from '@/components/ui/textarea'
import { TextInput } from '@/components/ui/text-input'
import {
  NPD_ORDER_LIMITS,
  npdBlendFieldName,
  type NpdBlendField,
} from '@/lib/contact/npd-order'

import { FlavourSelect } from './flavour-select'

type BlendFieldsProps = {
  index: number
}

export function BlendFields({ index }: BlendFieldsProps) {
  const [addFlavouring, setAddFlavouring] = useState<'YES' | 'NO' | ''>('')

  function fieldName(field: NpdBlendField) {
    return npdBlendFieldName(index, field)
  }

  return (
    <fieldset className="border-hairline-2 bg-paper rounded-lg border p-5 sm:p-6">
      <legend className="sr-only">Blend {index}</legend>
      <p aria-hidden="true" className="type-heading-04 text-ink">
        Blend {index}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor={`${fieldName('name')}-input`}>
            Blend name *
          </FormLabel>
          <TextInput
            id={`${fieldName('name')}-input`}
            name={fieldName('name')}
            type="text"
            required
            maxLength={NPD_ORDER_LIMITS.field}
            className="mt-2"
          />
        </div>

        <div>
          <FormLabel htmlFor={`${fieldName('profile')}-input`}>
            Blend profile
          </FormLabel>
          <Textarea
            id={`${fieldName('profile')}-input`}
            name={fieldName('profile')}
            rows={3}
            maxLength={NPD_ORDER_LIMITS.text}
            placeholder="Functional aim, taste profile, colour, target audience, caffeine level…"
            className="mt-2"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-10 gap-y-5">
        <div>
          <p className="type-mono-meta text-ink-faint">Certified organic</p>
          <div className="mt-3 flex gap-6">
            <label className="type-body-sm text-ink flex items-center gap-3">
              <Radio name={fieldName('organic')} value="YES" />
              <span>Yes</span>
            </label>
            <label className="type-body-sm text-ink flex items-center gap-3">
              <Radio name={fieldName('organic')} value="NO" />
              <span>No</span>
            </label>
          </div>
        </div>

        <div>
          <p className="type-mono-meta text-ink-faint">
            Add natural flavouring
            <span className="text-ink-soft normal-case">
              {' '}
              &mdash; adds around ~20% additional cost
            </span>
          </p>
          <div className="mt-3 flex gap-6">
            <label className="type-body-sm text-ink flex items-center gap-3">
              <Radio
                name={fieldName('flavouring')}
                value="YES"
                checked={addFlavouring === 'YES'}
                onChange={() => setAddFlavouring('YES')}
              />
              <span>Yes</span>
            </label>
            <label className="type-body-sm text-ink flex items-center gap-3">
              <Radio
                name={fieldName('flavouring')}
                value="NO"
                checked={addFlavouring === 'NO'}
                onChange={() => setAddFlavouring('NO')}
              />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>

      {addFlavouring === 'YES' ? (
        <FlavourSelect name={fieldName('flavours')} className="mt-5" />
      ) : null}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor={`${fieldName('ingredients')}-input`}>
            Ingredient suggestions
          </FormLabel>
          <Textarea
            id={`${fieldName('ingredients')}-input`}
            name={fieldName('ingredients')}
            rows={3}
            maxLength={NPD_ORDER_LIMITS.text}
            className="mt-2"
          />
        </div>

        <div>
          <FormLabel htmlFor={`${fieldName('aroma')}-input`}>
            Aroma suggestion
          </FormLabel>
          <Textarea
            id={`${fieldName('aroma')}-input`}
            name={fieldName('aroma')}
            rows={3}
            maxLength={NPD_ORDER_LIMITS.text}
            className="mt-2"
          />
        </div>

        <div>
          <FormLabel htmlFor={`${fieldName('flavourSuggestion')}-input`}>
            Flavour suggestion
          </FormLabel>
          <Textarea
            id={`${fieldName('flavourSuggestion')}-input`}
            name={fieldName('flavourSuggestion')}
            rows={3}
            maxLength={NPD_ORDER_LIMITS.text}
            className="mt-2"
          />
        </div>

        <div>
          <FormLabel htmlFor={`${fieldName('notes')}-input`}>
            Additional notes or requirements
          </FormLabel>
          <Textarea
            id={`${fieldName('notes')}-input`}
            name={fieldName('notes')}
            rows={3}
            maxLength={NPD_ORDER_LIMITS.text}
            className="mt-2"
          />
        </div>
      </div>
    </fieldset>
  )
}
