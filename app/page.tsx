'use client';

import { useState } from 'react';

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState({ scanned: 0, highScore: 0 });

  const startScanning = () => {
    setIsScanning(true);
    
    const interval = setInterval(() => {
      const mockToken = {
        name: 'MockCoin' + Math.random().toString(36).substring(7),
        symbol: 'MOCK',
        score: Math.random() * 100,
        timestamp: new Date(),
      };
      
      if (mockToken.score >= 70) {
        setSignals(prev => [mockToken, ...prev].slice(0, 10));
      }
      
      setStats(prev => ({
        scanned: prev.scanned + 1,
        highScore: Math.max(prev.highScore, mockToken.score),
      }));
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      setIsScanning(false);
    }, 60000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">🎯 Meme Sniper</h1>
            <p className="text-gray-400 mt-2">AI-Powered Memecoin Hunter</p>
          </div>
          
          <button
            onClick={startScanning}
            disabled={isScanning}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Start Hunting'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Tokens Scanned</p>
            <p className="text-2xl font-bold">{stats.scanned}</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Highest Score</p>
            <p className="text-2xl font-bold text-green-400">{stats.highScore.toFixed(1)}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Live Signals {isScanning && <span className="text-green-400 animate-pulse">●</span>}
          </h2>
          
          {signals.length === 0 ? (
            <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400">
                {isScanning ? 'Scanning for targets...' : 'Click "Start Hunting" to begin'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {signals.map((signal, i) => (
                <div key={i} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{signal.name}</h3>
                      <p className="text-gray-400">${signal.symbol}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">
                        {signal.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {signal.score >= 85 ? 'BUY' : 'WATCH'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
