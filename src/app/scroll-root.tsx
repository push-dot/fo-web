import { Outlet, ScrollRestoration } from 'react-router-dom'

const ScrollRoot = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

export default ScrollRoot
