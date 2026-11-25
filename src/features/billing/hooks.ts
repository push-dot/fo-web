import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { settleTossReturn } from './api/fetchers'
import {
  EMPLOYER_PLAN_CARDS,
  TOSS_RETURN_PARAMS,
  tossReturn,
} from './utils/employer-plans'
import { TOPUP_DONE, planConfirmError, planPaid } from './constants'

type Failed = { code: string | null; message: string | null }

export const useTossReturn = (showToast: (message: string) => void) => {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const handled = useRef<string | null>(null)
  const [failed, setFailed] = useState<Failed | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const back = tossReturn(params)
  const key = back ? params.toString() : null

  useEffect(() => {
    if (!back || handled.current === key) return
    handled.current = key
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const name of TOSS_RETURN_PARAMS) next.delete(name)
        return next
      },
      { replace: true },
    )
    if (back.kind === 'fail') {
      setFailed({ code: back.code, message: back.message })
      return
    }
    setFailed(null)
    setConfirmError(null)
    settleTossReturn(back)
      .then(async (done) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['billing'] }),
          queryClient.invalidateQueries({ queryKey: ['company', 'me'] }),
        ])
        showToast(
          done.kind === 'topup'
            ? TOPUP_DONE
            : planPaid(EMPLOYER_PLAN_CARDS.find((card) => card.id === done.planId)?.name),
        )
      })
      .catch((error: unknown) => setConfirmError(planConfirmError(error)))
  }, [back, key, queryClient, setParams, showToast])

  return {
    failed,
    confirmError,
    clear: () => {
      setFailed(null)
      setConfirmError(null)
    },
  }
}
