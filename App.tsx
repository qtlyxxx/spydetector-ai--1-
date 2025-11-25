import React, { useState, useEffect } from 'react';
import { GamePhase, GameSettings, Player, Role, WordPair } from './types';
import { AVATARS, MAX_PLAYERS, MIN_PLAYERS } from './constants';
import WordManager from './components/WordManager';
import RoleReveal from './components/RoleReveal';
import Gameplay from './components/Gameplay';
import { Users, VenetianMask, FileQuestion, Play } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [settings, setSettings] = useState<GameSettings>({
    totalPlayers: 6,
    spyCount: 1,
    hasBlank: false,
    selectedWordPair: null
  });
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [winner, setWinner] = useState<'CIVILIAN' | 'SPY' | null>(null);

  // Setup Phase Handlers
  const handlePlayerCountChange = (delta: number) => {
    setSettings(prev => {
      const newTotal = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, prev.totalPlayers + delta));
      // Ensure spies < total / 2
      const maxSpies = Math.floor((newTotal - 1) / 2);
      const newSpies = Math.min(prev.spyCount, maxSpies);
      return { ...prev, totalPlayers: newTotal, spyCount: newSpies };
    });
  };

  const handleSpyCountChange = (delta: number) => {
    setSettings(prev => {
      const maxSpies = Math.floor((prev.totalPlayers - 1) / 2);
      const newSpies = Math.max(1, Math.min(maxSpies, prev.spyCount + delta));
      return { ...prev, spyCount: newSpies };
    });
  };

  const startGame = () => {
    if (!settings.selectedWordPair) {
      alert("请先选择一个词库！");
      return;
    }

    const { totalPlayers, spyCount, hasBlank, selectedWordPair } = settings;
    
    // Save played word ID to history
    try {
      const playedIds = JSON.parse(localStorage.getItem('spy_played_ids') || '[]');
      if (!playedIds.includes(selectedWordPair.id)) {
        const newPlayedIds = [...playedIds, selectedWordPair.id];
        localStorage.setItem('spy_played_ids', JSON.stringify(newPlayedIds));
      }
    } catch (e) {
      console.error("Failed to save history", e);
    }

    // Create roles array
    let roles: Role[] = [];
    roles = roles.concat(Array(spyCount).fill(Role.SPY));
    if (hasBlank) {
      roles.push(Role.BLANK);
    }
    const civilianCount = totalPlayers - roles.length;
    roles = roles.concat(Array(civilianCount).fill(Role.CIVILIAN));
    
    // Shuffle roles
    roles = roles.sort(() => Math.random() - 0.5);
    
    // Shuffle avatars
    const shuffledAvatars = [...AVATARS].sort(() => Math.random() - 0.5);

    // Create players
    const newPlayers: Player[] = roles.map((role, index) => ({
      id: index + 1,
      role,
      word: role === Role.CIVILIAN ? selectedWordPair.civilian 
            : role === Role.SPY ? selectedWordPair.spy 
            : '', // Blank gets empty string for now, UI handles display
      isAlive: true,
      avatar: shuffledAvatars[index % shuffledAvatars.length]
    }));

    setPlayers(newPlayers);
    setRevealIndex(0);
    setWinner(null);
    setPhase(GamePhase.REVEAL);
  };

  const handleNextReveal = () => {
    if (revealIndex < players.length - 1) {
      setRevealIndex(prev => prev + 1);
    } else {
      setPhase(GamePhase.PLAYING);
    }
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const aliveSpies = currentPlayers.filter(p => p.isAlive && p.role === Role.SPY).length;
    const aliveCivilians = currentPlayers.filter(p => p.isAlive && p.role !== Role.SPY).length; // Blank counts as civilian side for numbers usually, or just non-spy

    if (aliveSpies === 0) {
      setWinner('CIVILIAN');
    } else if (aliveSpies >= aliveCivilians) {
      setWinner('SPY');
    }
  };

  const handleEliminate = (id: number) => {
    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, isAlive: false } : p
    );
    setPlayers(updatedPlayers);
    
    // Check win condition immediately
    checkWinCondition(updatedPlayers);
  };

  const restartGame = () => {
    setPhase(GamePhase.SETUP);
    setWinner(null);
    setPlayers([]);
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-white">
      <div className="max-w-md mx-auto min-h-screen bg-dark shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
            <div className="absolute top-1/2 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl opacity-40 mix-blend-screen"></div>
        </div>

        {/* Header (Only on Setup) */}
        {phase === GamePhase.SETUP && (
            <div className="pt-8 pb-4 px-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    谁是卧底
                </h1>
                <p className="text-gray-400 text-sm mt-1">聚会必备神器 • AI 出题</p>
            </div>
        )}

        {/* Content Area */}
        <main className="flex-1 relative z-10">
          
          {phase === GamePhase.SETUP && (
            <div className="px-6 py-2 space-y-6 animate-flip-in">
              
              {/* Settings Card */}
              <div className="bg-surface p-5 rounded-2xl border border-white/5 shadow-xl space-y-5">
                
                {/* Total Players */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold">玩家人数</div>
                        <div className="text-xs text-gray-400">Total Players</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-dark/50 rounded-lg p-1">
                    <button onClick={() => handlePlayerCountChange(-1)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xl font-bold">-</button>
                    <span className="w-6 text-center font-mono font-bold text-lg">{settings.totalPlayers}</span>
                    <button onClick={() => handlePlayerCountChange(1)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xl font-bold">+</button>
                  </div>
                </div>

                {/* Spy Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                      <VenetianMask className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold">卧底人数</div>
                        <div className="text-xs text-gray-400">Spies</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-dark/50 rounded-lg p-1">
                    <button onClick={() => handleSpyCountChange(-1)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xl font-bold">-</button>
                    <span className="w-6 text-center font-mono font-bold text-lg">{settings.spyCount}</span>
                    <button onClick={() => handleSpyCountChange(1)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xl font-bold">+</button>
                  </div>
                </div>

                {/* Whiteboard Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold">加入白板</div>
                        <div className="text-xs text-gray-400">Blank Slate</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.hasBlank}
                      onChange={e => setSettings(prev => ({...prev, hasBlank: e.target.checked}))}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Word Selection */}
              <WordManager 
                selectedPairId={settings.selectedWordPair?.id}
                onSelect={(pair) => setSettings(prev => ({...prev, selectedWordPair: pair}))}
              />

              {/* Start Button */}
              <button 
                onClick={startGame}
                disabled={!settings.selectedWordPair}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold text-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="fill-current w-6 h-6" /> 开始游戏
              </button>
              
              <p className="text-center text-xs text-gray-500 pb-4">
                 当前词库: {settings.selectedWordPair ? (settings.selectedWordPair.category || '已选择') : '未选择'} 
                 {settings.selectedWordPair && <span className="ml-2 text-gray-600">(内容已隐藏)</span>}
              </p>
            </div>
          )}

          {phase === GamePhase.REVEAL && (
            <RoleReveal 
              key={revealIndex}
              player={players[revealIndex]}
              onNext={handleNextReveal}
              currentPlayerIndex={revealIndex}
              totalPlayers={players.length}
            />
          )}

          {(phase === GamePhase.PLAYING || phase === GamePhase.GAME_OVER) && (
            <Gameplay 
              players={players}
              onEliminate={handleEliminate}
              onRestart={restartGame}
              winner={winner}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;