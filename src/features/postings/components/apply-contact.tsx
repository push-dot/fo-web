import type { Contact, ContactMissing } from '@push/api-client'
import { useState, type FormEvent, type InputHTMLAttributes } from 'react'

import { codeDigits, formatPhone, toE164, validPhone } from '../../auth'
import { contactPhoneSend, meSendContactEmail, meVerifyContactEmail, meVerifyContactPhone } from '../api/fetchers'
import ConfirmDialog from '../../../shared/ui/confirm-dialog'
import Dialog from '../../../shared/ui/dialog'
import Icon from '../../../shared/ui/icon'
import { APPLY_CLOSE } from '../utils/apply-copy'
import { CONTACT_CODE, CONTACT_CONFIRM, CONTACT_CTA, CONTACT_DONE, CONTACT_EMAIL, CONTACT_LEAD, CONTACT_PHONE, CONTACT_SEND, CONTACT_TAKEN_BODY, CONTACT_TAKEN_CLOSE, CONTACT_TAKEN_MOVE, CONTACT_TAKEN_TITLE, CONTACT_TITLE, CONTACT_USE_EMAIL, contactFailure, emailCodeSent, emailVerified, localPhone, movedToast, phoneMovable, validEmail } from '../utils/apply-contact'

type PartProps = {
  label: string
  done: string | null
  initial?: string
  input: InputHTMLAttributes<HTMLInputElement>
  format?: (value: string) => string
  valid: (value: string) => boolean
  sendLabel: (value: string) => string
  sentLead?: (value: string) => string
  onSend: (value: string) => Promise<boolean>
  onVerify: (value: string, code: string) => Promise<void>
}

