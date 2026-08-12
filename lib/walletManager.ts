/**
 * Wallet Manager for I CALL ON
 * Handles Stellar wallet connections and transactions
 */

import { Keypair } from 'stellar-sdk'

export interface WalletConnection {
  connected: boolean
  publicKey: string
  keypair?: Keypair
  network: 'testnet' | 'mainnet'
}

export class WalletManager {
  private connection: WalletConnection | null = null
  private readonly STORAGE_KEY = 'icall_on_wallet'

  /**
   * Connect to Stellar wallet (Freighter or similar)
   */
  async connectWallet(network: 'testnet' | 'mainnet' = 'testnet'): Promise<WalletConnection | null> {
    try {
      // Check if Freighter or similar wallet extension is available
      if (typeof window !== 'undefined' && (window as any).freighter) {
        const publicKey = await (window as any).freighter.getPublicKey()
        
        if (!publicKey) {
          console.error('Failed to get public key from wallet')
          return null
        }

        this.connection = {
          connected: true,
          publicKey,
          network,
        }

        // Store connection info (without private keys)
        this.storeConnection()
        return this.connection
      } else {
        console.error('Freighter wallet not found. Please install it.')
        return null
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return null
    }
  }

  /**
   * Connect with local keypair (for testing only)
   */
  connectLocalKeypair(secretKey: string, network: 'testnet' | 'mainnet' = 'testnet'): WalletConnection | null {
    try {
      const keypair = Keypair.fromSecret(secretKey)
      this.connection = {
        connected: true,
        publicKey: keypair.publicKey(),
        keypair,
        network,
      }
      return this.connection
    } catch (error) {
      console.error('Failed to connect local keypair:', error)
      return null
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.connection = null
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Get current connection
   */
  getConnection(): WalletConnection | null {
    return this.connection
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connection?.connected ?? false
  }

  /**
   * Get public key
   */
  getPublicKey(): string | null {
    return this.connection?.publicKey ?? null
  }

  /**
   * Get keypair (only available for local connections)
   */
  getKeypair(): Keypair | null {
    return this.connection?.keypair ?? null
  }

  /**
   * Get network
   */
  getNetwork(): 'testnet' | 'mainnet' {
    return this.connection?.network ?? 'testnet'
  }

  /**
   * Sign a transaction with connected wallet
   */
  async signTransaction(transaction: any): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).freighter) {
        const signedXdr = await (window as any).freighter.signTransaction(
          transaction.toXDR(),
          {
            network: this.connection?.network === 'mainnet' ? 'PUBLIC' : 'TESTNET',
          }
        )
        return signedXdr
      }
      return null
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      return null
    }
  }

  /**
   * Store connection info to localStorage
   */
  private storeConnection(): void {
    if (this.connection) {
      const stored = {
        publicKey: this.connection.publicKey,
        network: this.connection.network,
        connected: true,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored))
    }
  }

  /**
   * Restore connection from localStorage
   */
  restoreConnection(): WalletConnection | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.connection = {
          connected: true,
          publicKey: data.publicKey,
          network: data.network,
        }
        return this.connection
      }
    } catch (error) {
      console.error('Failed to restore connection:', error)
    }
    return null
  }
}

export default WalletManager
