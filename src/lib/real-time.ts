"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { TattooImage, VideoProcess } from "@/types/gallery"

// WebSocket connection URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://api.yourtattoogallery.com/ws"

type WebSocketMessage = {
  type: "like" | "bookmark" | "new_tattoo" | "new_video" | "view_count" | "error"
  data: any
}

// Custom hook for real-time updates
export function useRealTimeUpdates(
  onLikeUpdate?: (tattooId: number, likes: number) => void,
  onNewTattoo?: (tattoo: TattooImage) => void,
  onNewVideo?: (video: VideoProcess) => void,
  onViewCountUpdate?: (videoId: number, views: number) => void,
) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("Max reconnect attempts reached. Giving up on real-time updates.")
        return
      }

      try {
        ws = new WebSocket(WS_URL)

        ws.onopen = () => {
          console.log("WebSocket connected")
          setIsConnected(true)
          setReconnectAttempts(0)
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)

            switch (message.type) {
              case "like":
                if (onLikeUpdate) {
                  onLikeUpdate(message.data.tattooId, message.data.likes)
                }
                break
              case "new_tattoo":
                if (onNewTattoo) {
                  onNewTattoo(message.data)
                  toast({
                    title: "New Tattoo Added",
                    description: `A new ${message.data.category} tattoo has been added to the gallery.`,
                  })
                }
                break
              case "new_video":
                if (onNewVideo) {
                  onNewVideo(message.data)
                  toast({
                    title: "New Video Added",
                    description: `A new video "${message.data.title}" has been added.`,
                  })
                }
                break
              case "view_count":
                if (onViewCountUpdate) {
                  onViewCountUpdate(message.data.videoId, message.data.views)
                }
                break
              case "error":
                console.error("WebSocket error message:", message.data)
                toast({
                  title: "Update Error",
                  description: message.data.message || "An error occurred with real-time updates",
                  variant: "destructive",
                })
                break
              default:
                console.warn("Unknown message type:", message.type)
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err)
          }
        }

        ws.onclose = () => {
          console.log("WebSocket disconnected")
          setIsConnected(false)

          // Attempt to reconnect
          reconnectTimeout = setTimeout(
            () => {
              setReconnectAttempts((prev) => prev + 1)
              connect()
            },
            3000 * (reconnectAttempts + 1),
          ) // Exponential backoff
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          ws?.close()
        }

        setSocket(ws)
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error)
        setReconnectAttempts((prev) => prev + 1)
      }
    }

    connect()

    // Cleanup function
    return () => {
      if (ws) {
        ws.close()
      }
      clearTimeout(reconnectTimeout)
    }
  }, [reconnectAttempts, onLikeUpdate, onNewTattoo, onNewVideo, onViewCountUpdate])

  // Function to send messages to the server
  const sendMessage = (type: string, data: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type, data }))
      return true
    }
    return false
  }

  return { isConnected, sendMessage }
}

// Function to format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
