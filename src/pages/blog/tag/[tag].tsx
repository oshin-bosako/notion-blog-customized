import Link from 'next/link'
import Header from '../../../components/header'

import blogStyles from '../../../styles/blog.module.css'
import sharedStyles from '../../../styles/shared.module.css'

import {
  getBlogLink,
  getDateStr,
  postIsPublished,
  getTagLink,
  getTagName,
  getUpdateStr
} from '../../../lib/blog-helpers'
import { textBlock } from '../../../lib/notion/renderers'
import getNotionUsers from '../../../lib/notion/getNotionUsers'
import getBlogIndex from '../../../lib/notion/getBlogIndex'

export async function getStaticProps({ params: { tag }, preview }) {
  const postsTable = await getBlogIndex()

  const authorsToGet: Set<string> = new Set()
  const posts: any[] = Object.keys(postsTable)
    .map(slug => {
      const post = postsTable[slug]
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      post.Authors = post.Authors || []
      for (const author of post.Authors) {
        authorsToGet.add(author)
      }
      if (post.Tags.indexOf(tag) === -1) return null
      return post
    })
    .filter(Boolean)

  const { users } = await getNotionUsers([...authorsToGet])

  posts.map(post => {
    post.Authors = post.Authors.map(id => users[id].full_name)
  })

  return {
    props: {
      preview: preview || false,
      posts,
      tag,
    },
    revalidate: 10,
  }
}

// Return our list of blog posts to prerender
export async function getStaticPaths() {
  const postsTable = await getBlogIndex()
  let allTags: string[] = []
  Object.keys(postsTable).forEach(slug => {
    const post = postsTable[slug]
    // remove draft posts in production
    if (!postIsPublished(post)) {
      return null
    }
    allTags = allTags.concat(post.Tags)
  })
  allTags = allTags.filter((tag, index, orig) => orig.indexOf(tag) === index)

  return {
    paths: allTags.map(tag => getTagLink(tag)),
    fallback: true,
  }
}

export default ({ tag, posts = [], preview }) => {
  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
      <div className="tag_title">
        <h1>{getTagName(tag)}</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map(post => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              {post.cover ? (
                <img
                  src={`/api/asset?assetUrl=${encodeURIComponent(
                    post.cover.url as any
                  )}&blockId=${post.cover.blockId}`}
                  className={blogStyles.postPreviewCover}
                />
              ) : null}
              <h3>
                <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                  <div className={blogStyles.titleContainer}>
                    {!post.Published && (
                      <span className={blogStyles.draftBadge}>Draft</span>
                    )}
                    <a>{post.Page}</a>
                  </div>
                </Link>
              </h3>
              {post.Date && (
                <span className="posted">🕒{getDateStr(post.Date)}</span>
              )}
              {post.Update && (
                <span className="posted">🔄{getUpdateStr(post.Update)}</span>
              )}
              {post.Tags &&
                post.Tags.length > 0 &&
                post.Tags.map(tag => (
                  <Link href="/blog/tag/[tag]" as={getTagLink(tag)} key={getTagLink(tag)}>
                    <span className={blogStyles.tag}>{getTagName(tag)}</span>
                  </Link>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}