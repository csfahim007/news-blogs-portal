import type { Story } from '../types'

type StoryImageProps = { story: Story; className?: string; eager?: boolean; label?: string }

export function StoryImage({ story, className = '', eager = false, label = '' }: StoryImageProps) {
  return <div className={`story-visual ${className}`}>
    {story.coverImage && <img src={story.coverImage} alt={story.title} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} />}
    {label && <span>{label}</span>}
  </div>
}
