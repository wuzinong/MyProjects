import React, { useState } from 'react';
import { Sect, PlayerStats, GameItem } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Shield, Award, Sparkles, X, ChevronRight } from 'lucide-react';

interface SectModalProps {
  sects: Sect[];
  player: PlayerStats;
  onClose: () => void;
  onJoinSect: (sect: Sect) => void;
  onBuySectItem: (item: GameItem) => void;
}

export const SectModal: React.FC<SectModalProps> = ({
  sects,
  player,
  onClose,
  onJoinSect,
  onBuySectItem,
}) => {
  const [selectedSect, setSelectedSect] = useState<Sect>(
    sects.find((s) => s.id === player.sectId) || sects[0]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#e9c176]" />
            <h2 className="text-xl font-bold text-[#e9c176]">修仙界宗门与天下势力</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sect List Left Column */}
          <div className="space-y-3">
            {sects.map((sect) => (
              <button
                key={sect.id}
                onClick={() => setSelectedSect(sect)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  selectedSect.id === sect.id
                    ? 'bg-[#2d5a43]/40 border-[#a1d1b4] shadow-lg ring-1 ring-[#a1d1b4]'
                    : 'bg-[#1a1c18] border-[#414943] hover:border-[#8b938c]'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#414943] bg-[#121410] flex-shrink-0">
                  <img
                    src={getResourceImage(sect.id, 'sect')}
                    alt={sect.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#e3e3dc] text-sm">{sect.name}</span>
                    {player.sectId === sect.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4]">
                        当前归属
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8b938c]">{sect.region}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Sect Details & Shop Right Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-[#121410] border border-[#414943] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#e9c176]">{selectedSect.name}</h3>
                  <div className="text-xs text-[#8b938c] mt-0.5">
                    所在地: {selectedSect.region} | 掌门老祖: {selectedSect.leader}
                  </div>
                </div>

                {player.sectId !== selectedSect.id && (
                  <button
                    onClick={() => {
                      onJoinSect(selectedSect);
                      sound.playBreakthrough();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#3a674f] text-[#a1d1b4] font-bold text-xs transition-all shadow-md"
                  >
                    拜入该宗门
                  </button>
                )}
              </div>

              <p className="text-xs text-[#8b938c] leading-relaxed">{selectedSect.description}</p>

              <div className="space-y-1">
                <div className="text-xs text-[#a1d1b4] font-bold">宗门传承功法:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSect.techniques.map((t, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-[#1a1c18] text-[#e3e3dc] border border-[#414943]">
                      📜 {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sect Shop Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#e3e3dc] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#e9c176]" />
                宗门藏宝阁与灵物兑换
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedSect.shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#1a1c18] border border-[#414943] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#414943] bg-[#121410] flex-shrink-0">
                        <img
                          src={getResourceImage(item.id, item.icon)}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#e3e3dc]">{item.name}</div>
                        <div className="text-[10px] text-[#8b938c] mt-0.5 line-clamp-1">{item.description}</div>
                        <div className="text-xs font-bold text-[#e9c176] mt-0.5">{item.price} 灵石</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onBuySectItem(item);
                        sound.playPickup();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#604403] hover:bg-[#735305] text-[#dab36a] font-bold text-xs transition-all shrink-0"
                    >
                      兑换
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
