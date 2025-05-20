"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, X, Heart, Share2, Info, Bookmark, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { VideoPlayer } from "./video-player"
import { ShareDialog } from "./share-dialog"
import { toast } from "@/hooks/use-toast"
import { fetchTattooImages, fetchVideoProcesses, likeTattoo, bookmarkTattoo, getUserInteractions } from "@/lib/api/gallery"
import { useRealTimeUpdates, formatNumber } from "@/lib/real-time"
import type { TattooImage, VideoProcess } from "@/types/gallery"

// Fallback data in case API fails
const fallbackTattooImages: TattooImage[] = [
	{
		id: 1,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Realistic portrait tattoo",
		category: "Portrait",
		likes: 124,
		featured: true,
	},
	{
		id: 2,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Japanese style sleeve tattoo",
		category: "Japanese",
		likes: 98,
		featured: false,
	},
	{
		id: 3,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Traditional American eagle",
		category: "Traditional",
		likes: 156,
		featured: false,
	},
	{
		id: 4,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Geometric mandala design",
		category: "Geometric",
		likes: 87,
		featured: true,
	},
	{
		id: 5,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Watercolor flower sleeve",
		category: "Watercolor",
		likes: 210,
		featured: false,
	},
	{
		id: 6,
		src: "/placeholder.svg?height=600&width=400",
		alt: "Blackwork abstract pattern",
		category: "Blackwork",
		likes: 65,
		featured: false,
	},
]

const fallbackVideoProcesses: VideoProcess[] = [
	{
		id: 1,
		thumbnail: "/placeholder.svg?height=600&width=400",
		title: "Full Sleeve Process",
		duration: "5:24",
		videoUrl: "https://example.com/videos/sleeve-process.mp4",
		views: 1245,
		date: "2 weeks ago",
	},
	{
		id: 2,
		thumbnail: "/placeholder.svg?height=600&width=400",
		title: "Portrait Tattoo Technique",
		duration: "8:15",
		videoUrl: "https://example.com/videos/portrait-technique.mp4",
		views: 987,
		date: "1 month ago",
	},
	{
		id: 3,
		thumbnail: "/placeholder.svg?height=600&width=400",
		title: "Color Saturation Methods",
		duration: "12:38",
		videoUrl: "https://example.com/videos/color-saturation.mp4",
		views: 2341,
		date: "3 weeks ago",
	},
	{
		id: 4,
		thumbnail: "/placeholder.svg?height=600&width=400",
		title: "Linework Masterclass",
		duration: "15:10",
		videoUrl: "https://example.com/videos/linework-masterclass.mp4",
		views: 3120,
		date: "2 months ago",
	},
]

