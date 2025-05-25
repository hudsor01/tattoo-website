"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { trackVideoView } from "@/lib/api"
import { motion } from "framer-motion"

interface VideoPlayerProps {
  videoId: number
  videoUrl: string
  title: string
  onClose: () => void
}

export function VideoPlayer({ videoId, videoUrl, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolume, setShowVolume] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewTracked, setViewTracked] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Track view when 5 seconds have been watched
      if (!viewTracked && video.currentTime > 5) {
        trackVideoView(videoId).catch(console.error)
        setViewTracked(true)
      }
    }

    const handleError = () => {
      setError("Failed to load video. Please try again later.")
      setIsLoading(false)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    void video.addEventListener("loadedmetadata", handleLoadedMetadata)
    void video.addEventListener("timeupdate", handleTimeUpdate)
    void video.addEventListener("error", handleError)
    void document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Auto-play once loaded
    void video.load()
    video
      .play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch((err) => {
        void console.warn("Auto-play prevented:", err)
      })

    return () => {
      void video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      void video.removeEventListener("timeupdate", handleTimeUpdate)
      void video.removeEventListener("error", handleError)
      void document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [videoId, viewTracked])

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const handleMouseMove = () => {
      setShowControls(true)

      // Reset the timeout
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }

      // Hide controls after 1 second of inactivity
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 1000)

      setControlsTimeout(timeout)
    }

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    void container.addEventListener("mousemove", handleMouseMove)
    void container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      void container.removeEventListener("mousemove", handleMouseMove)
      void container.removeEventListener("mouseleave", handleMouseLeave)
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [isPlaying, controlsTimeout])

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      void video.pause()
    } else {
      video.play().catch((err) => {
        void console.error("Failed to play video:", err)
        setError("Failed to play video. Please try again.")
      })
    }
    setIsPlaying(!isPlaying)
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] ?? 0
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0] ?? 0
    setCurrentTime(newTime)

    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)

      // If unmuting, ensure volume is not 0
      if (!newMutedState && volume === 0) {
        setVolume(0.5)
        videoRef.current.volume = 0.5
      }
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        void container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen()
      }
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Calculate progress percentage (currently unused)
  // const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      id="video-container"
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
      onClick={togglePlay}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full max-h-[70vh]"
        playsInline
        onEnded={() => setIsPlaying(false)}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to container
      />

      {/* Top controls - always visible */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20">
        <h3 className="text-white font-medium truncate">{title}</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            void e.stopPropagation()
            onClose()
          }}
          className="text-white h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Play/Pause icon overlay */}
      {(!isPlaying || showControls) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center z-10"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-black/30 p-8 backdrop-blur-sm">
            {isPlaying ? <Pause className="h-12 w-12 text-white" /> : <Play className="h-12 w-12 text-white" />}
          </div>
        </motion.div>
      )}

      {/* Bottom controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20"
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to container
      >
        {/* Progress bar */}
        <div className="flex items-center mb-2 relative h-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration ?? 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
            aria-label="Video progress"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white p-2 h-8 w-8"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  void e.stopPropagation()
                  toggleMute()
                }}
                onMouseEnter={() => setShowVolume(true)}
                className="text-white p-2 h-8 w-8"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ?? volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              {/* Volume slider - appears on hover */}
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "80px" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-full ml-2 bg-black/60 rounded-full p-2 flex items-center"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                >
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-16"
                    aria-label="Volume"
                  />
                </motion.div>
              )}
            </div>

            <span className="text-white text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              void e.stopPropagation()
              toggleFullscreen()
            }}
            className="text-white p-2 h-8 w-8"
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
