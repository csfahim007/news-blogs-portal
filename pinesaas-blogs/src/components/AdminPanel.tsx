import { ShieldCheck, X } from 'lucide-react'
import { type SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { getJson, sendJson } from '../lib/api'
import type { AdminComment, AdminUser, Category, ContentForm, Story, StoryResponse } from '../types'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminCommentsPage } from '../pages/admin/AdminCommentsPage'
import { AdminContentPage } from '../pages/admin/AdminContentPage'
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'

type Tab = 'overview' | 'stories' | 'news' | 'categories' | 'users' | 'comments'
type FormSubmitEvent = SyntheticEvent<HTMLFormElement>
type AdminPanelProps = { token: string; onClose: () => void }
const blankContent: ContentForm = { title: '', excerpt: '', content: '', categoryId: '', coverImage: '', published: false, featured: false }

export function AdminPanel({ token, onClose }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [blogs, setBlogs] = useState<Story[]>([])
  const [news, setNews] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [form, setForm] = useState(blankContent)
  const [editingId, setEditingId] = useState('')
  const [notice, setNotice] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const load = useCallback(async () => { const [blogResult, newsResult, categoryResult, userResult] = await Promise.all([getJson<StoryResponse>('/blogs?limit=100&includeDrafts=true'), getJson<StoryResponse>('/news?limit=100&includeDrafts=true'), getJson<Category[]>('/categories'), getJson<AdminUser[]>('/users', { headers })]); const nextBlogs = blogResult.blogs || []; setBlogs(nextBlogs); setNews(newsResult.news || []); setCategories(categoryResult); setUsers(userResult); const groups = await Promise.all(nextBlogs.map((blog) => getJson<AdminComment[]>(`/comments/blog/${blog.id}`))); setComments(groups.flat()) }, [headers])
  useEffect(() => { const timer = window.setTimeout(() => { load().catch((error: Error) => setNotice(error.message)) }, 0); return () => window.clearTimeout(timer) }, [load])
  const resetForm = () => { setForm(blankContent); setEditingId('') }
  const remove = async (path: string, label: string) => { if (!window.confirm(`Delete this ${label}?`)) return; try { await sendJson(path, { method: 'DELETE', headers }); setNotice(`${label} deleted.`); await load() } catch (error) { setNotice(error instanceof Error ? error.message : `Could not delete ${label}.`) } }
  const saveContent = async (event: FormSubmitEvent) => { event.preventDefault(); try { const path = tab === 'stories' ? `/blogs${editingId ? `/${editingId}` : ''}` : `/news${editingId ? `/${editingId}` : ''}`; await sendJson(path, { method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) }); resetForm(); setNotice('Content saved.'); await load() } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save content.') } }
  const createCategory = async (event: FormSubmitEvent) => { event.preventDefault(); try { await sendJson('/categories', { method: 'POST', headers, body: JSON.stringify({ name: categoryName, description: categoryDescription }) }); setCategoryName(''); setCategoryDescription(''); setNotice('Category created.'); await load() } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not create category.') } }
  const editContent = (item: Story) => { setEditingId(item.id); setForm({ title: item.title, excerpt: item.excerpt || '', content: item.content || '', categoryId: item.category?.id || '', coverImage: item.coverImage || '', published: Boolean(item.published), featured: Boolean(item.featured) }) }
  const removeById = (path: string, label: string) => (id: string) => remove(`${path}/${id}`, label)
  const updateRole = async (user: AdminUser, role: string) => { try { await sendJson(`/users/${user.id}/role`, { method: 'PUT', headers, body: JSON.stringify({ role }) }); await load() } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not update user role.') } }
  const content = tab === 'overview' ? <AdminOverviewPage blogs={blogs} news={news} users={users} comments={comments} onCreateStory={() => setTab('stories')} /> : tab === 'stories' || tab === 'news' ? <AdminContentPage mode={tab} items={tab === 'stories' ? blogs : news} categories={categories} form={form} editingId={editingId} onForm={setForm} onSubmit={saveContent} onEdit={editContent} onCancel={resetForm} onRemove={removeById(tab === 'stories' ? '/blogs' : '/news', tab === 'stories' ? 'story' : 'news item')} /> : tab === 'categories' ? <AdminCategoriesPage categories={categories} name={categoryName} description={categoryDescription} onName={setCategoryName} onDescription={setCategoryDescription} onSubmit={createCategory} onRemove={removeById('/categories', 'category')} /> : tab === 'users' ? <AdminUsersPage users={users} onRole={updateRole} onRemove={removeById('/users', 'user')} /> : <AdminCommentsPage comments={comments} onRemove={removeById('/comments', 'comment')} />
  return <div className="admin-backdrop"><section className="admin-panel"><header className="admin-header"><div><p className="eyebrow"><ShieldCheck size={15} /> Admin workspace</p><h2>Control room</h2><p>Manage the publication, people, and conversations from one calm workspace.</p></div><button className="close-reader" onClick={onClose} aria-label="Close admin workspace"><X size={20} /></button></header><nav className="admin-tabs">{(['overview', 'stories', 'news', 'categories', 'users', 'comments'] as Tab[]).map((item) => <button key={item} className={tab === item ? 'admin-tab active' : 'admin-tab'} onClick={() => { setTab(item); resetForm() }}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>{notice && <p className="admin-notice">{notice}</p>}{content}</section></div>
}
