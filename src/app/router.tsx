import { useState, type ComponentType } from 'react'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { isWebView } from '../shared/lib/bridge'
import PostingPage from '../pages/posting/posting-page'
import ProfilePage from '../pages/profile/profile-page'
import type { LegalKind } from '../pages/legal/constants'
import RequireAuth from './require-auth'
import RouteError from './route-error'
import WebViewNotFound from './web-view-not-found'
import ScrollRoot from './scroll-root'

type Loaded = Promise<{ default: ComponentType }>

const page = (load: () => Loaded) => async () => ({ Component: (await load()).default })

const legal = (kind: LegalKind) => async () => {
  const { default: LegalPage } = await import('../pages/legal/legal-page')
  return { Component: () => <LegalPage kind={kind} /> }
}

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
        <Route lazy={page(() => import('./shell'))}>
          <Route path="/" lazy={page(() => import('../pages/home/home-page'))} />
          <Route path="/jobs" lazy={page(() => import('../pages/jobs/jobs-page'))} />
          <Route path="/search" lazy={page(() => import('../pages/search/search-page'))} />
          <Route path="/login" lazy={page(() => import('../pages/login/login-page'))} />
          <Route path="/signup" lazy={page(() => import('../pages/login/signup-page'))} />
          <Route path="/auth/callback" lazy={page(() => import('../pages/login/callback-page'))} />
          <Route path="/auth/verify" lazy={page(() => import('../pages/login/verify-page'))} />
          <Route path="/auth/reset" lazy={page(() => import('../pages/login/reset-page'))} />
          <Route path="/invites/:token" lazy={page(() => import('../pages/employer/invite-page'))} />
          <Route path="/postings/:id" element={<PostingPage />} />
          <Route path="/terms" lazy={legal('terms')} />
          <Route path="/privacy" lazy={legal('privacy')} />
          <Route path="/privacy-consent" lazy={legal('privacyConsent')} />
          <Route path="/marketing-consent" lazy={legal('marketingConsent')} />
          <Route element={<RequireAuth />}>
            <Route path="/profiles/:id" element={<ProfilePage />} />
            <Route path="/hub" lazy={page(() => import('../pages/hub/hub-page'))} />
            <Route path="/social" lazy={page(() => import('../pages/social/social-page'))} />
            <Route path="/posts/:id" lazy={page(() => import('../pages/social/post-page'))} />
            <Route path="/me" lazy={page(() => import('../pages/my/my-page'))} />
            <Route path="/offers" lazy={page(() => import('../pages/offers/offers-page'))} />
            <Route path="/offers/:id" lazy={page(() => import('../pages/offers/offer-detail-page'))} />
            <Route path="/notifications" lazy={page(() => import('../pages/notifications/notifications-page'))} />
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
          <Route path="*" lazy={page(() => import('../pages/not-found/not-found-page'))} />
        </Route>
      </Route>
    ),
  )

const AppRouter = () => {
  const [router] = useState(() => createBrowserRouter(appRoutes(isWebView())))
  return <RouterProvider router={router} />
}

export default AppRouter
