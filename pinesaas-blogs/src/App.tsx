import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { ReaderModal } from './components/ReaderModal'
import { AdminPanel } from './components/AdminPanel'
import { AboutPage } from './pages/AboutPage'
import { StoriesPage } from './pages/StoriesPage'
import { BlogsPage } from './pages/BlogsPage'
import { NewsPage } from './pages/NewsPage'
import { useAuthActions } from './hooks/useAuthActions'
import type { Section, Story, Surface } from './types'
import './App.css'

function App() {
  const [section, setSection] = useState<Section>('blogs')
  const [surface, setSurface] = useState<Surface>('stories')
  const [selected, setSelected] = useState<Story | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const auth = useAuthActions(() => setAdminOpen(true))

  useEffect(() => {
    const handleSection = (event: Event) => setSection((event as CustomEvent<Section>).detail)
    const reload = () => setReloadKey((value) => value + 1)
    window.addEventListener('pinesaas:section', handleSection)
    window.addEventListener('pinesaas:reload', reload)
    return () => {
      window.removeEventListener('pinesaas:section', handleSection)
      window.removeEventListener('pinesaas:reload', reload)
    }
  }, [])

  const navigate = (nextSurface: Surface) => {
    setMenuOpen(false)
    setSelected(null)
    if (nextSurface === 'about') {
      setSurface('about')
      window.history.pushState({ about: true }, '', '/about')
      return
    }
    setSurface(nextSurface)
    setSection(nextSurface === 'news' ? 'news' : 'blogs')
    window.history.pushState({}, '', '/')
  }

  const openStory = (story: Story) => {
    setSelected(story)
    window.history.pushState({ reader: true }, '', `?${section}=${story.slug || story.id}`)
  }

  const userPage = surface === 'stories' ? <StoriesPage reloadKey={reloadKey} onStory={openStory} /> : surface === 'blogs' ? <BlogsPage reloadKey={reloadKey} onStory={openStory} /> : <NewsPage reloadKey={reloadKey} onStory={openStory} />
  return <div className="site-shell"><Navbar surface={surface} menuOpen={menuOpen} authToken={auth.token} authName={auth.name} authRole={auth.role} onMenu={() => setMenuOpen(!menuOpen)} onNavigate={navigate} onAccount={auth.accountAction} /><main>{surface === 'about' ? <AboutPage onReadStories={() => navigate('stories')} /> : userPage}</main><Footer />{selected && <ReaderModal story={selected} section={section} authToken={auth.token} authName={auth.name} onClose={() => setSelected(null)} onOpenAuth={auth.openAuth} />}{auth.authOpen && <AuthModal mode={auth.authMode} email={auth.authEmail} password={auth.authPassword} registerName={auth.registerName} error={auth.authError} onMode={auth.setAuthMode} onEmail={auth.setAuthEmail} onPassword={auth.setAuthPassword} onRegisterName={auth.setRegisterName} onSubmit={auth.authMode === 'login' ? auth.login : auth.register} onClose={auth.closeAuth} />}{adminOpen && <AdminPanel token={auth.token} onClose={() => setAdminOpen(false)} />}</div>
}

export default App
