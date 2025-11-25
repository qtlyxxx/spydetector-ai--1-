import React, { useMemo, useState } from 'react';
import { Player, Role } from '../types';
import { Skull, Crown, AlertTriangle, RefreshCw, X } from 'lucide-react';

interface GameplayProps {
  players: Player[];
  onEliminate: (playerId: number) => void;
  onRestart: () => void;
  winner: 'CIVILIAN' | 'SPY' | null;
}

const Gameplay: React.FC<GameplayProps> = ({ players, onEliminate, onRestart, winner }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  const handlePlayerClick = (id: number) => {
    if (selectedId === id) {
        setSelectedId(null);
    } else {
        setSelectedId(id);
    }
  };

  const confirmEliminate = (id: number) => {
      onEliminate(id);
      setSelectedId(null);
  };

  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-flip-in text-center">
        <div className="text-8xl mb-6">
            {winner === 'CIVILIAN' ? '🎉' : '🕵️‍♂️'}
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">
          {winner === 'CIVILIAN' ? '平民胜利!' : '卧底胜利!'}
        </h2>
        <p className="text-gray-400 mb-8">
          {winner === 'CIVILIAN' ? '所有卧底已被找出' : '卧底人数已追平平民'}
        </p>

        <div className="w-full max-w-md bg-surface rounded-xl p-4 mb-8 max-h-60 overflow-y-auto">
           <h3 className="text-left text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">复盘</h3>
           {players.map(p => (
             <div key={p.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
               <div className="flex items-center gap-2">
                 <span className="text-xl">{p.avatar}</span>
                 <span className={`font-medium ${p.role === Role.SPY ? 'text-secondary' : 'text-white'}`}>
                    玩家 {p.id}
                 </span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-sm text-gray-300">{p.word}</span>
                 <span className="text-[10px] text-gray-500">{p.role}</span>
               </div>
             </div>
           ))}
        </div>

        <button 
          onClick={onRestart}
          className="px-8 py-3 bg-primary rounded-full text-white font-bold text-lg shadow-lg hover:bg-indigo-500 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> 再来一局
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 max-w-4xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-surface/50 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase tracking-widest">游戏进行中</span>
            <div className="flex gap-4 mt-1">
               <span className="text-white font-bold text-sm">
                   存活玩家: {alivePlayers.length} 人
               </span>
            </div>
        </div>
        <button 
           onClick={() => { if(confirm("确定要重新开始吗?")) onRestart() }}
           className="p-2 text-gray-400 hover:text-white transition"
        >
            <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" /> 
            请点击选择一名玩家进行投票
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
          {alivePlayers.map(player => {
            const isSelected = selectedId === player.id;
            return (
                <button
                key={player.id}
                onClick={() => handlePlayerClick(player.id)}
                className={`aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center group relative overflow-hidden ${
                    isSelected 
                        ? 'bg-red-500/20 border-red-500 scale-105 z-10 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                        : 'bg-surface hover:bg-surface/80 border-white/10 hover:border-secondary'
                }`}
                >
                <div className="text-4xl mb-2 transition-transform">{player.avatar}</div>
                <span className={`text-sm font-medium ${isSelected ? 'text-red-400 font-bold' : 'text-gray-300'}`}>玩家 {player.id}</span>
                
                {isSelected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in">
                         <span className="text-white font-bold text-xs tracking-widest mb-1">选定</span>
                         <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                             <Skull className="w-5 h-5" />
                         </div>
                    </div>
                )}
                </button>
            );
          })}
        </div>

        {deadPlayers.length > 0 && (
            <>
                <h3 className="text-gray-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                    <Skull className="w-4 h-4" /> 
                    已出局
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {deadPlayers.map(player => (
                        <div key={player.id} className="opacity-50 bg-black/20 rounded-lg p-2 flex flex-col items-center border border-white/5 grayscale">
                            <span className="text-2xl">{player.avatar}</span>
                            <span className="text-xs text-gray-500 mt-1">玩家 {player.id}</span>
                            <span className="text-[10px] mt-0.5 px-1.5 rounded bg-gray-700 text-gray-400">
                                已出局
                            </span>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>

      {/* Footer / Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-center items-end bg-gradient-to-t from-dark to-transparent h-32">
          {selectedId ? (
              <div className="pointer-events-auto flex items-center gap-3 animate-slide-up w-full max-w-md">
                 <button 
                   onClick={() => setSelectedId(null)}
                   className="p-4 rounded-xl bg-surface border border-white/10 text-white shadow-lg hover:bg-white/10"
                 >
                     <X className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => confirmEliminate(selectedId)}
                   className="flex-1 py-4 bg-red-600 rounded-xl text-white font-bold text-lg shadow-lg hover:bg-red-700 flex items-center justify-center gap-2"
                 >
                     <Skull className="w-6 h-6" /> 确认淘汰 玩家 {selectedId}
                 </button>
              </div>
          ) : (
            <div className="bg-black/80 backdrop-blur text-white px-6 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">描述阶段 → 投票阶段 → 淘汰</span>
            </div>
          )}
      </div>

    </div>
  );
};

export default Gameplay;