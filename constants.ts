import { WordPair } from './types';

export const AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', 
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🦄', '🐙', '🦋', '🦉', '🐺', '🐗', '🐴', '🐝'
];

export const DEFAULT_WORD_PAIRS: WordPair[] = [
  { id: '1', civilian: '眼镜', spy: '墨镜', category: '物品' },
  { id: '2', civilian: '可口可乐', spy: '百事可乐', category: '饮食' },
  { id: '3', civilian: '警察', spy: '保安', category: '职业' },
  { id: '4', civilian: '包子', spy: '饺子', category: '饮食' },
  { id: '5', civilian: '麦当劳', spy: '肯德基', category: '品牌' },
  { id: '6', civilian: '微信', spy: 'QQ', category: '应用' },
  { id: '7', civilian: '蜘蛛侠', spy: '蝙蝠侠', category: '人物' },
  { id: '8', civilian: '吉他', spy: '贝斯', category: '乐器' },
  { id: '9', civilian: '牛肉干', spy: '猪肉脯', category: '饮食' },
  { id: '10', civilian: '王菲', spy: '那英', category: '明星' },
];

export const MAX_PLAYERS = 16;
export const MIN_PLAYERS = 3;