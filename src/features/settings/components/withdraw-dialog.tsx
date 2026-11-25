import { ApiError } from '../api'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSignOut } from '../../auth'
import { meDeleteAccount } from '../api/fetchers'
import ConfirmDialog from '../../../shared/ui/confirm-dialog'
import Icon from '../../../shared/ui/icon'
import { ADMIN_TRANSFER, DELETE_FAILED, DELETE_RETENTION, DELETE_SUBSCRIPTION, REAUTH, WITHDRAW_CONFIRM, WITHDRAW_TITLE } from '../constants'

const WithdrawDialog = ({ subscriptionNote, onClose }: { subscriptionNote: boolean; onClose: () => void }) => {
  const navigate = useNavigate()
  const signOut = useSignOut()
  const [failed, setFailed] = useState(false)
  const [adminBlocked, setAdminBlocked] = useState(false)
  const [reauth, setReauth] = useState(false)
  const withdraw = useMutation({
    mutationFn: () => meDeleteAccount(),
    onSuccess: () => signOut({ revoke: false }),
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'ADMIN_TRANSFER_REQUIRED') setAdminBlocked(true)
      else if (error instanceof ApiError && error.code === 'REAUTH_REQUIRED') setReauth(true)
      else setFailed(true)
    },
  })
  if (reauth) {
    return (
      <ConfirmDialog
        title={REAUTH.title}
        body={REAUTH.body}
        cancelLabel={REAUTH.close}
        confirmLabel={REAUTH.action}
        onConfirm={() => void signOut()}
        onClose={onClose}
      />
    )
  }
  if (adminBlocked) {
    return (
      <ConfirmDialog
        title={ADMIN_TRANSFER.title}
        body={ADMIN_TRANSFER.body}
        cancelLabel={ADMIN_TRANSFER.close}
        confirmLabel={ADMIN_TRANSFER.action}
        onConfirm={() => navigate('/employer/members')}
        onClose={onClose}
      />
    )
  }
  return (
    <ConfirmDialog
      title={WITHDRAW_TITLE}
      danger
      busy={withdraw.isPending}
      confirmLabel={WITHDRAW_CONFIRM}
      onConfirm={() => withdraw.mutate()}
      onClose={onClose}
      body={
        <div className="withdraw-body">
          {subscriptionNote ? (
            <p className="withdraw-warn">
              <Icon name="warn" size={20} />
              <span className="b2">{DELETE_SUBSCRIPTION}</span>
            </p>
          ) : null}
          <p>{DELETE_RETENTION}</p>
          {failed ? (
            <p className="auth-error" role="alert">
              {DELETE_FAILED}
            </p>
          ) : null}
        </div>
      }
    />
  )
}

export default WithdrawDialog
