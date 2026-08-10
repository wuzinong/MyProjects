import React from 'react';
import { MapZone, PlayerStats } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Compass, Shield, Award, Sparkles, X, ChevronRight, Lock } from 'lucide-react';

interface SecretRealmModalProps {
  mapZones: MapZone[];
  currentMap: MapZone;
  player: PlayerStats;
  onClose: () => void;
  onSelectMap: (map: MapZone) => void;
}

export const SecretRealmModal: React.FC<SecretRealmModalProps> = ({
  mapZones,
  currentMap,
  player,
  onClose,
  onSelectMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#a1d1b4]" />
            <h2 className="text-xl font-bold text-[#e9c176]">大千世界 · 秘境与大界传送</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapZones.map((zone) => {
              const isSelected = currentMap.id === zone.id;
              const zoneImg = getResourceImage(zone.id, zone.icon, zone.name, 'zone');

              return (
                <div
                  key={zone.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                    isSelected
                      ? 'bg-[#2d5a43]/30 border-[#a1d1b4] shadow-xl'
                      : zone.unlocked
                      ? 'bg-[#1a1c18] border-[#414943] hover:border-[#8b938c]'
                      : 'bg-[#121410] border-[#414943]/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#ef4444] bg-[#121410] flex-shrink-0 shadow-md">
                      <img
                        src={zoneImg}
                        alt={zone.bossName || zone.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#e3e3dc] text-base">{zone.name}</span>
                            {zone.isSecretRealm && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#604403] text-[#dab36a]">
                                远古秘境
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#a1d1b4] mt-0.5">{zone.recommendedRealm}</div>
                        </div>

                        {isSelected ? (
                          <span className="text-xs px-3 py-1 rounded-xl bg-[#2d5a43] text-[#a1d1b4] font-bold border border-[#a1d1b4]">
                            当前探索中
                          </span>
                        ) : zone.unlocked ? (
                          <button
                            onClick={() => {
                              onSelectMap(zone);
                              sound.playBreakthrough();
                              onClose();
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#2d5a43] hover:bg-[#3a674f] text-[#a1d1b4] font-bold text-xs transition-all flex items-center gap-1 shadow-md"
                          >
                            传送此阵
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-[#8b938c]">
                            <Lock className="w-3.5 h-3.5" /> 未开启
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#8b938c] leading-relaxed">{zone.description}</p>

                  <div className="p-3 rounded-xl bg-[#121410] border border-[#414943] space-y-1.5 text-xs">
                    <div className="text-[#a1d1b4] font-semibold flex items-center justify-between">
                      <span>驻守领主 Boss:</span>
                      <strong className="text-[#e9c176]">{zone.bossName}</strong>
                    </div>
                    <div className="text-[#8b938c]">
                      掉落天材地宝: {zone.drops.join('、')}
                    </div>
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
