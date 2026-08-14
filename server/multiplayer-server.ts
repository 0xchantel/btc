import WebSocket from 'ws'
import { Server } from 'http'
import { createServer } from 'http'

interface Player {
  id: string
  name: string
  wallet: string
  ws: WebSocket
  sessionId: string | null
}

interface GameSession {
  id: string
  players: Map<string, Player>
  currentRound: string | null
  status: 'waiting' | 'in_progress' | 'completed'
  prizePool: number
  createdAt: number
}

interface GameMessage {
  type: string
  payload: any
  playerId?: string
  timestamp: number
}

class MultiplayerServer {
  private wss: WebSocket.Server
  private players: Map<string, Player> = new Map()
  private sessions: Map<string, GameSession> = new Map()
  private port: number
  private server: Server

  constructor(port: number = 8080) {
    this.port = port
    this.server = createServer()
    this.wss = new WebSocket.Server({ server: this.server })
    this.setupWebSocket()
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected')

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data) as GameMessage
          this.handleMessage(ws, message)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      })

      ws.on('close', () => {
        this.handleDisconnect(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
    })
  }

  private handleMessage(ws: WebSocket, message: GameMessage): void {
    switch (message.type) {
      case 'player_joined':
        this.handlePlayerJoined(ws, message.payload)
        break
      case 'create_session':
        this.handleCreateSession(ws, message.payload)
        break
      case 'join_session':
        this.handleJoinSession(ws, message.payload)
        break
      case 'answer_submitted':
        this.handleAnswerSubmitted(ws, message.payload)
        break
      case 'round_ended':
        this.handleRoundEnded(ws, message.payload)
        break
      case 'chat':
        this.handleChat(ws, message.payload)
        break
      case 'leave_session':
        this.handleLeaveSession(ws, message.payload)
        break
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  private handlePlayerJoined(ws: WebSocket, payload: any): void {
    const player: Player = {
      id: payload.playerId,
      name: payload.playerName,
      wallet: payload.wallet,
      ws,
      sessionId: null,
    }
    this.players.set(player.id, player)
    console.log(`Player ${player.name} connected`)
    this.broadcastToAll({
      type: 'player_joined',
      payload: {
        playerId: player.id,
        playerName: player.name,
        totalPlayers: this.players.size,
      },
      timestamp: Date.now(),
    })
  }

  private handleCreateSession(ws: WebSocket, payload: any): void {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: GameSession = {
      id: sessionId,
      players: new Map(),
      currentRound: null,
      status: 'waiting',
      prizePool: payload.prizePool || 10,
      createdAt: Date.now(),
    }
    this.sessions.set(sessionId, session)
    console.log(`Session ${sessionId} created`)

    ws.send(
      JSON.stringify({
        type: 'session_created',
        payload: { sessionId },
        timestamp: Date.now(),
      })
    )
  }

  private handleJoinSession(ws: WebSocket, payload: any): void {
    const { sessionId, playerId } = payload
    const session = this.sessions.get(sessionId)
    const player = this.players.get(playerId)

    if (!session || !player) {
      ws.send(
        JSON.stringify({
          type: 'error',
          payload: { message: 'Session or player not found' },
          timestamp: Date.now(),
        })
      )
      return
    }

    player.sessionId = sessionId
    session.players.set(playerId, player)
    console.log(`Player ${player.name} joined session ${sessionId}`)

    // Notify all players in session
    this.broadcastToSession(sessionId, {
      type: 'player_joined_session',
      payload: {
        playerId,
        playerName: player.name,
        totalPlayers: session.players.size,
      },
      timestamp: Date.now(),
    })
  }

  private handleAnswerSubmitted(ws: WebSocket, payload: any): void {
    const { playerId, sessionId, category, answer, roundId } = payload
    const session = this.sessions.get(sessionId)

    if (!session) return

    // Broadcast to all players in session
    this.broadcastToSession(sessionId, {
      type: 'answer_submitted',
      payload: {
        playerId,
        category,
        answer,
        roundId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    })
  }

  private handleRoundEnded(ws: WebSocket, payload: any): void {
    const { sessionId, roundId } = payload
    const session = this.sessions.get(sessionId)

    if (!session) return

    session.status = 'completed'
    this.broadcastToSession(sessionId, {
      type: 'round_ended',
      payload: { roundId },
      timestamp: Date.now(),
    })
  }

  private handleChat(ws: WebSocket, payload: any): void {
    const { playerId, sessionId, message } = payload
    const session = this.sessions.get(sessionId)
    const player = this.players.get(playerId)

    if (!session || !player) return

    this.broadcastToSession(sessionId, {
      type: 'chat',
      payload: {
        playerId,
        playerName: player.name,
        message,
      },
      timestamp: Date.now(),
    })
  }

  private handleLeaveSession(ws: WebSocket, payload: any): void {
    const { sessionId, playerId } = payload
    const session = this.sessions.get(sessionId)
    const player = this.players.get(playerId)

    if (!session || !player) return

    session.players.delete(playerId)
    player.sessionId = null

    if (session.players.size === 0) {
      this.sessions.delete(sessionId)
      console.log(`Session ${sessionId} deleted (no players)`)
    } else {
      this.broadcastToSession(sessionId, {
        type: 'player_left_session',
        payload: {
          playerId,
          totalPlayers: session.players.size,
        },
        timestamp: Date.now(),
      })
    }
  }

  private handleDisconnect(ws: WebSocket): void {
    // Find and remove player
    for (const [playerId, player] of this.players.entries()) {
      if (player.ws === ws) {
        const sessionId = player.sessionId
        this.players.delete(playerId)
        console.log(`Player ${player.name} disconnected`)

        // Remove from session if in one
        if (sessionId) {
          const session = this.sessions.get(sessionId)
          if (session) {
            session.players.delete(playerId)
            if (session.players.size === 0) {
              this.sessions.delete(sessionId)
            } else {
              this.broadcastToSession(sessionId, {
                type: 'player_left_session',
                payload: {
                  playerId,
                  totalPlayers: session.players.size,
                },
                timestamp: Date.now(),
              })
            }
          }
        }
        break
      }
    }
  }

  private broadcastToAll(message: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  private broadcastToSession(sessionId: string, message: any): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    for (const player of session.players.values()) {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message))
      }
    }
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`🎮 Multiplayer server running on ws://localhost:${this.port}`)
      console.log(`📊 Active players: 0`)
      console.log(`🎯 Active sessions: 0`)
    })
  }

  public stop(): void {
    this.wss.close(() => {
      console.log('WebSocket server closed')
    })
    this.server.close(() => {
      console.log('HTTP server closed')
    })
  }

  public getStats() {
    return {
      activePlayers: this.players.size,
      activeSessions: this.sessions.size,
      totalSessions: this.sessions.size,
    }
  }
}

// Start server
const server = new MultiplayerServer(process.env.PORT ? parseInt(process.env.PORT) : 8080)
server.start()

export default MultiplayerServer
