import type { Settings } from '@push/api-client'
import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { accessModeMutation } from '../api/hooks'

const settings = { aiAccessMode: 'AUTO' } as Settings

const setup = () => {
  const client = new QueryClient()
  client.setQueryData(['settings'], settings)
  const options = accessModeMutation(client, async () => settings)
  return { client, options }
}

describe('access mode save', () => {
  it('shows the picked mode at once', async () => {
    const { client, options } = setup()
    await options.onMutate('ALWAYS_ASK')
    expect(client.getQueryData<Settings>(['settings'])?.aiAccessMode).toBe('ALWAYS_ASK')
  })

  it('puts the saved mode back when the save fails', async () => {
    const { client, options } = setup()
    const context = await options.onMutate('ALWAYS_ASK')
    options.onError(new Error('x'), 'ALWAYS_ASK', context)
    expect(client.getQueryData<Settings>(['settings'])?.aiAccessMode).toBe('AUTO')
  })

  it('takes the server copy on success', async () => {
    const { client, options } = setup()
    await options.onMutate('ALWAYS_ASK')
    options.onSuccess({ aiAccessMode: 'ALWAYS_ASK' } as Settings)
    expect(client.getQueryData<Settings>(['settings'])?.aiAccessMode).toBe('ALWAYS_ASK')
  })
})
