export type Section = 'blogs' | 'news'
export type Surface = 'stories' | 'blogs' | 'news' | 'about'

export type Category = { id: string; name: string; description?: string }
export type Story = {
  id: string
  title: string
  slug?: string
  excerpt?: string
  content?: string
  coverImage?: string
  createdAt?: string
  category?: Category
  author?: { name?: string; image?: string }
  averageRating?: number
  views?: number
  feedbackCount?: number
  featured?: boolean
  published?: boolean
  _count?: { comments?: number; likes?: number }
}
export type Comment = { id: string; content: string; createdAt: string; author?: { name?: string; image?: string } }
export type StoryResponse = { blogs?: Story[]; news?: Story[] }
export type AuthResponse = { token: string; user: { id?: string; email?: string; name: string; role: string } }
export type AdminUser = { id: string; name: string; email: string; role: string; createdAt: string; _count?: { blogs?: number; comments?: number } }
export type AdminComment = { id: string; content: string; createdAt: string; blogId: string; author?: { name?: string } }
export type ContentForm = { title: string; excerpt: string; content: string; categoryId: string; coverImage: string; published: boolean; featured: boolean }
