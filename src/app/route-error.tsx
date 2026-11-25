import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { isWebView } from '../shared/lib/bridge'
import ErrorScreen from './error-screen'

const RouteError = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  useEffect(() => console.error(error), [error])
  return (
    <ErrorScreen
      onHome={isWebView() ? undefined : () => navigate('/')}
      onRetry={() => window.location.reload()}
    />
  )
}

export default RouteError
