import React from 'react';
import { Pet, PlayerStats } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Feather, Sparkles, Shield, Zap, X, Check } from 'lucide-react';

interface PetsModalProps {
  pets: Pet[];
  player: PlayerStats;
  onClose: () => void;
  onTogglePet: (petId: string) => void;
  onFeedPet: (petId: string) => void;
  onTriggerPetSkill?: (petId: string) => void;
}

export const PetsModal: React.FC<PetsModalProps> = ({
  pets,
  player,
  onClose,
  onTogglePet,
  onFeedPet,
  onTriggerPetSkill,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Feather className="w-6 h-6 text-[#a4c9ff]" />
            <div>
              <h2 className="text-xl font-bold text-[#e9c176]">灵宠 · 灵虫与真灵伙伴</h2>
              <p className="text-xs text-[#8b938c]">升级可解锁不同终极神通（如啼魂兽变身刑天巨猿）。消耗妖丹培育。</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-950/80 border border-amber-500/50 rounded-lg text-xs font-bold text-amber-300">
              ⚡ 当前妖丹: {player.demonCores} 颗
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet) => {
              const petImage = getResourceImage(pet.id, pet.icon);
              const petLevel = pet.level || 1;

              return (
                <div
                  key={pet.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                    pet.isActive
                      ? 'bg-[#2d5a43]/30 border-[#a1d1b4] shadow-xl'
                      : 'bg-[#1a1c18] border-[#414943]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#e9c176] bg-[#121410] flex-shrink-0 shadow-md relative group">
                      <img
                        src={petImage}
                        alt={pet.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-[#604403] text-amber-300 text-[9px] font-bold px-1 rounded-tl">
                        Lv.{petLevel}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#005295] text-[#a4c9ff] font-bold">
                            {pet.type} · {pet.evolutionStage || '幼年期'}
                          </span>
                          <h3 className="text-lg font-bold text-[#e3e3dc] mt-0.5 flex items-center gap-2">
                            <span>{pet.name}</span>
                            <span className="text-xs text-amber-400">Lv.{petLevel}</span>
                          </h3>
                        </div>

                        <button
                          onClick={() => {
                            onTogglePet(pet.id);
                            sound.playPickup();
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                            pet.isActive
                              ? 'bg-[#2d5a43] text-[#a1d1b4] border border-[#a1d1b4]'
                              : 'bg-[#1e201c] text-[#8b938c] border border-[#414943]'
                          }`}
                        >
                          {pet.isActive && <Check className="w-3.5 h-3.5" />}
                          {pet.isActive ? '出战中' : '召唤出战'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#8b938c] leading-relaxed">{pet.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#121410] border border-[#414943]">
                      <span className="text-[#8b938c]">等级: </span>
                      <strong className="text-amber-300">Lv.{petLevel}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#121410] border border-[#414943]">
                      <span className="text-[#8b938c]">攻击: </span>
                      <strong className="text-[#a1d1b4]">{pet.atk}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#121410] border border-[#414943]">
                      <span className="text-[#8b938c]">属性: </span>
                      <strong className="text-[#e9c176]">{pet.element}</strong>
                    </div>
                  </div>

                  {/* Skills unlocked list */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-amber-300/80 font-bold">已掌握真灵神通:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pet.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#121410] text-[#a4c9ff] border border-[#414943] font-bold">
                          ⚡ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        onFeedPet(pet.id);
                        sound.playBreakthrough();
                      }}
                      className="py-2 rounded-lg bg-[#121410] hover:bg-[#292b26] border border-[#a1d1b4]/50 text-[#a1d1b4] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      喂妖丹培育 (升级)
                    </button>

                    <button
                      onClick={() => {
                        if (onTriggerPetSkill) {
                          onTriggerPetSkill(pet.id);
                          onClose();
                        }
                      }}
                      className="py-2 rounded-lg bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 border border-red-500/60 text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      释放真灵神通 (3秒特效)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
