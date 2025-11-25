import React, { useState } from 'react';
import { Player } from '../types';
import { Fingerprint, ChevronRight, ShieldCheck } from 'lucide-react';

interface RoleRevealProps {
  player: Player;
  onNext: () => void;
  currentPlayerIndex: number;
  totalPlayers: number;
}

const RoleReveal: React.FC<RoleRevealProps> = ({ player, onNext, currentPlayerIndex, totalPlayers }) => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-flip-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-1">身份确认</h2>
        <p className="text-gray-400 text-sm">
          玩家 {currentPlayerIndex + 1} / {totalPlayers}
        </p>
      </div>

      <div className="w-full max-w-sm aspect-[3/4] relative">
        {!showContent ? (
          // Waiting / Cover State
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-bounce-subtle">
               <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">请传递手机</h3>
            <p className="text-gray-400 text-center mb-8 px-4">
              请将手机交给<br/>
              <span className="text-xl text-primary font-bold mt-2 block">玩家 {player.id}</span>
            </p>

            <button 
              onClick={() => setShowContent(true)}
              className="w-full py-4 bg-primary rounded-xl text-white font-bold text-lg shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-5 h-5" /> 查看词语
            </button>
            <p className="text-xs text-gray-500 mt-4">确认身份后点击查看</p>
          </div>
        ) : (
          // Revealed State
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-primary/30 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="text-7xl mb-6">{player.avatar}</div>
            
            <div className="text-center mb-8 w-full">
              <p className="text-indigo-200 text-sm mb-2 uppercase tracking-widest">你的身份是</p>
              <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl py-6 px-4">
                <span className="text-3xl font-bold text-white block break-words">
                  {player.word}
                </span>
                {player.role === '白板' && (
                  <span className="text-xs text-gray-400 mt-2 block">(你是一张白纸，没有词语)</span>
                )}
              </div>
            </div>

            <button 
              onClick={onNext}
              className="w-full py-4 bg-secondary rounded-xl text-white font-bold text-lg shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" /> 隐藏并传给下一位
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleReveal;