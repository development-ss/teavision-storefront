import { createServer } from 'node:http'

import { afterAll, describe, expect, test } from 'vitest'

import { createFakeCustomerAccountApiServer } from '@/tests/mocks/customer-account-api-server'

describe('Customer Account API test infrastructure smoke test', () => {
  let closeServer: (() => Promise<void>) | undefined

  afterAll(async () => {
    await closeServer?.()
  })

  test('serves discovery, token exchange, and customer viewer GraphQL', async () => {
    const server = await createFakeCustomerAccountApiServer()
    closeServer = server.close

    const openIdResponse = await fetch(
      `${server.url}/.well-known/openid-configuration`,
    )
    await expect(openIdResponse.json()).resolves.toMatchObject({
      authorization_endpoint: `${server.url}/authentication/oauth/authorize`,
      token_endpoint: `${server.url}/authentication/oauth/token`,
    })

    const customerApiResponse = await fetch(
      `${server.url}/.well-known/customer-account-api`,
    )
    await expect(customerApiResponse.json()).resolves.toMatchObject({
      customer_account_api_endpoint: `${server.url}/customer-account/graphql`,
    })

    const tokenResponse = await fetch(
      `${server.url}/authentication/oauth/token`,
      {
        method: 'POST',
        headers: {
          Origin: 'https://example.test',
          'User-Agent': 'Teavision test',
        },
        body: new URLSearchParams({
          client_id: 'test-client-id',
          code: 'valid-code',
          code_verifier: 'valid-verifier',
          grant_type: 'authorization_code',
          redirect_uri: 'https://example.test/account/callback',
        }),
      },
    )
    await expect(tokenResponse.json()).resolves.toMatchObject({
      access_token: 'customer-access-token-valid-code',
      refresh_token: 'customer-refresh-token-valid-code',
    })

    const viewerResponse = await fetch(
      `${server.url}/customer-account/graphql`,
      {
        method: 'POST',
        headers: { Authorization: 'customer-access-token-valid-code' },
        body: JSON.stringify({
          operationName: 'CustomerAccountViewer',
          query:
            'query CustomerAccountViewer { customer { id emailAddress { emailAddress } } }',
        }),
      },
    )
    const payload = (await viewerResponse.json()) as {
      data: { customer: { emailAddress: { emailAddress: string } } }
    }

    expect(payload.data.customer.emailAddress.emailAddress).toBe(
      'avery@example.test',
    )
  })

  test('avoids fetch-blocked ports when starting the fake server', async () => {
    const server = await createFakeCustomerAccountApiServer({ port: 6000 })

    try {
      expect(server.url).not.toBe('http://127.0.0.1:6000')

      const response = await fetch(
        `${server.url}/.well-known/openid-configuration`,
      )

      expect(response.ok).toBe(true)
    } finally {
      await server.close()
    }
  })

  test('rejects when an explicit non-blocked port is occupied', async () => {
    const occupiedServer = createServer()

    await new Promise<void>((resolve) => {
      occupiedServer.listen(0, '127.0.0.1', resolve)
    })

    const address = occupiedServer.address()

    try {
      if (typeof address === 'string' || address === null) {
        throw new Error('Unable to allocate occupied test port')
      }

      await expect(
        createFakeCustomerAccountApiServer({ port: address.port }),
      ).rejects.toMatchObject({ code: 'EADDRINUSE' })
    } finally {
      await new Promise<void>((resolve, reject) => {
        occupiedServer.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    }
  }, 1000)
})
