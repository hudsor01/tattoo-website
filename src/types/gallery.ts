// Type definitions for the gallery data

export interface TattooImage {
  id: number
  src: string
  alt: string
  category: string
  likes: number
  featured: boolean
  artist?: string
  dateCreated?: string
  description?: string
}

export interface VideoProcess {
  id: number
  thumbnail: string
  title: string
  duration: string
  videoUrl: string
  views: number
  date: string
  artist?: string
  description?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
