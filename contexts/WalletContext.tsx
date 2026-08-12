'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import WalletManager, { WalletConnection } from '@/lib/walletManager'

export interface WalletContextType {
  walletManager: WalletManager
  connection: WalletConnection | null
  isConnected: boolean
  publicKey: string | null
  balance: number | null
  network: 'testnet' | 'mainnet'
  loading: boolean
  error: string | null
  
  // Actions
  connectWallet: (network?: 'testnet' | 'mainnet') => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (network: 'testnet' | 'mainnet') => void
  fetchBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const walletManager = new WalletManager()
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore connection on mount
  React.useEffect(() => {
    const restored = walletManager.restoreConnection()
    if (restored) {
      setConnection(restored)
    }
  }, [])

  const connectWallet = useCallback(
    async (network: 'testnet' | 'mainnet' = 'testnet') => {
      setLoading(true)
      setError(null)
      try {
        const conn = await walletManager.connectWallet(network)
        if (conn) {
          setConnection(conn)
          await fetchBalance()
        } else {
          setError('Failed to connect wallet. Make sure Freighter is installed.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed')
      } finally {
        setLoading(false)
      }
    },
    [walletManager]
  )

  const disconnectWallet = useCallback(() => {
    walletManager.disconnectWallet()
    setConnection(null)
    setBalance(null)
    setError(null)
  }, [walletManager])

  const switchNetwork = useCallback((network: 'testnet' | 'mainnet') => {
    if (connection) {
      connection.network = network
      setConnection({ ...connection })
    }
  }, [connection])

  const fetchBalance = useCallback(async () => {
    const publicKey = walletManager.getPublicKey()
    if (!publicKey) return

    try {
      const bal = await walletManager.getPlayerBalance?.(publicKey)
      setBalance(bal || 0)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }, [walletManager])

  const value: WalletContextType = {
    walletManager,
    connection,
    isConnected: walletManager.isConnected(),
    publicKey: walletManager.getPublicKey(),
    balance,
    network: walletManager.getNetwork(),
    loading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    fetchBalance,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
