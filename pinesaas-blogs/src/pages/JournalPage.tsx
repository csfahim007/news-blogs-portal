import { ArrowUpRight, BookOpen, Clock3, Eye, MessageCircle, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { dateLabel, getJson, readingTime } from '../lib/api'
import type { Category, Section, Story, StoryResponse } from '../types'
import { StoryImage } from '../components/StoryImage'

type JournalPageProps = { section: Section; reloadKey: number; onStory: (story: Story) => void }

export function JournalPage({ section, reloadKey, onStory }: JournalPageProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const contentPath = section === 'news' ? '/news' : '/blogs'
    Promise.all([getJson<StoryResponse>(`${contentPath}?limit=24`), getJson<Category[]>('/categories')])
      .then(([result, categoryResult]) => { if (mounted) { setStories(section === 'news' ? result.news || [] : result.blogs || []); setCategories(Array.isArray(categoryResult) ? categoryResult : []); setError('') } })
      .catch((requestError: Error) => mounted && setError(`The publication API is unavailable. ${requestError.message}`))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [reloadKey, section])

  const visibleStories = useMemo(() => stories.filter((story) => { const text = `${story.title} ${story.excerpt || ''}`.toLowerCase(); return (!query || text.includes(query.toLowerCase())) && (category === 'all' || story.category?.id === category) }), [category, query, stories])
  const lead = visibleStories[0]
  const resetFilters = () => { setCategory('all'); setQuery('') }

  return <><section className="masthead"><div><p className="eyebrow"><Sparkles size={15} /> Ideas for building what matters</p><h1>Useful thinking for <em>ambitious</em> teams.</h1><p className="intro">A living journal of product craft, resilient systems, and the quiet decisions that make good work last.</p></div><div className="masthead-note"><span>01</span><span>Independent notes<br />from the PineSaaS team</span></div></section><section className="toolbar"><div className="section-switcher"><button className={section === 'blogs' ? 'switch active' : 'switch'} onClick={() => { resetFilters(); window.dispatchEvent(new CustomEvent('pinesaas:section', { detail: 'blogs' })) }}>Latest stories</button><button className={section === 'news' ? 'switch active' : 'switch'} onClick={() => { resetFilters(); window.dispatchEvent(new CustomEvent('pinesaas:section', { detail: 'news' })) }}>Company news</button></div><div className="filters"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the journal" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">All topics</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></section>{loading && <div className="state-panel"><span className="loader" /> Gathering the latest notes...</div>}{!loading && error && <div className="state-panel error-state"><p>{error}</p><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent('pinesaas:reload'))}>Try again <ArrowUpRight size={15} /></button></div>}{!loading && !error && !lead && <div className="state-panel"><BookOpen size={24} /> No published pieces match those filters yet.</div>}{!loading && !error && lead && <><section className="feature-grid"><button className="lead-story" onClick={() => onStory(lead)}><StoryImage story={lead} className="lead-visual" eager label={`Featured ${section === 'news' ? 'update' : 'essay'}`} /><div className="lead-content"><div className="story-meta"><span>{lead.category?.name || 'PineSaaS journal'}</span><span>{dateLabel(lead.createdAt)}</span></div><h2>{lead.title}</h2><p>{lead.excerpt || 'A considered look at the work, ideas, and practices shaping our next chapter.'}</p><div className="story-stats"><span><Eye size={14} /> {lead.views || 0} views</span><span><MessageCircle size={14} /> {lead._count?.comments ?? lead.feedbackCount ?? 0} comments</span></div><strong>Read the story <ArrowUpRight size={17} /></strong></div></button><aside className="manifesto"><p>We make room for the long view: clear products, honest writing, and technology that earns its place.</p><small>PineSaaS / editorial note</small></aside></section><section className="story-section"><div className="section-heading"><h2>More to explore</h2><span>{visibleStories.length} pieces</span></div><div className="story-grid">{visibleStories.slice(1).map((story, index) => <button className="story-card" key={story.id} onClick={() => onStory(story)}><StoryImage story={story} label={String(index + 2).padStart(2, '0')} /><div className="story-card-body"><div className="story-meta"><span>{story.category?.name || 'Journal'}</span><span>{dateLabel(story.createdAt)}</span></div><h3>{story.title}</h3><p>{story.excerpt || 'Read the latest perspective from the PineSaaS team.'}</p><small><Clock3 size={14} /> {readingTime(story)}</small></div></button>)}</div></section></>}</>
}
