import { JournalPage } from './JournalPage'
import type { Story } from '../types'

type NewsPageProps = { reloadKey: number; onStory: (story: Story) => void }
export function NewsPage({ reloadKey, onStory }: NewsPageProps) { return <JournalPage section="news" reloadKey={reloadKey} onStory={onStory} /> }
