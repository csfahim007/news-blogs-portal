import { ArrowUpRight } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const subscribe = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return
    localStorage.setItem('pinesaas_newsletter_email', email.trim())
    setSubscribed(true)
  }
  return <footer id="newsletter" className="footer"><div><p className="eyebrow">The occasional dispatch</p><h2>Good ideas, delivered<br /><em>without the noise.</em></h2></div><form className="subscribe-form" onSubmit={subscribe}>{subscribed ? <div className="subscribe-success" role="status">You are on the list. Watch your inbox for the next dispatch.</div> : <><label htmlFor="newsletter-email">Email address</label><div><input id="newsletter-email" name="newsletterEmail" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /><button type="submit" aria-label="Subscribe"><ArrowUpRight size={19} /></button></div><small>One thoughtful note every few weeks.</small></>}</form></footer>
}