export function TattooGallery() {
	// State for data
	const [tattooImages, setTattooImages] = useState<TattooImage[]>([])
	const [videoProcesses, setVideoProcesses] = useState<VideoProcess[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// UI state
	const [activeTab, setActiveTab] = useState("tattoos")
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [isLightboxOpen, setIsLightboxOpen] = useState(false)
	const [liked, setLiked] = useState<Record<number, boolean>>({})
	const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({})
	const [scale, setScale] = useState(1)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [startPos, setStartPos] = useState({ x: 0, y: 0 })
	const [selectedVideo, setSelectedVideo] = useState<VideoProcess | null>(null)
	const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
	const [shareContent, setShareContent] = useState<{ type: "tattoo" | "video"; id: number; title: string }>({
		type: "tattoo",
		id: 0,
		title: "",
	})
	const [dataRefreshTimestamp, setDataRefreshTimestamp] = useState<number>(Date.now())

	// For optimistic updates
	const [pendingLikes, setPendingLikes] = useState<Record<number, boolean>>({})
	const [pendingBookmarks, setPendingBookmarks] = useState<Record<number, boolean>>({})

	const isMobile = useMobile()
	const galleryRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: galleryRef,
		offset: ["start end", "end start"],
	})

	const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
	const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

	// Real-time updates handlers
	const handleLikeUpdate = useCallback((tattooId: number, likes: number) => {
		setTattooImages((prev) => prev.map((img) => (img.id === tattooId ? { ...img, likes } : img)))
	}, [])

	const handleNewTattoo = useCallback((tattoo: TattooImage) => {
		setTattooImages((prev) => [tattoo, ...prev])
	}, [])

	const handleNewVideo = useCallback((video: VideoProcess) => {
		setVideoProcesses((prev) => [video, ...prev])
	}, [])

	const handleViewCountUpdate = useCallback((videoId: number, views: number) => {
		setVideoProcesses((prev) => prev.map((video) => (video.id === videoId ? { ...video, views } : video)))
	}, [])

	// Initialize real-time updates
	const { isConnected: isRealtimeConnected } = useRealTimeUpdates(
		handleLikeUpdate,
		handleNewTattoo,
		handleNewVideo,
		handleViewCountUpdate,
	)

	// Fetch data on component mount and when dataRefreshTimestamp changes
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true)
			setError(null)

			try {
				// Parallel data fetching for better performance
				const [tattooData, videoData, userInteractions] = await Promise.allSettled([
					fetchTattooImages(),
					fetchVideoProcesses(),
					getUserInteractions(),
				])

				// Handle tattoo images
				if (tattooData.status === "fulfilled") {
					setTattooImages(tattooData.value)
				} else {
					console.error("Failed to load tattoo images:", tattooData.reason)
					setTattooImages(fallbackTattooImages)
				}

				// Handle video processes
				if (videoData.status === "fulfilled") {
					setVideoProcesses(videoData.value)
				} else {
					console.error("Failed to load video processes:", videoData.reason)
					setVideoProcesses(fallbackVideoProcesses)
				}

				// Handle user interactions
				if (userInteractions.status === "fulfilled") {
					setLiked(userInteractions.value.likes)
					setBookmarked(userInteractions.value.bookmarks)
				} else {
					console.error("Failed to load user interactions:", userInteractions.reason)
					setLiked({})
					setBookmarked({})
				}

				// Check if any of the main data fetches failed
				if (tattooData.status === "rejected" || videoData.status === "rejected") {
					setError("Some data could not be loaded. Showing partial or cached content.")

					toast({
						title: "Partial Data Loaded",
						description: "Some content couldn't be loaded from the server. Showing available data.",
						variant: "destructive",
					})
				}
			} catch (err) {
				console.error("Failed to load gallery data:", err)
				setError("Failed to load gallery data. Using fallback content.")

				// Use fallback data
				setTattooImages(fallbackTattooImages)
				setVideoProcesses(fallbackVideoProcesses)

				// Show error toast
				toast({
					title: "Connection Error",
					description: "Could not connect to the server. Showing cached content.",
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [dataRefreshTimestamp])

	// Update real-time connection status
	useEffect(() => {
		if (isRealtimeConnected) {
			toast({
				title: "Real-time Updates Active",
				description: "You'll see live updates for likes, new content, and view counts.",
			})
		}
	}, [isRealtimeConnected])

	// Handle image click in gallery
	const handleImageClick = (index: number) => {
		setSelectedImage(index)
		setIsLightboxOpen(true)
		setScale(1)
		setPosition({ x: 0, y: 0 })
	}

	// Handle video click
	const handleVideoClick = (video: VideoProcess) => {
		setSelectedVideo(video)
		setIsVideoPlayerOpen(true)
	}

	// Navigation in lightbox
	const nextImage = () => {
		if (selectedImage === null) return
		setSelectedImage((selectedImage + 1) % tattooImages.length)
		resetZoom()
	}

	const prevImage = () => {
		if (selectedImage === null) return
		setSelectedImage((selectedImage - 1 + tattooImages.length) % tattooImages.length)
		resetZoom()
	}

	// Reset zoom and position
	const resetZoom = () => {
		setScale(1)
		setPosition({ x: 0, y: 0 })
	}

	// Zoom controls
	const handleZoomIn = () => {
		setScale((prev) => Math.min(prev + 0.5, 3))
	}

	const handleZoomOut = () => {
		setScale((prev) => Math.max(prev - 0.5, 1))
		if (scale <= 1.5) {
			setPosition({ x: 0, y: 0 })
		}
	}

	// Drag handlers for zoomed image
	const handleMouseDown = (e: React.MouseEvent) => {
		if (scale > 1) {
			setIsDragging(true)
			setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y })
		}
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && scale > 1) {
			setPosition({
				x: e.clientX - startPos.x,
				y: e.clientY - startPos.y,
			})
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	// Touch handlers for mobile
	const handleTouchStart = (e: React.TouchEvent) => {
		if (scale > 1) {
			setIsDragging(true)
			setStartPos({
				x: e.touches[0].clientX - position.x,
				y: e.touches[0].clientY - position.y,
			})
		}
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (isDragging && scale > 1) {
			setPosition({
				x: e.touches[0].clientX - startPos.x,
				y: e.touches[0].clientY - startPos.y,
			})
		}
	}

	const handleTouchEnd = () => {
		setIsDragging(false)
	}

	// Like a tattoo with optimistic update and API call
	const toggleLike = useCallback(
		async (id: number, e: React.MouseEvent) => {
			e.stopPropagation()

			// Optimistic update
			const newLikedState = !liked[id]
			setLiked((prev) => ({ ...prev, [id]: newLikedState }))
			setPendingLikes((prev) => ({ ...prev, [id]: true }))

			// Update the likes count in the tattoo images array
			setTattooImages((prev) =>
				prev.map((img) => (img.id === id ? { ...img, likes: newLikedState ? img.likes + 1 : img.likes - 1 } : img)),
			)

			try {
				// API call
				const result = await likeTattoo(id)

				// Update with actual server data
				setTattooImages((prev) => prev.map((img) => (img.id === id ? { ...img, likes: result.likes } : img)))
			} catch (error) {
				console.error(`Failed to ${newLikedState ? "like" : "unlike"} tattoo:`, error)

				// Revert optimistic update on error
				setLiked((prev) => ({ ...prev, [id]: !newLikedState }))

				// Revert likes count
				setTattooImages((prev) =>
					prev.map((img) => (img.id === id ? { ...img, likes: newLikedState ? img.likes - 1 : img.likes + 1 } : img)),
				)

				toast({
					title: "Action Failed",
					description: `Could not ${newLikedState ? "like" : "unlike"} the tattoo. Please try again.`,
					variant: "destructive",
				})
			} finally {
				setPendingLikes((prev) => ({ ...prev, [id]: false }))
			}
		},
		[liked, toast],
	)

	// Bookmark a tattoo with optimistic update and API call
	const toggleBookmark = useCallback(
		async (id: number, e: React.MouseEvent) => {
			e.stopPropagation()

			// Optimistic update
			const newBookmarkedState = !bookmarked[id]
			setBookmarked((prev) => ({ ...prev, [id]: newBookmarkedState }))
			setPendingBookmarks((prev) => ({ ...prev, [id]: true }))

			try {
				// API call
				await bookmarkTattoo(id)

				// Show success toast
				toast({
					title: newBookmarkedState ? "Saved to Collection" : "Removed from Collection",
					description: newBookmarkedState
						? "This tattoo has been added to your saved collection."
						: "This tattoo has been removed from your saved collection.",
				})
			} catch (error) {
				console.error(`Failed to ${newBookmarkedState ? "bookmark" : "unbookmark"} tattoo:`, error)

				// Revert optimistic update on error
				setBookmarked((prev) => ({ ...prev, [id]: !newBookmarkedState }))

				toast({
					title: "Action Failed",
					description: `Could not ${newBookmarkedState ? "save" : "remove"} the tattoo. Please try again.`,
					variant: "destructive",
				})
			} finally {
				setPendingBookmarks((prev) => ({ ...prev, [id]: false }))
			}
		},
		[bookmarked, toast],
	)

	// Open share dialog
	const handleShare = (type: "tattoo" | "video", id: number, title: string, e: React.MouseEvent) => {
		e.stopPropagation()
		setShareContent({ type, id, title })
		setIsShareDialogOpen(true)
	}

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isLightboxOpen) return

			if (e.key === "ArrowRight") nextImage()
			if (e.key === "ArrowLeft") prevImage()
			if (e.key === "Escape") setIsLightboxOpen(false)
			if (e.key === "+" || e.key === "=") handleZoomIn()
			if (e.key === "-") handleZoomOut()
			if (e.key === "0") resetZoom()
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isLightboxOpen, selectedImage, scale])

	// Retry loading data
	const handleRetry = async () => {
		setDataRefreshTimestamp(Date.now())
	}

	return (
		<div className="w-full" ref={galleryRef}>
			<motion.div style={{ opacity, y }}>
				{error && (
					<div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						<div className="flex-1 text-sm text-red-500">{error}</div>
						<Button size="sm" onClick={handleRetry} disabled={isLoading}>
							{isLoading ? "Loading..." : "Retry"}
						</Button>
					</div>
				)}

				{isRealtimeConnected && (
					<div className="mb-4 text-xs text-center">
						<span className="inline-flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
							Real-time updates active
						</span>
					</div>
				)}

				<Tabs defaultValue="tattoos" className="w-full" onValueChange={setActiveTab}>
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-zinc-800/50 backdrop-blur-sm">
						<TabsTrigger
							value="tattoos"
							className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-orange-500 data-[state=active]:to-amber-500 data-[state=active]:animate-gradient data-[state=active]:text-white"
						>
							Tattoo Designs
						</TabsTrigger>
						<TabsTrigger
							value="videos"
							className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-orange-500 data-[state=active]:to-amber-500 data-[state=active]:animate-gradient data-[state=active]:text-white"
						>
							Process Videos
						</TabsTrigger>
					</TabsList>

					<AnimatePresence mode="wait">
						<TabsContent value="tattoos" className="mt-0" asChild>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
							>
								{isLoading ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
										{Array.from({ length: 8 }).map((_, index) => (
											<div key={index} className="aspect-[3/4] bg-zinc-800/50 rounded-lg animate-pulse" />
										))}
									</div>
								) : tattooImages.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-zinc-400">No tattoos found.</p>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
										<AnimatePresence>
											{tattooImages.map((image, index) => (
												<motion.div
													key={image.id}
													layout
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.9 }}
													transition={{ duration: 0.3 }}
													className="aspect-[3/4] relative overflow-hidden rounded-lg cursor-pointer group hover-scale image-hover-zoom"
													onClick={() => handleImageClick(index)}
												>
													{image.featured && (
														<div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
															Featured
														</div>
													)}
													<Image
														src={image.src || "/placeholder.svg"}
														alt={image.alt}
														fill
														className="object-cover"
														sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
														<div className="flex justify-between items-center mb-2">
															<div className="flex items-center gap-1">
																<Heart
																	className={cn(
																		"h-5 w-5 cursor-pointer transition-all",
																		liked[image.id] ? "text-red-500 fill-red-500" : "text-white",
																		pendingLikes[image.id] && "animate-pulse opacity-70",
																	)}
																	onClick={(e) => toggleLike(image.id, e)}
																	aria-label={liked[image.id] ? "Unlike" : "Like"}
																/>
																<span className="text-xs text-white">{formatNumber(image.likes)}</span>
															</div>
														</div>
														<div className="flex justify-between mt-2">
															<Button
																size="sm"
																variant="ghost"
																className="p-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
																onClick={(e) => handleShare("tattoo", image.id, image.alt, e)}
																aria-label="Share"
															>
																<Share2 className="h-4 w-4 text-white" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="p-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
																onClick={(e) => toggleBookmark(image.id, e)}
																disabled={pendingBookmarks[image.id]}
																aria-label={bookmarked[image.id] ? "Remove from collection" : "Save to collection"}
															>
																<Bookmark
																	className={cn(
																		"h-4 w-4",
																		bookmarked[image.id] ? "text-amber-400 fill-amber-400" : "text-white",
																		pendingBookmarks[image.id] && "animate-pulse opacity-70",
																	)}
																/>
															</Button>
														</div>
													</div>
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								)}

								{/* Lightbox */}
								<Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
									<DialogContent className="max-w-5xl bg-black/95 border-zinc-800 p-0 overflow-hidden">
										{selectedImage !== null && tattooImages[selectedImage] && (
											<div
												className="relative w-full aspect-auto max-h-[80vh] overflow-hidden"
												onMouseDown={handleMouseDown}
												onMouseMove={handleMouseMove}
												onMouseUp={handleMouseUp}
												onMouseLeave={handleMouseUp}
												onTouchStart={handleTouchStart}
												onTouchMove={handleTouchMove}
												onTouchEnd={handleTouchEnd}
												style={{ cursor: scale > 1 ? "grab" : "default" }}
											>
												<div
													className="absolute inset-0 flex items-center justify-center"
													style={{
														transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
														transition: isDragging ? "none" : "transform 0.3s ease",
													}}
												>
													<Image
														src={tattooImages[selectedImage].src || "/placeholder.svg"}
														alt={tattooImages[selectedImage].alt}
														width={1200}
														height={1600}
														className="object-contain max-h-[80vh] w-auto"
													/>
												</div>

												<div className="absolute top-4 right-4 flex gap-2 z-20">
													<Button
														variant="ghost"
														size="icon"
														className="text-white bg-black/50 hover:bg-black/70"
														onClick={handleZoomIn}
														disabled={scale >= 3}
														aria-label="Zoom in"
													>
														<span className="text-xl font-bold">+</span>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="text-white bg-black/50 hover:bg-black/70"
														onClick={handleZoomOut}
														disabled={scale <= 1}
														aria-label="Zoom out"
													>
														<span className="text-xl font-bold">-</span>
													</Button>
													<Button
														variant="ghost"
													size="icon"
														className="text-white bg-black/50 hover:bg-black/70"
														onClick={resetZoom}
														aria-label="Reset zoom"
													>
														<span className="text-sm font-bold">Reset</span>
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="text-white bg-black/50 hover:bg-black/70"
														onClick={() => setIsLightboxOpen(false)}
														aria-label="Close"
													>
														<X className="h-5 w-5" />
													</Button>
												</div>

												<Button
													variant="ghost"
													size="icon"
													className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 h-12 w-12"
													onClick={(e) => {
														e.stopPropagation()
														prevImage()
													}}
													aria-label="Previous image"
												>
													<ChevronLeft className="h-8 w-8" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 h-12 w-12"
													onClick={(e) => {
														e.stopPropagation()
														nextImage()
													}}
													aria-label="Next image"
												>
													<ChevronRight className="h-8 w-8" />
												</Button>
											</div>
										)}
										{selectedImage !== null && tattooImages[selectedImage] && (
											<div className="p-4 bg-zinc-900/80 backdrop-blur-sm">
												<div className="flex justify-between items-center">
													<div>
														<p className="text-zinc-400">{tattooImages[selectedImage].alt}</p>
														{tattooImages[selectedImage].artist && (
															<p className="text-zinc-500 text-sm mt-1">Artist: {tattooImages[selectedImage].artist}</p>
														)}
													</div>
													<div className="flex gap-3">
														<Button
															size="sm"
															variant="ghost"
															className="flex gap-1 items-center text-white hover:text-red-500"
															onClick={(e) => toggleLike(tattooImages[selectedImage].id, e)}
															disabled={pendingLikes[tattooImages[selectedImage].id]}
															aria-label={liked[tattooImages[selectedImage].id] ? "Unlike" : "Like"}
														>
															<Heart
																className={cn(
																	"h-5 w-5",
																	liked[tattooImages[selectedImage].id] ? "text-red-500 fill-red-500" : "",
																	pendingLikes[tattooImages[selectedImage].id] && "animate-pulse opacity-70",
																)}
															/>
															<span>Like ({formatNumber(tattooImages[selectedImage].likes)})</span>
														</Button>
														<Button
															size="sm"
															variant="ghost"
															className="flex gap-1 items-center text-white"
															onClick={(e) =>
																handleShare(
																	"tattoo",
																	tattooImages[selectedImage].id,
																	tattooImages[selectedImage].alt,
																	e,
																)
															}
															aria-label="Share"
														>
															<Share2 className="h-5 w-5" />
															<span>Share</span>
														</Button>
														<Button
															size="sm"
															variant="ghost"
															className="flex gap-1 items-center text-white hover:text-amber-400"
															onClick={(e) => toggleBookmark(tattooImages[selectedImage].id, e)}
															disabled={pendingBookmarks[tattooImages[selectedImage].id]}
															aria-label={
																bookmarked[tattooImages[selectedImage].id]
																	? "Remove from collection"
																	: "Save to collection"
															}
														>
															<Bookmark
																className={cn(
																	"h-5 w-5",
																	bookmarked[tattooImages[selectedImage].id] ? "text-amber-400 fill-amber-400" : "",
																	pendingBookmarks[tattooImages[selectedImage].id] && "animate-pulse opacity-70",
																)}
															/>
															<span>Save</span>
														</Button>
													</div>
												</div>
											</div>
										)}
									</DialogContent>
								</Dialog>
							</motion.div>
						</TabsContent>

						<TabsContent value="videos" className="mt-0" asChild>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
							>
								{isLoading ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										{Array.from({ length: 4 }).map((_, index) => (
											<div key={index} className="rounded-lg overflow-hidden">
												<div className="aspect-video bg-zinc-800/50 animate-pulse" />
												<div className="p-4 bg-zinc-900">
													<div className="h-6 bg-zinc-800/70 rounded animate-pulse mb-2" />
													<div className="h-4 bg-zinc-800/70 rounded animate-pulse w-2/3" />
												</div>
											</div>
										))}
									</div>
								) : videoProcesses.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-zinc-400">No video processes available at the moment.</p>
										<Button variant="outline" className="mt-4" onClick={() => setActiveTab("tattoos")}>
											View Tattoo Gallery
										</Button>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										{videoProcesses.map((video) => (
											<motion.div
												key={video.id}
												className="relative rounded-lg overflow-hidden group hover-scale"
												whileHover={{ y: -5 }}
												onClick={() => handleVideoClick(video)}
											>
												<div className="aspect-video relative">
													<Image
														src={video.thumbnail || "/placeholder.svg"}
														alt={video.title}
														fill
														className="object-cover"
														sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
														<motion.div
															className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center"
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.95 }}
														>
															<Play className="h-8 w-8 text-white fill-white" />
														</motion.div>
													</div>
													<div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-sm text-white">
														{video.duration}
													</div>
												</div>
												<div className="p-4 bg-zinc-900">
													<h3 className="font-medium text-lg text-white">{video.title}</h3>
													<div className="flex justify-between items-center mt-2">
														<p className="text-zinc-400 text-sm">
															{formatNumber(video.views)} views • {video.date}
														</p>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="ghost"
																className="p-0 h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
																onClick={(e) => {
																	e.stopPropagation()
																	// Like functionality would be implemented here
																}}
																aria-label="Like video"
															>
																<Heart className="h-4 w-4 text-white" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="p-0 h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
																onClick={(e) => handleShare("video", video.id, video.title, e)}
																aria-label="Share video"
															>
																<Share2 className="h-4 w-4 text-white" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="p-0 h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
																onClick={(e) => {
																	e.stopPropagation()
																	// Info functionality would be implemented here
																}}
																aria-label="Video information"
															>
																<Info className="h-4 w-4 text-white" />
															</Button>
														</div>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								)}

								{/* Video Player Dialog */}
								<Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
									<DialogContent className="max-w-5xl bg-black/95 border-zinc-800 p-0 overflow-hidden">
										{selectedVideo && (
											<VideoPlayer
												videoId={selectedVideo.id}
												videoUrl={selectedVideo.videoUrl}
												title={selectedVideo.title}
												onClose={() => setIsVideoPlayerOpen(false)}
											/>
										)}
									</DialogContent>
								</Dialog>

								{/* Share Dialog */}
								<ShareDialog
									open={isShareDialogOpen}
									onOpenChange={setIsShareDialogOpen}
									contentType={shareContent.type}
									contentId={shareContent.id}
									title={shareContent.title}
								/>
							</motion.div>
						</TabsContent>
					</AnimatePresence>
				</Tabs>
			</motion.div>
		</div>
	)
}