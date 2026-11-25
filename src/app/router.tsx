import { useState, type ComponentType } from 'react'
import {
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import { isWebView } from '../shared/lib/bridge'
import CallbackPage from '../pages/login/callback-page'
import LoginPage from '../pages/login/login-page'
import ResetPage from '../pages/login/reset-page'
import SignupPage from '../pages/login/signup-page'
import EmailVerifyPage from '../pages/login/verify-page'
import HomePage from '../pages/home/home-page'
import HubPage from '../pages/hub/hub-page'
import JobsPage from '../pages/jobs/jobs-page'
import NotificationsPage from '../pages/notifications/notifications-page'
import PostingPage from '../pages/posting/posting-page'
import ProfilePage from '../pages/profile/profile-page'
import SearchPage from '../pages/search/search-page'
import PostPage from '../pages/social/post-page'
import SocialPage from '../pages/social/social-page'
import type { LegalKind } from '../pages/legal/constants'
import NotFoundPage from '../pages/not-found/not-found-page'
import RequireAuth from './require-auth'
import { RouteError, WebViewNotFound } from './route-error'
import Shell from './shell'

type Loaded = Promise<{ default: ComponentType }>

const page = (load: () => Loaded) => async () => ({ Component: (await load()).default })

const legal = (kind: LegalKind) => async () => {
  const { default: LegalPage } = await import('../pages/legal/legal-page')
  return { Component: () => <LegalPage kind={kind} /> }
}

export const ScrollRoot = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

export const appRoutes = (webView: boolean) =>
  createRoutesFromElements(
    webView ? (
      <Route element={<ScrollRoot />} errorElement={<RouteError />}>
        <Route path="/postings/:id" element={<PostingPage />} />
        <Route path="/profiles/:id" element={<ProfilePage />} />
        <Route path="*" element={<WebViewNotFound />} />
      </Route>
    ) : (
      <Route element={<ScrollRoot />} errorElement={<RouteError />}>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />
          <Route path="/auth/verify" element={<EmailVerifyPage />} />
          <Route path="/auth/reset" element={<ResetPage />} />
          <Route path="/invites/:token" lazy={page(() => import('../pages/employer/invite-page'))} />
          <Route path="/postings/:id" element={<PostingPage />} />
          <Route path="/terms" lazy={legal('terms')} />
          <Route path="/privacy" lazy={legal('privacy')} />
          <Route path="/privacy-consent" lazy={legal('privacyConsent')} />
          <Route path="/marketing-consent" lazy={legal('marketingConsent')} />
          <Route element={<RequireAuth />}>
            <Route path="/profiles/:id" element={<ProfilePage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/me" lazy={page(() => import('../pages/my/my-page'))} />
            <Route path="/offers" lazy={page(() => import('../pages/offers/offers-page'))} />
            <Route path="/offers/:id" lazy={page(() => import('../pages/offers/offer-detail-page'))} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" lazy={page(() => import('../pages/settings/settings-page'))} />
            <Route path="/settings/blocked" lazy={page(() => import('../pages/settings/blocked-page'))} />
            <Route path="/employer/verify" lazy={page(() => import('../pages/employer/verify-page'))} />
            <Route path="/employer/postings" lazy={page(() => import('../pages/employer/postings-page'))} />
            <Route path="/employer/postings/new" lazy={page(() => import('../pages/employer/posting-editor-page'))} />
            <Route path="/employer/postings/:id/edit" lazy={page(() => import('../pages/employer/posting-editor-page'))} />
            <Route path="/employer/postings/:id/applicants" lazy={page(() => import('../pages/employer/applicants-page'))} />
            <Route
              path="/employer/postings/:id/applicants/:applicationId"
              lazy={page(() => import('../pages/employer/applicant-page'))}
            />
            <Route path="/employer/chat" lazy={page(() => import('../pages/employer/chat-page'))} />
            <Route path="/employer/chat/new" lazy={page(() => import('../pages/employer/chat-new-page'))} />
            <Route path="/employer/chat/:id" lazy={page(() => import('../pages/employer/chat-thread-page'))} />
            <Route path="/employer/members" lazy={page(() => import('../pages/employer/members-page'))} />
            <Route path="/employer/plans" lazy={page(() => import('../pages/employer/plans-page'))} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    ),
  )

const AppRouter = () => {
  const [router] = useState(() => createBrowserRouter(appRoutes(isWebView())))
  return <RouterProvider router={router} />
}

export default AppRouter
