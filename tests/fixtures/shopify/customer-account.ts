import type {
  CustomerAccountAddress,
  CustomerAccountOrder,
  CustomerAccountProfile,
  CustomerAccountUserError,
} from '@/lib/shopify/customer-account/types'

import { makeMoney } from './money'

export function makeCustomerAccountAddress(
  overrides: Partial<CustomerAccountAddress> = {},
): CustomerAccountAddress {
  return {
    id: 'gid://shopify/CustomerAddress/test-address-1',
    firstName: 'Avery',
    lastName: 'Nguyen',
    address1: '12 Market Lane',
    address2: 'Suite 4',
    city: 'Melbourne',
    provinceCode: 'VIC',
    zip: '3000',
    countryCodeV2: 'AU',
    phone: '+61 400 000 000',
    formatted: ['Avery Nguyen', '12 Market Lane', 'Melbourne VIC 3000'],
    ...overrides,
  }
}

export function makeCustomerAccountOrder(
  overrides: Partial<CustomerAccountOrder> = {},
): CustomerAccountOrder {
  return {
    id: 'gid://shopify/Order/test-order-1',
    name: '#TV1001',
    processedAt: '2026-06-01T04:20:00Z',
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    totalPrice: makeMoney('148.50'),
    lineItems: [
      {
        title: 'Organic Sencha',
        quantity: 2,
        unitPrice: makeMoney('49.50'),
        totalPrice: makeMoney('99.00'),
      },
    ],
    shippingAddress: makeCustomerAccountAddress(),
    fulfillments: [
      {
        trackingCompany: 'Australia Post',
        trackingInfo: [
          {
            number: 'TRACK123',
            url: 'https://tracking.test/TRACK123',
          },
        ],
      },
    ],
    statusPageUrl: 'https://checkout.test/orders/test-order-1',
    ...overrides,
  }
}

export function makeCustomerAccountProfile(
  overrides: Partial<CustomerAccountProfile> = {},
): CustomerAccountProfile {
  const defaultAddress = makeCustomerAccountAddress()

  return {
    id: 'gid://shopify/Customer/test-customer-1',
    emailAddress: 'avery@example.test',
    firstName: 'Avery',
    lastName: 'Nguyen',
    defaultAddress,
    addresses: [
      defaultAddress,
      makeCustomerAccountAddress({
        id: 'gid://shopify/CustomerAddress/test-address-2',
        address1: '45 Tea Street',
        city: 'Sydney',
        provinceCode: 'NSW',
        zip: '2000',
        formatted: ['Avery Nguyen', '45 Tea Street', 'Sydney NSW 2000'],
      }),
    ],
    orders: [makeCustomerAccountOrder()],
    ...overrides,
  }
}

export function makeCustomerAccountUserError(
  field: string[],
  message: string,
): CustomerAccountUserError {
  return { field, message }
}
