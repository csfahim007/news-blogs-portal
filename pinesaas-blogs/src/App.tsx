import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BookOpen, Clock3, Eye, LogIn, LogOut, Menu, MessageCircle, Plus, Search, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import './App.css'

type Section = 'stories' | 'blogs' | 'news'
type Category = { id: string; name: string; description?: string }
type Story = {
  id: string; title: string; slug?: string; excerpt?: string; content?: string; coverImage?: string
  createdAt?: string; category?: Category; author?: { name?: string; image?: string }
  averageRating?: number; views?: number; feedbackCount?: number; featured?: boolean; published?: boolean
  _count?: { comments?: number; likes?: number }
}
type Comment = { id: string; content: string; createdAt: string; author?: { name?: string; image?: string } }
type StoryResponse = { blogs?: Story[]; news?: Story[] }
type AuthResponse = { token: string; user: { id?: string; email?: string; name: string; role: string } }
type ViewResponse = { counted: boolean }
type AdminUser = { id: string; name: string; email: string; role: string; createdAt: string; _count?: { blogs?: number; comments?: number } }
type AdminComment = { id: string; content: string; createdAt: string; blogId: string; author?: { name?: string } }

const API_URL = import.meta.env.VITE_API_URL || '/api'
const SESSION_ID = localStorage.getItem('pinesaas_session_id') || crypto.randomUUID()
localStorage.setItem('pinesaas_session_id', SESSION_ID)

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  if (!response.ok) throw new Error(`API returned ${response.status}`)
  return response.json() as Promise<T>
}

async function sendJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || `API returned ${response.status}`)
  return body as T
}

