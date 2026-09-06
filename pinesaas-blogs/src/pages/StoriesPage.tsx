import { JournalPage } from './JournalPage'
import type { Story } from '../types'

type StoriesPageProps = { reloadKey: number; onStory: (story: Story) => void }
export function StoriesPage({ reloadKey, onStory }: StoriesPageProps) { return <JournalPage section="blogs" reloadKey={reloadKey} onStory={onStory} /> }
