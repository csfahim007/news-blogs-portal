import { ArrowLeft, ArrowUpRight, LogIn } from 'lucide-react'
import { type SyntheticEvent, useEffect, useState } from 'react'
import { dateLabel, getJson, sendJson, SESSION_ID } from '../lib/api'
import type { Comment, Story } from '../types'
import { StoryImage } from '../components/StoryImage'

type BlogDetailPageProps = { slug: string; authToken: string; authName: string; onOpenAuth: () => void }

export function BlogDetailPage({ slug, authToken, authName, onOpenAuth }: BlogDetailPageProps) {
  const [story, setStory] = useState<Story | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getJson<Story>(`/blogs/slug/${encodeURIComponent(slug)}`)
      .then((result) => {
        if (mounted) {
          setStory(result)
          setComments((result as Story & { comments?: Comment[] }).comments || [])
        }
      })
      .catch((requestError: Error) => mounted && setError(requestError.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [slug])

  useEffect(() => {
    if (!story) return
    sendJson(`/blogs/${story.id}/view`, { method: 'POST', body: JSON.stringify({ sessionId: SESSION_ID, duration: 1, scrolled: false }) }).catch(() => undefined)
  }, [story])

  const addComment = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentText.trim() || !authToken || !story) return
    try {
      const created = await sendJson<Comment>('/comments', { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ blogId: story.id, content: commentText.trim() }) })
      setComments((items) => [created, ...items])
      setCommentText('')
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Comment could not be added.') }
  }

  if (loading) return <div className="state-panel"><span className="loader" /> Loading story...</div>
  if (error || !story) return <div className="state-panel error-state"><p>{error || 'Story not found.'}</p><a className="text-button" href="/">Back to journal <ArrowLeft size={15} /></a></div>

  return <article className="reader detail-page"><a className="back-link" href="/"><ArrowLeft size={16} /> Back to journal</a><div className="reader-kicker">{story.category?.name || 'PineSaaS journal'} / {dateLabel(story.createdAt)}</div><h1>{story.title}</h1><StoryImage story={story} className="reader-image" eager /><p className="reader-excerpt">{story.excerpt}</p><div className="reader-content">{story.content ? story.content.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>This story is ready to be connected to its full content from the publication API.</p>}</div><section className="comments"><div className="comments-heading"><h2>Conversation</h2><span>{comments.length} comments</span></div>{comments.length === 0 ? <p className="comment-muted">Be the first to add a thoughtful note.</p> : comments.map((comment) => <div className="comment" key={comment.id}><strong>{comment.author?.name || 'Reader'}</strong><small>{dateLabel(comment.createdAt)}</small><p>{comment.content}</p></div>)}{authToken ? <form className="comment-form" onSubmit={addComment}><p className="signed-in">Signed in as {authName || 'reader'}</p><textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add to the conversation" rows={3} required /><button className="outline-button" type="submit">Post comment <ArrowUpRight size={15} /></button></form> : <div className="comment-login-prompt"><p className="comment-muted">Sign in to join the conversation.</p><button className="text-button" onClick={onOpenAuth}>Open account sign in <LogIn size={15} /></button></div>}{error && <p className="comment-error">{error}</p>}</section></article>
}