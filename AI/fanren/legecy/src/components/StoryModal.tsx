import React from 'react';
import { Quest } from '../types/game';
import { sound } from '../engine/sound';
import { BookOpen, CheckCircle, Sparkles, X, ChevronRight } from 'lucide-react';

interface StoryModalProps {
  quests: Quest[];
  onClose: () => void;
  onClaimReward: (questId: string) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ quests, onClose, onClaimReward }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#a4c9ff]" />
            <h2 className="text-xl font-bold text-[#e9c176]">凡人修仙传 · 传奇历程</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                quest.completed
                  ? 'bg-[#121410] border-[#414943]/50 opacity-70'
                  : quest.active
                  ? 'bg-[#2d5a43]/30 border-[#a1d1b4] shadow-xl'
                  : 'bg-[#1a1c18] border-[#414943]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#005295] text-[#a4c9ff]">
                    {quest.chapter}
                  </span>
                  <h3 className="text-lg font-bold text-[#e3e3dc] mt-1">{quest.title}</h3>
                </div>

                {quest.completed ? (
                  <span className="text-xs px-3 py-1 rounded-xl bg-[#121410] text-[#a1d1b4] font-bold border border-[#414943] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-[#a1d1b4]" /> 已完结
                  </span>
                ) : quest.active ? (
                  <button
                    onClick={() => {
                      onClaimReward(quest.id);
                      sound.playBreakthrough();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2d5a43] to-[#a1d1b4] hover:brightness-110 text-[#063824] font-bold text-xs transition-all shadow-md flex items-center gap-1"
                  >
                    领悟领赏
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              <p className="text-xs text-[#8b938c] leading-relaxed">{quest.description}</p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#414943]">
                <span className="text-[#8b938c]">
                  讨伐进度: <strong className="text-[#e3e3dc]">{quest.currentCount || 0} / {quest.targetCount || 1}</strong>
                </span>
                <div className="flex items-center gap-3 text-[#e9c176] font-semibold">
                  <span>+{quest.rewardExp} 修为</span>
                  <span>+{quest.rewardStones} 灵石</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
