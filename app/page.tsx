'use client'

import { useState, useEffect } from 'react'
import { Target } from 'lucide-react'

interface Token {
  mint: string
  name: string
  symbol: string
  score: number
  action: 'BUY' | 'WATCH'
  liquidity?: number
  holders?: number
  risk?: string
}

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])
  const [stats, setStats] = useState({
    scanned: 0,
    highestScore: 0
  })

  // リアルデータ取得関数
  const fetchRealTokens = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_PUMPFUN_API || 'https://frontend-api.pump.fun/coins'
      )
      
      if (!response.ok) {
        console.error('API Error:', response.status)
        return []
      }

      const data = await response.json()
      
      // 最新の20トークンを取得
      const latestTokens = data.slice(0, 20)
      
      // スコアリング
      const scoredTokens = await Promise.all(
        latestTokens.map(async (token: any) => {
          const score = calculateScore(token)
          
          return {
            mint: token.mint || token.address || 'unknown',
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'UNKNOWN',
            score: score,
            action: score >= 85 ? 'BUY' : 'WATCH',
            liquidity: token.usd_market_cap || 0,
            holders: token.reply_count || 0,
            risk: score < 70 ? 'High' : score < 85 ? 'Medium' : 'Low'
          } as Token
        })
      )

      // スコア70以上のみ表示
      return scoredTokens.filter(t => t.score >= 70)
      
    } catch (error) {
      console.error('Fetch error:', error)
      return []
    }
  }

  // スコア計算関数（簡易版）
  const calculateScore = (token: any): number => {
    let score = 50 // 基本点

    // 流動性チェック
    if (token.usd_market_cap > 50000) score += 15
    else if (token.usd_market_cap > 10000) score += 10
    else if (token.usd_market_cap > 5000) score += 5

    // ホルダー数チェック
    if (token.reply_count > 100) score += 10
    else if (token.reply_count > 50) score += 7
    else if (token.reply_count > 20) score += 5

    // 作成時刻（新しいほど高得点）
    const hoursOld = token.created_timestamp 
      ? (Date.now() - token.created_timestamp) / 3600000 
      : 999
    
    if (hoursOld < 1) score += 10
    else if (hoursOld < 6) score += 7
    else if (hoursOld < 24) score += 5

    // ランダム要素（市場のノイズ）
    score += Math.random() * 10

    return Math.min(95, Math.max(50, Math.round(score)))
  }

  // スキャン開始
  const startScanning = async () => {
    setIsScanning(true)
    
    // 初回ロード
    const initialTokens = await fetchRealTokens()
    setTokens(initialTokens)
    setStats({
      scanned: initialTokens.length,
      highestScore: Math.max(...initialTokens.map(t => t.score), 0)
    })

    // 30秒ごとに更新
    const interval = setInterval(async () => {
      const newTokens = await fetchRealTokens()
      
      setTokens(prev => {
        const combined = [...newTokens, ...prev]
        // 重複削除
        const unique = combined.filter((token, index, self) =>
          index === self.findIndex(t => t.mint === token.mint)
        )
        // 最新50件のみ保持
        return unique.slice(0, 50)
      })

      setStats(prev => ({
        scanned: prev.scanned + newTokens.length,
        highestScore: Math.max(
          prev.highestScore,
          ...newTokens.map(t => t.score)
        )
      }))
    }, 30000) // 30秒ごと

    // 60秒後に自動停止
    setTimeout(() => {
      clearInterval(interval)
      setIsScanning(false)
    }, 60000)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* ヘッダー */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Target className="w-12 h-12 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold">Meme Sniper</h1>
            <p className="text-gray-400">AI-Powered Memecoin Hunter</p>
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={startScanning}
          disabled={isScanning}
          className={`px-8 py-3 rounded-lg font-bold mb-8 ${
            isScanning
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Start Hunting'}
        </button>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 mb-2">Tokens Scanned</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.scanned}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 mb-2">Highest Score</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.highestScore.toFixed(1)}
            </p>
          </div>
        </div>

        {/* トークンリスト */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">Live Signals</h2>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>

          {tokens.length === 0 && isScanning && (
            <p className="text-gray-500 text-center py-8">
              Scanning for high-potential tokens...
            </p>
          )}

          {tokens.length === 0 && !isScanning && (
            <p className="text-gray-500 text-center py-8">
              Click "Start Hunting" to begin scanning
            </p>
          )}

          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.mint}
                className="bg-gray-900 p-6 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold">{token.name}</h3>
                  <p className="text-gray-400">{token.symbol}</p>
                  {token.liquidity && token.liquidity > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Liquidity: ${token.liquidity.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400 mb-2">
                    {token.score.toFixed(1)}
                  </p>
                  <span
                    className={`px-4 py-1 rounded text-sm font-bold ${
                      token.action === 'BUY'
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}
                  >
                    {token.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
