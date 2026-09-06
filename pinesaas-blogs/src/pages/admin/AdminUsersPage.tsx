import { Trash2 } from 'lucide-react'
import type { AdminUser } from '../../types'

type Props = { users: AdminUser[]; onRole: (user: AdminUser, role: string) => void; onRemove: (id: string) => void }
export function AdminUsersPage({ users, onRole, onRemove }: Props) { return <div className="admin-table">{users.map((user) => <div className="user-row" key={user.id}><div className="user-avatar">{user.name.charAt(0)}</div><div className="user-info"><strong>{user.name}</strong><span>{user.email}</span></div><span>{user._count?.blogs || 0} stories · {user._count?.comments || 0} comments</span><select value={user.role} onChange={(event) => onRole(user, event.target.value)}><option value="user">Reader</option><option value="admin">Admin</option></select><button onClick={() => onRemove(user.id)} aria-label={`Delete ${user.name}`}><Trash2 size={15} /></button></div>)}</div> }