const ContactPart = ({ label, done, initial = '', input, format = (value) => value, valid, sendLabel, sentLead, onSend, onVerify }: PartProps) => {
  const [value, setValue] = useState(initial)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (done !== null) {
    return (
      <div className="contact-done">
        <span className="contact-copy">
          <span className="c1 w7 t3">{label}</span>
          <span className="b2 w7">{done}</span>
        </span>
        <span className="badge ac">
          <Icon name="check" size={12} width={3} />
          {CONTACT_DONE}
        </span>
      </div>
    )
  }
  const run = async (task: () => Promise<void>) => {
    setError(null)
    setPending(true)
    try {
      await task()
    } catch (caught) {
      setError(contactFailure(caught))
    } finally {
      setPending(false)
    }
  }
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!valid(value) || pending) return
    void run(async () => {
      if (await onSend(value)) return
      setSentTo(value)
      setCode('')
    })
  }
  const verify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code.length !== 6 || pending || sentTo === null) return
    void run(() => onVerify(sentTo, code))
  }
  return (
    <div className="contact-part">
      <form className="contact-row" onSubmit={send}>
        <label className="field">
          {label}
          <input
            {...input}
            value={value}
            onChange={(event) => {
              const next = format(event.target.value)
              setValue(next)
              if (next !== sentTo) setSentTo(null)
            }}
          />
        </label>
        <button type="submit" className="btn sec" disabled={!valid(value) || pending}>
          {sendLabel(value)}
        </button>
      </form>
      {sentTo !== null ? (
        <form className="contact-row" onSubmit={verify}>
          <label className="field">
            {sentLead ? sentLead(sentTo) : null}
            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              placeholder={CONTACT_CODE}
              aria-label={CONTACT_CODE}
              onChange={(event) => setCode(codeDigits(event.target.value))}
            />
          </label>
          <button type="submit" className="btn pri" disabled={code.length !== 6 || pending}>
            {CONTACT_CONFIRM}
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="c1 red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const ApplyContact = ({
  contact,
  missing,
  onClose,
  onDone,
  onToast,
}: {
  contact: Contact | undefined
  missing: ContactMissing[]
  onClose: () => void
  onDone: () => Promise<void>
  onToast?: (message: string) => void
}) => {
  const [phone, setPhone] = useState(missing.includes('PHONE') ? null : localPhone(contact?.phone ?? ''))
  const [email, setEmail] = useState(missing.includes('EMAIL') ? null : (contact?.email ?? ''))
  const [taken, setTaken] = useState<{ phone: string; code: string } | null>(null)
  const [moving, setMoving] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const loginEmail = contact?.loginEmail ?? ''
  const verifyPhone = async (value: string, code: string) => {
    try {
      const result = await meVerifyContactPhone({ phone: toE164(value), code })
      setPhone(localPhone(result.phone))
    } catch (caught) {
      if (!phoneMovable(caught)) throw caught
      setTaken({ phone: value, code })
    }
  }
  const move = async () => {
    if (!taken) return
    setMoving(true)
    setMoveError(null)
    try {
      const result = await meVerifyContactPhone({ phone: toE164(taken.phone), code: taken.code, moveDocuments: true })
      setPhone(localPhone(result.phone))
      onToast?.(movedToast(result.moved ?? { documents: 0, files: 0 }))
    } catch (caught) {
      setMoveError(contactFailure(caught))
    } finally {
      setTaken(null)
      setMoving(false)
    }
  }
  const finish = async () => {
    setLeaving(true)
    try {
      await onDone()
    } finally {
      setLeaving(false)
    }
  }
  return (
    <>
      <Dialog label={CONTACT_TITLE} onClose={taken || leaving ? () => undefined : onClose} wide className="apply-sheet">
        <div className="apply-head">
          <span className="apply-title">
            <h2 className="h2">{CONTACT_TITLE}</h2>
            <p className="b2 t3">{CONTACT_LEAD}</p>
          </span>
          <button type="button" className="hbtn apply-close" aria-label={APPLY_CLOSE} disabled={leaving} onClick={onClose}>
            <Icon name="close" size={18} width={2.4} />
          </button>
        </div>
        <div className="contact-parts">
          <ContactPart
            label={CONTACT_PHONE}
            done={phone}
            input={{ type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', placeholder: '010-0000-0000' }}
            format={formatPhone}
            valid={validPhone}
            sendLabel={() => CONTACT_SEND}
            onSend={async (value) => {
              await contactPhoneSend(toE164(value))
              return false
            }}
            onVerify={verifyPhone}
          />
          {moveError ? (
            <p className="c1 red" role="alert">
              {moveError}
            </p>
          ) : null}
          <ContactPart
            label={CONTACT_EMAIL}
            done={email}
            initial={loginEmail}
            input={{ type: 'email', autoComplete: 'email', placeholder: 'name@example.com' }}
            format={(value) => value.trim()}
            valid={validEmail}
            sendLabel={(value) => (loginEmail && value === loginEmail ? CONTACT_USE_EMAIL : CONTACT_SEND)}
            sentLead={emailCodeSent}
            onSend={async (value) => {
              const sent = await meSendContactEmail(value)
              if (emailVerified(sent)) setEmail(sent.email)
              return emailVerified(sent)
            }}
            onVerify={async (value, code) => {
              const result = await meVerifyContactEmail(value, code)
              setEmail(result.email)
            }}
          />
        </div>
        <div className="sheet-actions apply-actions">
          <button type="button" className="btn pri" aria-busy={leaving} disabled={phone === null || email === null || leaving} onClick={() => void finish()}>
            {CONTACT_CTA}
          </button>
        </div>
      </Dialog>
      {taken ? (
        <ConfirmDialog
          title={CONTACT_TAKEN_TITLE}
          body={CONTACT_TAKEN_BODY}
          cancelLabel={CONTACT_TAKEN_CLOSE}
          confirmLabel={CONTACT_TAKEN_MOVE}
          busy={moving}
          onConfirm={() => void move()}
          onClose={() => {
            if (!moving) setTaken(null)
          }}
        />
      ) : null}
    </>
  )
}

export default ApplyContact
