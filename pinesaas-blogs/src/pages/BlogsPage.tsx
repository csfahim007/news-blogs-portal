import { JournalPage } from './JournalPage'
import type { Story } from '../types'

type BlogsPageProps = { reloadKey: number; onStory: (story: Story) => void }
export function BlogsPage({ reloadKey, onStory }: BlogsPageProps) { return <JournalPage section="blogs" reloadKey={reloadKey} onStory={onStory} /> }
