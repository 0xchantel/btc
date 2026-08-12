/**
 * Real-time multiplayer service using WebSockets
 */

import { Player } from '@/lib/gameLogic'

export interface GameMessage {
  type:
    | 'player_joined'
    | 'player_left'
    | 'answer_submitted'
    | 'round_started'
    | 'round_ended'
    | 'chat'
    | 'game_state_update'
  payload: any
  playerId?: string
  timestamp: number
}

export interface MultiplayerSession {
  sessionId: string
  players: Player[]
  currentRoundId: string | null
  status: 'waiting' | 'in_progress' | 'completed'
  createdAt: number
}

export class MultiplayerService {
  private ws: WebSocket | null = null
  private url: string
  private sessionId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageHandlers: Map<string, Function[]> = new Map()
  private isConnected = false

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to WebSocket server
   */
  async connect(playerId: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.emit('connected', { playerId })
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as GameMessage
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', { error })
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.isConnected = false
          this.attemptReconnect(playerId)
        }
      } catch (error) {
        console.error('Failed to connect:', error)
        resolve(false)
      }
    })
  }

  /**
   * Send a game message
   */
  sendMessage(type: GameMessage['type'], payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected')
      return
    }

    const message: GameMessage = {
      type,
      payload,
      timestamp: Date.now(),
    }

    this.ws.send(JSON.stringify(message))
  }

  /**
   * Submit answer to other players
   */
  submitAnswer(
    playerId: string,
    category: string,
    answer: string,
    roundId: string
  ): void {
    this.sendMessage('answer_submitted', {
      playerId,
      category,
      answer,
      roundId,
    })
  }

  /**
   * Join a multiplayer session
   */
  joinSession(sessionId: string, player: Player): void {
    this.sessionId = sessionId
    this.sendMessage('player_joined', {
      sessionId,
      player,
    })
  }

  /**
   * Leave multiplayer session
   */
  leaveSession(): void {
    if (this.sessionId) {
      this.sendMessage('player_left', {
        sessionId: this.sessionId,
      })
      this.sessionId = null
    }
  }

  /**
   * Send chat message
   */
  sendChat(playerId: string, message: string): void {
    this.sendMessage('chat', {
      playerId,
      message,
    })
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: GameMessage): void {
    const handlers = this.messageHandlers.get(message.type) || []
    handlers.forEach((handler) => handler(message.payload))
  }

  /**
   * Subscribe to message type
   */
  on(type: GameMessage['type'], handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  /**
   * Unsubscribe from message type
   */
  off(type: GameMessage['type'], handler: Function): void {
    const handlers = this.messageHandlers.get(type) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * Emit internal events
   */
  private emit(type: string, data: any): void {
    this.handleMessage({
      type: type as any,
      payload: data,
      timestamp: Date.now(),
    })
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(playerId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Exponential backoff
      console.log(`Attempting to reconnect in ${delay}ms...`)
      setTimeout(() => {
        this.connect(playerId)
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('connection_failed', {})
    }
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected
  }
}

export default MultiplayerService
