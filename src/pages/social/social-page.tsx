import type { PostCategory } from '@push/api-client'
import { POST_CATEGORIES, authorLabel, postCategoryLabel, usePostPages, composerPrompt, AuthorAvatar, ComposerSheet, COMPOSER_ACTION, PostCard, usePopularPosts, useViewerAuthor } from '../../features/social'
import { LegendList } from '@legendapp/list/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { compactCount } from '../../shared/lib/format'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock from '../../shared/ui/state-block'
import ErrorState from '../../shared/ui/error-state'
import { POPULAR_TITLE, POST_PAGE_SIZE, SOCIAL_EMPTY, SOCIAL_ERROR, SOCIAL_RETRY, SOCIAL_TITLE } from './constants'

const POST_CARD_HEIGHT = 170

const SocialPage = () => {
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [composing, setComposing] = useState(false)
  const listQuery = usePostPages(category, POST_PAGE_SIZE)
  const popular = usePopularPosts().data ?? []
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const viewer = useViewerAuthor()
  const empty = !listQuery.isLoading && !listQuery.isError && items.length === 0
  return (
    <main className="page social-layout">
      <div className="social-side">
        <h1 className="h1">{SOCIAL_TITLE}</h1>
        <nav className="social-cats" aria-label="소셜 카테고리">
          {POST_CATEGORIES.map((item) => (
            <button key={item.label} type="button" className={category === item.key ? 'side-link on' : 'side-link'} aria-pressed={category === item.key} onClick={() => setCategory(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="feed social-feed">
        {empty ? null : (
          <button type="button" className="box composer" onClick={() => setComposing(true)}>
            <AuthorAvatar author={viewer} size={40} />
            <span className="b1 t4 composer-prompt">{composerPrompt(viewer.employer === true, authorLabel(viewer))}</span>
            <span className="btn pri sm">{COMPOSER_ACTION}</span>
          </button>
        )}
        <div className="post-list">
          <LegendList
            useWindowScroll
            recycleItems
            data={items}
            estimatedItemSize={POST_CARD_HEIGHT}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => <PostCard post={item} />}
            onEndReachedThreshold={1.5}
            onEndReached={() => {
              if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) void listQuery.fetchNextPage()
            }}
          />
        </div>
        {listQuery.isLoading ? <Skeleton rows={3} /> : null}
        {listQuery.isError ? <ErrorState title={SOCIAL_ERROR} retryLabel={SOCIAL_RETRY} onRetry={() => void listQuery.refetch()} /> : null}
        {empty ? (
          <StateBlock
            icon="pencil"
            title={SOCIAL_EMPTY}
            action={
              <button type="button" className="btn pri sm" onClick={() => setComposing(true)}>
                {COMPOSER_ACTION}
              </button>
            }
          />
        ) : null}
      </div>
      {popular.length > 0 ? (
        <aside className="popular card">
          <h2 className="b2 w7">{POPULAR_TITLE}</h2>
          {popular.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="popular-row">
              <span className="b2 cap">{post.title}</span>
              <span className="c1 t3">{`${postCategoryLabel(post.category)} · 조회 ${compactCount(post.viewCount)}`}</span>
            </Link>
          ))}
        </aside>
      ) : null}
      {composing ? <ComposerSheet initialCategory={category} onClose={() => setComposing(false)} /> : null}
    </main>
  )
}

export default SocialPage
