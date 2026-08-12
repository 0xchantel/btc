'use client'

import React from 'react'
import styles from './Wallet.module.css'
import { useWallet } from '@/contexts/WalletContext'

export const WalletConnect: React.FC = () => {
  const { isConnected, publicKey, balance, network, loading, error, connectWallet, disconnectWallet, switchNetwork } = useWallet()

  const handleConnect = async () => {
    await connectWallet(network)
  }

  return (
    <div className={styles.walletConnectContainer}>
      {isConnected ? (
        <div className={styles.connectedWallet}>
          <div className={styles.walletInfo}>
            <div className={styles.label}>Wallet Connected ✓</div>
            <div className={styles.publicKey}>
              {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
            </div>
            {balance !== null && (
              <div className={styles.balance}>
                Balance: <strong>{balance.toFixed(2)} XLM</strong>
              </div>
            )}
            <div className={styles.network}>
              Network: <strong>{network}</strong>
            </div>
          </div>
          <button className={styles.disconnectBtn} onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      ) : (
        <div className={styles.disconnectedWallet}>
          <div className={styles.label}>Wallet Not Connected</div>
          <button
            className={styles.connectBtn}
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : '🔗 Connect Wallet'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
          <p className={styles.note}>
            Make sure you have Freighter wallet extension installed
          </p>
        </div>
      )}
    </div>
  )
}
