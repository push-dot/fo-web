import AppleMark from '../../../shared/ui/apple-mark'
import GithubMark from '../../../shared/ui/github-mark'
import GoogleMark from '../../../shared/ui/google-mark'
import Icon from '../../../shared/ui/icon'
import type { ButtonProvider } from '../types'

const ProviderMark = ({ provider }: { provider: ButtonProvider }) => {
  if (provider === 'google') return <GoogleMark />
  if (provider === 'apple') return <AppleMark />
  if (provider === 'github') return <GithubMark />
  return <Icon name="phone" size={22} />
}

export default ProviderMark