function dateLabel(value?: string) {
  if (!value) return 'Recently'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function readingTime(story: Story) {
  const words = (story.content || story.excerpt || '').trim().split(/\s+/).filter(Boolean).length
  const comments = story._count?.comments ?? story.feedbackCount ?? 0
  return `${Math.max(2, Math.ceil(words / 190))} min · ${story.views || 0} views · ${comments} comments`
}

type AdminPanelProps = { token: string; onClose: () => void }
type ContentForm = { title: string; excerpt: string; content: string; categoryId: string; coverImage: string; published: boolean; featured: boolean }
const blankContent: ContentForm = { title: '', excerpt: '', content: '', categoryId: '', coverImage: '', published: false, featured: false }

function AdminPanel({ token, onClose }: AdminPanelProps) {
  const [tab, setTab] = useState<'overview' | 'stories' | 'blogs' | 'news' | 'categories' | 'users' | 'comments'>('overview')
  const [blogs, setBlogs] = useState<Story[]>([])
  const [news, setNews] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [form, setForm] = useState<ContentForm>(blankContent)
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const load = useCallback(async () => {
    const [blogResult, newsResult, categoryResult, userResult] = await Promise.all([
      getJson<StoryResponse>('/blogs?limit=100&includeDrafts=true'), getJson<StoryResponse>('/news?limit=100&includeDrafts=true'), getJson<Category[]>('/categories'), getJson<AdminUser[]>('/users', { headers }),
    ])
    const nextBlogs = blogResult.blogs || []; setBlogs(nextBlogs); setNews(newsResult.news || []); setCategories(categoryResult); setUsers(userResult)
    const commentGroups = await Promise.all(nextBlogs.map((blog) => getJson<AdminComment[]>(`/comments/blog/${blog.id}`)))
    setComments(commentGroups.flat())
  }, [headers])

  useEffect(() => {
    const timer = window.setTimeout(() => { load().catch((error: Error) => setNotice(error.message)) }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const saveContent = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setNotice('')
    try {
      const path = tab === 'blogs' ? `/blogs${editingId ? `/${editingId}` : ''}` : `/news${editingId ? `/${editingId}` : ''}`
      await sendJson(path, { method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) })
      setForm(blankContent); setEditingId(''); setNotice(`${tab === 'blogs' ? 'Blog' : 'News item'} saved.`); await load()
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save content.') } finally { setSaving(false) }
  }
  const remove = async (path: string, label: string) => {
    if (!window.confirm(`Delete this ${label}?`)) return
    try { await sendJson(path, { method: 'DELETE', headers }); setNotice(`${label} deleted.`); await load() }
    catch (error) { setNotice(error instanceof Error ? error.message : `Could not delete ${label}.`) }
  }
  const createCategory = async (event: FormEvent) => {
    event.preventDefault(); setNotice('')
    try { await sendJson('/categories', { method: 'POST', headers, body: JSON.stringify({ name: categoryName, description: categoryDescription }) }); setCategoryName(''); setCategoryDescription(''); setNotice('Category created.'); await load() }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not create category.') }
  }
  const editContent = (item: Story) => { setEditingId(item.id); setForm({ title: item.title, excerpt: item.excerpt || '', content: item.content || '', categoryId: item.category?.id || '', coverImage: item.coverImage || '', published: Boolean(item.published), featured: Boolean(item.featured) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const updateRole = async (user: AdminUser, role: string) => { try { await sendJson(`/users/${user.id}/role`, { method: 'PUT', headers, body: JSON.stringify({ role }) }); await load() } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not update user role.') } }

  return <div className="admin-backdrop"><section className="admin-panel"><header className="admin-header"><div><p className="eyebrow"><ShieldCheck size={15} /> Admin workspace</p><h2>Control room</h2><p>Manage the publication, people, and conversations from one calm workspace.</p></div><button className="close-reader" onClick={onClose} aria-label="Close admin workspace"><X size={20} /></button></header><nav className="admin-tabs">{([['overview', 'Overview'], ['stories', 'Stories'], ['news', 'Newsroom'], ['categories', 'Categories'], ['users', 'Users'], ['comments', 'Comments']] as const).map(([key, label]) => <button key={key} className={tab === key ? 'admin-tab active' : 'admin-tab'} onClick={() => { setTab(key); setEditingId(''); setForm(blankContent) }}>{label}</button>)}</nav>{notice && <p className="admin-notice">{notice}</p>}
    {tab === 'overview' && <div className="admin-overview"><div className="admin-stat"><span>Published stories</span><strong>{blogs.filter((item) => item.published).length}</strong></div><div className="admin-stat"><span>News updates</span><strong>{news.length}</strong></div><div className="admin-stat"><span>Readers</span><strong>{users.filter((user) => user.role === 'user').length}</strong></div><div className="admin-stat"><span>Comments</span><strong>{comments.length}</strong></div><div className="admin-quick"><h3>What needs attention</h3><p>{blogs.filter((item) => !item.published).length} draft stories and {news.filter((item) => !item.published).length} draft news items are waiting in the workspace.</p><button className="admin-primary" onClick={() => setTab('stories')}><Plus size={16} /> Create a story</button></div></div>}
    {(tab === 'stories' || tab === 'news') && <div className="admin-content-layout"><form className="content-form" onSubmit={saveContent}><div className="form-heading"><div><span>{editingId ? 'Edit item' : 'New item'}</span><h3>{editingId ? 'Refine the piece' : tab === 'stories' ? 'Write a story' : 'Publish an update'}</h3></div>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(''); setForm(blankContent) }}>Cancel</button>}</div><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" required /><input value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="Short excerpt" /><textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write the full content" rows={9} required /><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required><option value="">Choose a category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="Cover image URL (Unsplash supported)" /><label className="check-row"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Published</label>{tab === 'news' && <label className="check-row"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured update</label>}<button className="admin-primary" disabled={saving} type="submit">{saving ? 'Saving...' : editingId ? 'Save changes' : <><Plus size={16} /> Create {tab === 'stories' ? 'story' : 'news'}</>}</button></form><div className="admin-list">{(tab === 'stories' ? blogs : news).map((item) => <div className="admin-list-item" key={item.id}><div><span className="status-label">{item.published ? 'Published' : 'Draft'}{item.featured ? ' / Featured' : ''}</span><h4>{item.title}</h4><small>{item.category?.name || 'Uncategorized'} · {item.views || 0} views · {item._count?.comments || 0} comments</small></div><div className="row-actions"><button onClick={() => editContent(item)} aria-label={`Edit ${item.title}`}>Edit</button><button onClick={() => remove(`/${tab === 'stories' ? 'blogs' : 'news'}/${item.id}`, tab === 'stories' ? 'story' : 'news item')} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div>)}</div></div>}
    {tab === 'categories' && <div className="category-manager"><form className="content-form" onSubmit={createCategory}><div className="form-heading"><div><span>Taxonomy</span><h3>Add a category</h3></div></div><input id="category-name" name="categoryName" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" required /><input id="category-description" name="categoryDescription" value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Short description" /><button className="admin-primary" type="submit"><Plus size={16} /> Create category</button></form><div className="admin-table">{categories.map((item) => <div className="category-row" key={item.id}><div><strong>{item.name}</strong><small>{item.description || 'No description'}</small></div><button onClick={() => remove(`/categories/${item.id}`, 'category')} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div>)}</div></div>}
    {tab === 'users' && <div className="admin-table">{users.map((user) => <div className="user-row" key={user.id}><div className="user-avatar">{user.name.charAt(0)}</div><div className="user-info"><strong>{user.name}</strong><span>{user.email}</span></div><span>{user._count?.blogs || 0} stories · {user._count?.comments || 0} comments</span><select id={`role-${user.id}`} name={`role-${user.id}`} value={user.role} onChange={(event) => updateRole(user, event.target.value)}><option value="user">Reader</option><option value="admin">Admin</option></select><button onClick={() => remove(`/users/${user.id}`, 'user')} aria-label={`Delete ${user.name}`}><Trash2 size={15} /></button></div>)}</div>}
    {tab === 'comments' && <div className="admin-table">{comments.length === 0 ? <p className="admin-empty">No comments yet.</p> : comments.map((comment) => <div className="comment-row" key={comment.id}><div><strong>{comment.author?.name || 'Reader'}</strong><small>{dateLabel(comment.createdAt)}</small><p>{comment.content}</p></div><button onClick={() => remove(`/comments/${comment.id}`, 'comment')} aria-label="Delete comment"><Trash2 size={15} /></button></div>)}</div>}
    </section></div>
}

function App() {
  const [section, setSection] = useState<Section>('blogs')
  const [surface, setSurface] = useState<'stories' | 'blogs' | 'news' | 'about'>('stories')
  const [stories, setStories] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pinesaas_token') || '')
  const [authName, setAuthName] = useState('')
  const [authRole, setAuthRole] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [registerName, setRegisterName] = useState('')
  const [adminOpen, setAdminOpen] = useState(false)
  const [category, setCategory] = useState('all')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  useEffect(() => {
    let mounted = true
    const contentPath = section === 'news' ? '/news' : '/blogs'
    Promise.all([getJson<StoryResponse>(`${contentPath}?limit=24`), getJson<Category[]>('/categories')])
      .then(([result, categoryResult]) => {
        if (!mounted) return
        setStories(section === 'news' ? result.news || [] : result.blogs || [])
        setCategories(Array.isArray(categoryResult) ? categoryResult : [])
      })
      .catch((requestError: Error) => mounted && setError(`The publication API is unavailable. ${requestError.message}`))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [reloadKey, section])

  useEffect(() => {
    if (!selected || section === 'news') return
    getJson<Comment[]>(`/comments/blog/${selected.id}`)
      .then(setComments)
      .catch(() => setCommentError('Comments could not be loaded.'))
      .finally(() => setCommentsLoading(false))
  }, [selected, section])

  useEffect(() => {
    if (!selected) return
    const endpoint = section === 'news' ? `/news/${selected.id}/view` : `/blogs/${selected.id}/view`
    sendJson<ViewResponse>(endpoint, { method: 'POST', body: JSON.stringify({ sessionId: SESSION_ID, duration: 1, scrolled: false }) }).then((result) => {
      if (!result.counted) return
      setStories((items) => items.map((item) => item.id === selected.id ? { ...item, views: (item.views || 0) + 1 } : item))
      setSelected((item) => item && item.id === selected.id ? { ...item, views: (item.views || 0) + 1 } : item)
    }).catch(() => undefined)
  }, [selected, section])

  useEffect(() => {
    document.querySelectorAll('input, textarea, select').forEach((field, index) => {
      const element = field as HTMLInputElement
      if (!element.id) element.id = `field-${index}`
      if (!element.getAttribute('name')) element.setAttribute('name', element.id)
      if (!element.getAttribute('autocomplete')) {
        element.setAttribute('autocomplete', element.type === 'email' ? 'email' : element.type === 'password' ? 'current-password' : 'off')
      }
    })
  }, [adminOpen, authOpen, selected])

  useEffect(() => {
    const handlePopState = () => {
      setSelected(null)
      setAdminOpen(false)
      if (window.location.pathname === '/about') setSurface('about')
      else if (surface === 'about') setSurface('stories')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [surface])

  const visibleStories = useMemo(() => stories.filter((story) => {
    const text = `${story.title} ${story.excerpt || ''}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (category === 'all' || story.category?.id === category)
  }), [category, query, stories])
  const lead = visibleStories[0]

  const changeSection = (next: Section) => { setLoading(true); setError(''); setSection(next); setMenuOpen(false); setCategory('all'); setQuery('') }
  const openAbout = () => { setSurface('about'); setMenuOpen(false); window.history.pushState({ about: true }, '', '/about') }
  const openStory = (story: Story) => { window.history.pushState({ reader: true }, '', `?${section}=${story.slug || story.id}`); setSelected(story); setComments([]); setCommentsLoading(true); setCommentText(''); setCommentError('') }
  const login = async (event: FormEvent) => {
    event.preventDefault(); setCommentError('')
    try { const result = await sendJson<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email: authEmail, password: authPassword }) }); localStorage.setItem('pinesaas_token', result.token); setAuthToken(result.token); setAuthName(result.user.name); setAuthRole(result.user.role); setAuthPassword(''); setAuthOpen(false) }
    catch (loginError) { setCommentError(loginError instanceof Error ? loginError.message : 'Login failed.') }
  }
  const register = async (event: FormEvent) => {
    event.preventDefault(); setCommentError('')
    try { const result = await sendJson<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name: registerName, email: authEmail, password: authPassword }) }); localStorage.setItem('pinesaas_token', result.token); setAuthToken(result.token); setAuthName(result.user.name); setAuthRole(result.user.role); setAuthPassword(''); setRegisterName(''); setAuthOpen(false) }
    catch (registerError) { setCommentError(registerError instanceof Error ? registerError.message : 'Registration failed.') }
  }
  const logout = () => { localStorage.removeItem('pinesaas_token'); setAuthToken(''); setAuthName(''); setAuthRole('') }
  const addComment = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || !commentText.trim() || !authToken) return
    setCommentError('')
    try { const created = await sendJson<Comment>('/comments', { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ blogId: selected.id, content: commentText.trim() }) }); setComments((items) => [created, ...items]); setCommentText('') }
    catch (commentRequestError) { setCommentError(commentRequestError instanceof Error ? commentRequestError.message : 'Comment could not be added.') }
  }
  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    if (!newsletterEmail.trim()) return
    localStorage.setItem('pinesaas_newsletter_email', newsletterEmail.trim())
    setNewsletterSubscribed(true)
  }

  return <div className="site-shell">
    <header className="topbar">
      <a className="brand" href="/"><span className="brand-mark">P</span><span>PineSaaS</span></a>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
        <button className={surface === 'stories' ? 'nav-link active' : 'nav-link'} onClick={() => { setSurface('stories'); changeSection('blogs') }}>Stories</button>
        <button className={surface === 'blogs' ? 'nav-link active' : 'nav-link'} onClick={() => { setSurface('blogs'); changeSection('blogs') }}>Blogs</button>
        <button className={surface === 'news' ? 'nav-link active' : 'nav-link'} onClick={() => { setSurface('news'); changeSection('news') }}>Newsroom</button>
        <button className={surface === 'about' ? 'nav-link active' : 'nav-link'} onClick={openAbout}>About</button>
      </nav>
      <div className="header-actions"><button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><Menu size={20} /></button><button className="account-button" onClick={() => authRole === 'admin' ? setAdminOpen(true) : authToken ? logout() : setAuthOpen(true)} title={authRole === 'admin' ? 'Open admin workspace' : authToken ? 'Sign out' : 'Open account'}><span className={authRole === 'admin' ? 'account-avatar admin' : 'account-avatar'}>{authName.charAt(0).toUpperCase() || 'U'}</span>{authRole === 'admin' ? 'Admin workspace' : authToken ? authName || 'Account' : 'Account'}{authRole === 'admin' ? <ShieldCheck size={14} /> : authToken ? <LogOut size={14} /> : <LogIn size={16} />}</button><button className="outline-button" onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}>Join the list <ArrowUpRight size={16} /></button></div>
    </header>

    <main>
      {surface === 'about' ? <section className="about-page"><div className="about-hero"><div className="about-hero-copy"><p className="eyebrow"><Sparkles size={15} /> About PineSaaS</p><h1>Make the work<br /><em>feel lighter.</em></h1><p className="about-lede">PineSaaS is a thoughtful workspace for teams who want fewer scattered tools, clearer decisions, and more time for the work that matters.</p><div className="about-hero-meta"><span>Founded for focused teams</span><span>01 / 04</span></div></div><div className="about-hero-visual"><div className="about-visual-image" /><div className="about-visual-caption"><span>Room to think</span><span>Built with intention</span></div></div></div><div className="about-grid"><div><span className="about-index">01</span><h2>Built for the long view</h2><p>Good software should reduce the amount of remembering, repeating, and searching a team has to do. We build calm systems that keep context close to the work.</p></div><div><span className="about-index">02</span><h2>Useful over impressive</h2><p>Every feature earns its place by helping someone move forward. That means clear defaults, honest feedback, and interfaces that stay out of the way.</p></div><div><span className="about-index">03</span><h2>People at the center</h2><p>Products are made for real working days. We listen carefully, share what we learn, and keep improving the small moments that compound.</p></div></div><div className="about-cta"><div><p className="eyebrow">Stay close to the work</p><h2>Explore the journal.</h2></div><button className="outline-button" onClick={() => { setSurface('stories'); changeSection('blogs') }}>Read the stories <ArrowUpRight size={16} /></button></div></section> : <>
      <section className="masthead"><div><p className="eyebrow"><Sparkles size={15} /> Ideas for building what matters</p><h1>Useful thinking for <em>ambitious</em> teams.</h1><p className="intro">A living journal of product craft, resilient systems, and the quiet decisions that make good work last.</p></div><div className="masthead-note"><span>01</span><span>Independent notes<br />from the PineSaaS team</span></div></section>
      <section className="toolbar"><div className="section-switcher"><button className={section === 'blogs' ? 'switch active' : 'switch'} onClick={() => changeSection('blogs')}>Latest stories</button><button className={section === 'news' ? 'switch active' : 'switch'} onClick={() => changeSection('news')}>Company news</button></div><div className="filters"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the journal" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">All topics</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></section>

      {loading && <div className="state-panel"><span className="loader" /> Gathering the latest notes...</div>}
      {!loading && error && <div className="state-panel error-state"><p>{error}</p><button className="text-button" onClick={() => { setLoading(true); setError(''); setReloadKey((value) => value + 1) }}>Try again <ArrowUpRight size={15} /></button></div>}
      {!loading && !error && !lead && <div className="state-panel"><BookOpen size={24} /> No published pieces match those filters yet.</div>}
      {!loading && !error && lead && <>
        <section className="feature-grid"><button className="lead-story" onClick={() => openStory(lead)}><div className="story-visual lead-visual" style={lead.coverImage ? { backgroundImage: `url(${lead.coverImage})` } : undefined}><span>Featured {section === 'news' ? 'update' : 'essay'}</span></div><div className="lead-content"><div className="story-meta"><span>{lead.category?.name || 'PineSaaS journal'}</span><span>{dateLabel(lead.createdAt)}</span></div><h2>{lead.title}</h2><p>{lead.excerpt || 'A considered look at the work, ideas, and practices shaping our next chapter.'}</p><div className="story-stats"><span><Eye size={14} /> {lead.views || 0} views</span><span><MessageCircle size={14} /> {lead._count?.comments ?? lead.feedbackCount ?? 0} comments</span></div><strong>Read the story <ArrowUpRight size={17} /></strong></div></button><aside className="manifesto"><p>We make room for the long view: clear products, honest writing, and technology that earns its place.</p><small>PineSaaS / editorial note</small></aside></section>
        <section className="story-section"><div className="section-heading"><h2>More to explore</h2><span>{visibleStories.length} pieces</span></div><div className="story-grid">{visibleStories.slice(1).map((story, index) => <button className="story-card" key={story.id} onClick={() => openStory(story)}><div className="story-visual" style={story.coverImage ? { backgroundImage: `url(${story.coverImage})` } : undefined}><span>{String(index + 2).padStart(2, '0')}</span></div><div className="story-card-body"><div className="story-meta"><span>{story.category?.name || 'Journal'}</span><span>{dateLabel(story.createdAt)}</span></div><h3>{story.title}</h3><p>{story.excerpt || 'Read the latest perspective from the PineSaaS team.'}</p><small><Clock3 size={14} /> {readingTime(story)}</small></div></button>)}</div></section>
      </>}</>}
    </main>

    <footer id="newsletter" className="footer"><div><p className="eyebrow">The occasional dispatch</p><h2>Good ideas, delivered<br /><em>without the noise.</em></h2></div><form className="subscribe-form" onSubmit={subscribe}>{newsletterSubscribed ? <div className="subscribe-success" role="status">You are on the list. Watch your inbox for the next dispatch.</div> : <><label htmlFor="newsletter-email">Email address</label><div><input id="newsletter-email" name="newsletterEmail" autoComplete="email" type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="you@example.com" required /><button type="submit" aria-label="Subscribe"><ArrowUpRight size={19} /></button></div><small>One thoughtful note every few weeks.</small></>}</form></footer>

    {selected && <div className="reader-backdrop" onClick={() => setSelected(null)}><article className="reader" role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}><button className="close-reader" onClick={() => setSelected(null)} aria-label="Close story"><X size={20} /></button><div className="reader-kicker">{selected.category?.name || 'PineSaaS journal'} / {dateLabel(selected.createdAt)}</div><h2>{selected.title}</h2><p className="reader-excerpt">{selected.excerpt}</p><div className="reader-content">{selected.content ? selected.content.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>This story is ready to be connected to its full content from the publication API.</p>}</div>{section === 'blogs' && <section className="comments"><div className="comments-heading"><h3>Conversation</h3><span>{comments.length} comments</span></div>{commentsLoading ? <p className="comment-muted">Loading comments...</p> : comments.length === 0 ? <p className="comment-muted">Be the first to add a thoughtful note.</p> : comments.map((comment) => <div className="comment" key={comment.id}><strong>{comment.author?.name || 'Reader'}</strong><small>{dateLabel(comment.createdAt)}</small><p>{comment.content}</p></div>)}{authToken ? <form className="comment-form" onSubmit={addComment}><p className="signed-in">Signed in as {authName || 'reader'}</p><textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add to the conversation" rows={3} required /><button className="outline-button" type="submit">Post comment <ArrowUpRight size={15} /></button></form> : <div className="comment-login-prompt"><p className="comment-muted">Sign in to join the conversation.</p><button className="text-button" onClick={() => { setAuthOpen(true); setCommentError('') }}>Open account sign in <LogIn size={15} /></button></div>}{commentError && <p className="comment-error">{commentError}</p>}</section>}</article></div>}
    {authOpen && <div className="auth-backdrop" onClick={() => setAuthOpen(false)}><section className="auth-dialog" role="dialog" aria-modal="true" aria-label="Account access" onClick={(event) => event.stopPropagation()}><button className="close-reader" onClick={() => setAuthOpen(false)} aria-label="Close account dialog"><X size={20} /></button><p className="eyebrow"><ShieldCheck size={15} /> Secure account access</p><h2>{authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p className="auth-copy">Sign in to join conversations. Admin accounts use the same sign-in form and receive the admin workspace automatically.</p><div className="auth-tabs"><button className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setAuthMode('login'); setCommentError('') }}>Sign in</button><button className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setAuthMode('register'); setCommentError('') }}>Create account</button></div><form className="auth-form" onSubmit={authMode === 'login' ? login : register}>{authMode === 'register' && <input value={registerName} onChange={(event) => setRegisterName(event.target.value)} placeholder="Your name" required />}<input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="Email address" required /><input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Password (6+ characters)" minLength={6} required /><button className="outline-button" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={15} /></button></form>{authMode === 'login' && <p className="admin-hint"><ShieldCheck size={14} /> Admin demo: admin@pinesaas.local / AdminSeed2026!</p>}{commentError && <p className="comment-error">{commentError}</p>}</section></div>}
    {adminOpen && <AdminPanel token={authToken} onClose={() => setAdminOpen(false)} />}
  </div>
}

export default App
