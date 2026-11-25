import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  meOffers,
  meOffer,
  meOfferMessages,
  meAcceptOffer,
  meArchiveOffer,
  meBlockUser,
  meDeclineOffer,
  meReportOffer,
  meSendOfferMessage,
  meUnarchiveOffer,
} from './fetchers'
import type { Offer } from '@push/api-client'
import { OFFER_MENU_COPY, offerMenu, type OfferBox, type OfferMenuKey } from '@push/shared'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { useToast } from '../../../shared/ui/toast'
import { OFFER_ACCEPTED, OFFER_DECLINED } from '../constants'
import { blockedSend, type ThreadEntry } from '../utils/thread-entries'
import { offerToast, type OfferToast } from '../utils/offer-toast'

export const useOffers = (box: 'received' | 'sent', enabled = true) =>
  useQuery({ queryKey: ['offers', box], queryFn: () => meOffers(box), enabled })

export const useArchivedOffers = (enabled = true) =>
  useQuery({
    queryKey: ['offers', 'archived'],
    queryFn: () => meOffers('received', { archived: 1 }),
    enabled,
  })

export const useOffer = (id: string | undefined) =>
  useQuery({ queryKey: ['offer', id], queryFn: () => meOffer(id ?? ''), enabled: Boolean(id) })

export const useOfferMessages = (id: string | undefined) =>
  useQuery({
    queryKey: ['offer-messages', id],
    queryFn: () => meOfferMessages(id ?? ''),
    enabled: Boolean(id),
  })

type Show = ReturnType<typeof useToast>['show']

export const useOfferActions = (offer: Offer, box: OfferBox, listPath: string, show: Show) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [blocked, setBlocked] = useState<ThreadEntry[]>([])
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['offers'] }),
      queryClient.invalidateQueries({ queryKey: ['offer', offer.id] }),
      queryClient.invalidateQueries({ queryKey: ['offer-messages', offer.id] }),
    ])
  const toast = ({ message, tone, action }: OfferToast) =>
    show(message, {
      tone: tone ?? 'ok',
      action: action && {
        label: action.label,
        onClick: () => {
          show(null)
          action.onClick()
        },
      },
    })
  const failed = () => {
    toast({ message: OFFER_MENU_COPY.failed, tone: 'err' })
    void refresh()
  }
  const responded = (message: string) => async () => {
    toast({ message })
    await refresh()
  }
  const accept = useMutation({
    mutationFn: () => meAcceptOffer(offer.id),
    onSuccess: responded(OFFER_ACCEPTED),
    onError: failed,
  })
  const decline = useMutation({
    mutationFn: () => meDeclineOffer(offer.id),
    onSuccess: responded(OFFER_DECLINED),
    onError: failed,
  })
  const send = useMutation({
    mutationFn: (body: string) => meSendOfferMessage(offer.id, body),
    onSuccess: refresh,
    onError: (error, body) => {
      const entry = blockedSend(error, body)
      if (!entry) return failed()
      setBlocked((list) => [...list, entry])
      void refresh()
    },
  })
  const menu = useMutation({
    mutationFn: (key: Exclude<OfferMenuKey, 'profile'>) =>
      offerMenu(offer, box, {
        archive: meArchiveOffer,
        unarchive: meUnarchiveOffer,
        report: meReportOffer,
        block: meBlockUser,
        refresh,
        back: () => navigate(listPath),
        toast: (t) => toast(offerToast(t)),
      })[key](),
  })
  return { accept, decline, send, menu, blocked }
}
