import { Trash2 } from 'lucide-react'
import { dateLabel } from '../../lib/api'
import type { AdminComment } from '../../types'

type Props = { comments: AdminComment[]; onRemove: (id: string) => void }
export function AdminCommentsPage({ comments, onRemove }: Props) { return <div className="admin-table">{comments.length === 0 ? <p className="admin-empty">No comments yet.</p> : comments.map((comment) => <div className="comment-row" key={comment.id}><div><strong>{comment.author?.name || 'Reader'}</strong><small>{dateLabel(comment.createdAt)}</small><p>{comment.content}</p></div><button onClick={() => onRemove(comment.id)} aria-label="Delete comment"><Trash2 size={15} /></button></div>)}</div> }
