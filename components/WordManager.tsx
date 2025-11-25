import React, { useState, useEffect } from 'react';
import { WordPair } from '../types';
import { DEFAULT_WORD_PAIRS } from '../constants';
import { generateWordPairs } from '../services/geminiService';
import { Trash2, Plus, Sparkles, RotateCcw, Eye, EyeOff, Check, Eraser } from 'lucide-react';

interface WordManagerProps {
  onSelect: (pair: WordPair) => void;
  selectedPairId: string | undefined;
}

const WordManager: React.FC<WordManagerProps> = ({ onSelect, selectedPairId }) => {
  const [pairs, setPairs] = useState<WordPair[]>([]);
  const [activeTab, setActiveTab] = useState<'default' | 'custom' | 'ai'>('default');
  const [showWords, setShowWords] = useState(false);
  
  // Custom Input State
  const [customCiv, setCustomCiv] = useState('');
  const [customSpy, setCustomSpy] = useState('');

  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPairs, setAiPairs] = useState<WordPair[]>([]);
  
  // History State
  const [playedIds, setPlayedIds] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    // Load Custom words
    const savedCustom = localStorage.getItem('spy_custom_words');
    const custom: WordPair[] = savedCustom ? JSON.parse(savedCustom) : [];
    setPairs([...DEFAULT_WORD_PAIRS, ...custom]);

    // Load AI words
    const savedAI = localStorage.getItem('spy_ai_words');
    if (savedAI) {
      setAiPairs(JSON.parse(savedAI));
    }

    // Load Played History
    const pIds = JSON.parse(localStorage.getItem('spy_played_ids') || '[]');
    setPlayedIds(pIds);
  }, []);

  const handleAddCustom = () => {
    if (!customCiv || !customSpy) return;
    const newPair: WordPair = {
      id: crypto.randomUUID(),
      civilian: customCiv,
      spy: customSpy,
      category: '自定义'
    };
    
    // Save to local storage
    const savedCustom = localStorage.getItem('spy_custom_words');
    const customList: WordPair[] = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedList = [newPair, ...customList];
    localStorage.setItem('spy_custom_words', JSON.stringify(updatedList));

    // Update state
    setPairs(prev => [...prev, newPair]);
    setCustomCiv('');
    setCustomSpy('');
    setActiveTab('custom');
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      // Add timeout to prevent indefinite loading
      const generatePromise = generateWordPairs(aiTopic);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );

      const generated = await Promise.race([generatePromise, timeoutPromise]) as WordPair[];
      
      const newAiPairs = [...generated, ...aiPairs];
      setAiPairs(newAiPairs);
      localStorage.setItem('spy_ai_words', JSON.stringify(newAiPairs));
      setShowWords(false);
    } catch (e) {
      alert("AI 生成失败或超时，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAI = () => {
    if (confirm("确定要清空 AI 生成的历史记录吗？")) {
      setAiPairs([]);
      localStorage.removeItem('spy_ai_words');
    }
  };
  
  const handleResetLoading = () => {
      setIsGenerating(false);
  }

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedCustom = localStorage.getItem('spy_custom_words');
    if (savedCustom) {
      const list: WordPair[] = JSON.parse(savedCustom);
      const updated = list.filter(p => p.id !== id);
      localStorage.setItem('spy_custom_words', JSON.stringify(updated));
      setPairs([...DEFAULT_WORD_PAIRS, ...updated]);
    }
  };

  const filteredPairs = activeTab === 'default' 
    ? DEFAULT_WORD_PAIRS 
    : activeTab === 'custom' 
      ? pairs.filter(p => p.category === '自定义') 
      : aiPairs;

  return (
    <div className="bg-surface p-4 rounded-xl shadow-lg w-full max-w-md mx-auto mb-6 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-secondary" />
          词库选择
        </h3>
        <button 
          onClick={() => setShowWords(!showWords)}
          className="text-gray-400 hover:text-white transition flex items-center gap-1 text-xs bg-white/5 px-2 py-1 rounded"
        >
          {showWords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showWords ? '隐藏词语' : '显示词语'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-dark/50 p-1 rounded-lg">
        {[
          { id: 'default', label: '默认词库' },
          { id: 'custom', label: '自定义' },
          { id: 'ai', label: 'AI 生成' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        
        {/* Input Area for Custom */}
        {activeTab === 'custom' && (
          <div className="flex gap-2 mb-2 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400">平民词</label>
              <input 
                value={customCiv}
                onChange={e => setCustomCiv(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:border-primary outline-none"
                placeholder="例如：苹果"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400">卧底词</label>
              <input 
                value={customSpy}
                onChange={e => setCustomSpy(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:border-secondary outline-none"
                placeholder="例如：梨子"
              />
            </div>
            <button 
              onClick={handleAddCustom}
              className="bg-secondary p-2.5 rounded hover:bg-pink-600 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Input Area for AI */}
        {activeTab === 'ai' && (
          <div className="mb-2 space-y-2">
            <div className="flex gap-2">
              <input 
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                className="flex-1 bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                placeholder="输入主题 (例如: 美食, 科技)"
                disabled={isGenerating}
              />
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="bg-purple-600 px-4 rounded hover:bg-purple-700 transition text-white flex items-center gap-2 disabled:opacity-50 min-w-[90px] justify-center"
              >
                {isGenerating ? '生成中...' : <><Sparkles className="w-4 h-4" /> 生成</>}
              </button>
              {isGenerating && (
                  <button 
                    onClick={handleResetLoading} 
                    className="text-xs text-gray-400 underline px-1"
                    title="强制重置状态"
                  >
                      重置
                  </button>
              )}
            </div>
            
            {aiPairs.length > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-gray-500">已生成 {aiPairs.length} 组</span>
                <button 
                    onClick={handleClearAI} 
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                    <Eraser className="w-3 h-3" /> 清空历史
                </button>
              </div>
            )}

            {aiPairs.length === 0 && !isGenerating && (
              <p className="text-xs text-gray-500 text-center py-4">输入主题让 AI 帮你出题，结果将自动保存。</p>
            )}
          </div>
        )}

        {/* List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredPairs.length === 0 && activeTab === 'custom' && (
            <p className="text-center text-gray-500 py-4 text-sm">还没有自定义词库</p>
          )}
          
          {filteredPairs.map(pair => {
            const isPlayed = playedIds.includes(pair.id);
            return (
                <div 
                key={pair.id}
                onClick={() => onSelect(pair)}
                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all relative overflow-hidden ${
                    selectedPairId === pair.id 
                    ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'bg-dark/40 border-white/5 hover:border-white/20'
                }`}
                >
                <div className="flex items-center gap-3">
                    {/* Played Status Indicator */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPlayed ? 'border-green-500 bg-green-500/20' : 'border-gray-600'}`}>
                        {isPlayed && <Check className="w-3 h-3 text-green-500" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            {showWords ? (
                            <>
                                <span className={`font-medium ${isPlayed ? 'text-gray-400 line-through' : 'text-white'}`}>{pair.civilian}</span>
                                <span className="text-xs text-gray-500">vs</span>
                                <span className={`font-medium ${isPlayed ? 'text-gray-400 line-through' : 'text-secondary'}`}>{pair.spy}</span>
                            </>
                            ) : (
                            <span className="text-gray-400 font-mono tracking-widest text-sm">
                                {isPlayed ? '****** (已玩)' : '****** vs ******'}
                            </span>
                            )}
                        </div>
                        {pair.category && (
                            <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {pair.category}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {activeTab === 'custom' && (
                        <button 
                        onClick={(e) => handleDeleteCustom(pair.id, e)}
                        className="text-gray-500 hover:text-red-500 p-1"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    
                    {selectedPairId === pair.id && (
                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                    )}
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordManager;