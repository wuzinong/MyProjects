import React, { useState } from 'react';
import { GameItem } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Sparkles, Package, Coins, Flame, Shield, Scroll, X, Crown, Award, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BossLootItem {
  id: string;
  name: string;
  type: 'stone' | 'core' | 'item';
  amount?: number;
  itemData?: GameItem;
  rarity?: string;
  icon?: string;
  category?: string;
  description?: string;
}

interface BossChestModalProps {
  bossName: string;
  lootItems: BossLootItem[];
  onClose: () => void;
  onCollectAll: (loot: BossLootItem[]) => void;
}

export const BossChestModal: React.FC<BossChestModalProps> = ({
  bossName,
  lootItems,
  onClose,
  onCollectAll,
}) => {
  const [collected, setCollected] = useState(false);

  const handleCollect = () => {
    sound.playLevelUp();
    setCollected(true);
    setTimeout(() => {
      onCollectAll(lootItems);
    }, 400);
  };

  const getRarityBadgeStyle = (rarity?: string) => {
    switch (rarity) {
      case '混沌至宝':
      case '通天灵宝':
        return 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-amber-500/50 shadow-md';
      case '古宝':
      case '仙阶':
      case '极品法器':
        return 'bg-purple-950/90 text-purple-300 border-purple-400 shadow-purple-500/40 shadow-sm';
      case '上品法器':
      case '天阶':
        return 'bg-blue-950/90 text-blue-300 border-blue-400';
      default:
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-400';
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 pointer-events-auto cursor-pointer"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#181a17]/95 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl text-[#e3e3dc] overflow-hidden cursor-default"
        >
          {/* Background Golden Radial Beam Glow Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-amber-600/30 to-transparent"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#242722] text-[#8b938c] hover:text-[#e9c176] hover:bg-[#2d312b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Opening Animation */}
          <div className="text-center relative mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-1 shadow-lg shadow-amber-500/50 mb-3"
            >
              <div className="w-full h-full bg-[#1e201c] rounded-full flex items-center justify-center border border-amber-300">
                <Crown className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> 秘境镇魔奇遇
              </div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wide">
                【{bossName}】秘境仙宝箱开启！
              </h2>
              <p className="text-xs text-[#a1a8a0] mt-1">
                金光迸射，上古道韵弥漫！宝箱中封印的高阶修仙资源全数爆发：
              </p>
            </motion.div>
          </div>

          {/* Loot Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 custom-scrollbar mb-6">
            {lootItems.map((item, index) => {
              const imgUrl = item.itemData
                ? getResourceImage(item.itemData.id, item.itemData.icon, item.itemData.name, item.itemData.category)
                : null;

              return (
                <motion.div
                  key={`${item.id}_${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#20231e]/90 border border-[#3b4138] hover:border-amber-400/60 transition-all shadow-md group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#141613] border border-[#485045] flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.type === 'stone' ? (
                      <Coins className="w-6 h-6 text-amber-400" />
                    ) : item.type === 'core' ? (
                      <Flame className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Package className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-[#f0f0ea] truncate">
                        {item.name}
                      </span>
                      {item.rarity && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${getRarityBadgeStyle(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8c948b] truncate mt-0.5">
                      {item.type === 'stone' && `极品灵石 +${item.amount}`}
                      {item.type === 'core' && `万年妖丹 / 兽核 +${item.amount}`}
                      {item.itemData && (item.itemData.description || '上古秘境降临之无上稀有法宝。')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Collect All Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t border-[#31362e]">
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>共获得 <strong className="text-amber-200">{lootItems.length}</strong> 份上古修仙珍品！</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCollect}
              disabled={collected}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-[#121410] font-black text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 hover:brightness-110 active:brightness-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span>{collected ? '收揽成功！' : '全部收揽放入储物袋'}</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
