'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/toast'

export interface RealtimeUpdate {
  type: 'booking' | 'appointment' | 'customer' | 'payment' | 'analytics'
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  data: any
  timestamp: Date
  id: string
}

interface UseRealtimeUpdatesOptions {
  onUpdate?: (update: RealtimeUpdate) => void
  enableNotifications?: boolean
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface RealtimeState {
  isConnected: boolean
  isConnecting: boolean
  lastUpdate: Date | null
  connectionAttempts: number
  updates: RealtimeUpdate[]
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    onUpdate,
    enableNotifications = true,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options

  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    lastUpdate: null,
    connectionAttempts: 0,
    updates: [],
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const connect = () => {
    if (!mountedRef.current || state.isConnected || state.isConnecting) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true }))

    try {
      // Create EventSource connection for Server-Sent Events
      const eventSource = new EventSource('/api/admin/realtime')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        if (!mountedRef.current) return
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionAttempts: 0,
        }))

        if (enableNotifications) {
          toast.success('Real-time updates connected', 'Dashboard will update automatically')
        }
      }

      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return

        try {
          const update: RealtimeUpdate = JSON.parse(event.data)
          update.timestamp = new Date(update.timestamp)

          setState(prev => ({
            ...prev,
            lastUpdate: update.timestamp,
            updates: [update, ...prev.updates.slice(0, 49)], // Keep last 50 updates
          }))

          onUpdate?.(update)

          // Show notification for important updates
          if (enableNotifications) {
            showUpdateNotification(update)
          }
        } catch (error) {
          console.error('Failed to parse realtime update:', error)
        }
      }

      eventSource.onerror = () => {
        if (!mountedRef.current) return

        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }))

        eventSource.close()
        eventSourceRef.current = null

        // Auto-reconnect with exponential backoff
        if (autoReconnect && state.connectionAttempts < maxReconnectAttempts) {
          const delay = Math.min(
            reconnectInterval * Math.pow(2, state.connectionAttempts),
            30000 // Max 30 seconds
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setState(prev => ({ ...prev, connectionAttempts: prev.connectionAttempts + 1 }))
              connect()
            }
          }, delay)
        } else if (enableNotifications && state.connectionAttempts >= maxReconnectAttempts) {
          toast.error(
            'Connection lost',
            'Real-time updates disconnected. Refresh the page to reconnect.',
            {
              label: 'Refresh',
              onClick: () => window.location.reload(),
            }
          )
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }))
      console.error('Failed to establish realtime connection:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }))
  }

  const showUpdateNotification = (update: RealtimeUpdate) => {
    const { type, action, data } = update

    switch (type) {
      case 'booking':
        if (action === 'created') {
          toast.info('New booking received', `${data.clientName} booked an appointment`)
        } else if (action === 'status_changed') {
          toast.info('Booking updated', `Booking status changed to ${data.status}`)
        }
        break

      case 'appointment':
        if (action === 'created') {
          toast.info('New appointment scheduled', `Appointment for ${data.clientName}`)
        } else if (action === 'updated') {
          toast.info('Appointment updated', `Changes made to ${data.clientName}'s appointment`)
        }
        break

      case 'payment':
        if (action === 'created') {
          toast.success('Payment received', `$${data.amount} payment processed`)
        }
        break

      case 'customer':
        if (action === 'created') {
          toast.info('New customer', `${data.name} joined`)
        }
        break
    }
  }

  // Auto-connect on mount
  useEffect(() => {
    connect()

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    clearUpdates: () => setState(prev => ({ ...prev, updates: [] })),
  }
}

// Polling fallback for when SSE is not available
export function usePollingUpdates(
  fetcher: () => Promise<any>,
  interval: number = 30000,
  enabled: boolean = true
) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const poll = async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Polling failed'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    poll()

    // Set up polling
    intervalRef.current = setInterval(poll, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval])

  return {
    data,
    isLoading,
    error,
    refetch: poll,
  }
}

// Hook for dashboard-specific real-time updates
export function useDashboardRealtime() {
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    pendingPayments: 0,
  })

  const { isConnected, updates } = useRealtimeUpdates({
    onUpdate: (update) => {
      // Update metrics based on realtime updates
      switch (update.type) {
        case 'booking':
          if (update.action === 'created') {
            setMetrics(prev => ({ ...prev, totalBookings: prev.totalBookings + 1 }))
          }
          break
        case 'payment':
          if (update.action === 'created') {
            setMetrics(prev => ({
              ...prev,
              totalRevenue: prev.totalRevenue + update.data.amount,
              pendingPayments: Math.max(0, prev.pendingPayments - 1),
            }))
          }
          break
        case 'customer':
          if (update.action === 'created') {
            setMetrics(prev => ({ ...prev, activeCustomers: prev.activeCustomers + 1 }))
          }
          break
      }
    },
    enableNotifications: true,
  })

  return {
    metrics,
    isConnected,
    recentUpdates: updates.slice(0, 10),
  }
}

// WebSocket alternative (for more complex real-time needs)
export function useWebSocketUpdates(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setIsConnected(true)
      setSocket(ws)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        setMessages(prev => [message, ...prev.slice(0, 99)])
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      setSocket(null)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }

  return {
    isConnected,
    messages,
    sendMessage,
  }
}