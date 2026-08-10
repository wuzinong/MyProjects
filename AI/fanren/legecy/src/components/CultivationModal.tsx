import React, { useState } from 'react';
import { PlayerStats, RealmInfo, GameItem } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Sparkles, Zap, Flame, RefreshCw, Award, ArrowUpCircle, X, Clock, ChevronRight } from 'lucide-react';
import greenVialImage from '../assets/images/green_vial_item_1785138256906.jpg';

interface CultivationModalProps {
  player: PlayerStats;
  realmInfo: RealmInfo;
  inventory: GameItem[];
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onUseItem: (itemId: string) => void;
  onAddHerb: (herb: GameItem) => void;
  onOpenTribulation?: () => void;
}

export const CultivationModal: React.FC<CultivationModalProps> = ({
  player,
  realmInfo,
  inventory,
  onClose,
  onUpdatePlayer,
  onUseItem,
  onAddHerb,
  onOpenTribulation,
}) => {
  const [activeTab, setActiveTab] = useState<'meditate' | 'greenVial' | 'tribulation'>('meditate');
  const [isRipening, setIsRipening] = useState(false);
  const [tribulationLog, setTribulationLog] = useState<string[]>([]);
  const [isStriking, setIsStriking] = useState(false);

  // 打坐吐纳吸收天地灵气
  const handleMeditate = () => {
    sound.playBreakthrough();
    const expGained = Math.round(50 * player.level * 1.5);
    let shouldTriggerTribulation = false;


    onUpdatePlayer((prev) => {
      let currentExp = prev.exp + expGained;
      let currentLevel = prev.level;
      let currentMaxExp = prev.maxExp;
      let bottleneck = prev.isBottleneck;

      if (currentExp >= currentMaxExp) {
        if (!bottleneck) {
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
            bottleneck = true;
            currentExp = currentMaxExp;
            shouldTriggerTribulation = true;
          } else {
            currentLevel += 1;
            currentExp = currentExp - currentMaxExp;
            currentMaxExp = Math.round(currentMaxExp * 1.5);
          }
        } else {
          currentExp = currentMaxExp; // cap it
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
             shouldTriggerTribulation = true;
          }
        }
      }

      return {
        ...prev,
        exp: currentExp,
        level: currentLevel,
        maxExp: currentMaxExp,
        isBottleneck: bottleneck,
      };
    });

    if (shouldTriggerTribulation && onOpenTribulation) {
      setTimeout(() => {
        onOpenTribulation();
      }, 50);
    }
  };

  // 掌天瓶催熟万年灵草
  const handleRipenHerb = (herbName: string, years: number, liquidCost: number) => {
    if (player.greenVialLiquids < liquidCost) {
      alert(`参天绿液不足！需要 ${liquidCost} 滴绿液，当前只有 ${player.greenVialLiquids} 滴。`);
      return;
    }

    setIsRipening(true);
    sound.playBreakthrough();

    setTimeout(() => {
      onUpdatePlayer((prev) => ({
        ...prev,
        greenVialLiquids: prev.greenVialLiquids - liquidCost,
      }));

      const newHerb: GameItem = {
        id: `ripened_${Date.now()}`,
        name: `${years}年·${herbName}`,
        rarity: years >= 10000 ? '玄天灵宝' : years >= 1000 ? '通天灵宝' : '古宝',
        category: 'herb',
        description: `由掌天瓶参天绿液快速催熟的${years}年罕见仙草灵竹！`,
        ripenYears: years,
        quantity: 1,
      };

      onAddHerb(newHerb);
      setIsRipening(false);
    }, 1200);
  };

  // 渡劫突破 / 破阶雷劫
  const handleFaceTribulation = () => {
    if (onOpenTribulation) {
      onClose();
      onOpenTribulation();
      return;
    }
    sound.playTribulationThunder();
    setIsStriking(true);

    const logs: string[] = [];
    logs.push('⚡ 第一道九天罡风雷劫重重轰下！');

    setTimeout(() => {
      logs.push('⚡ 第二道紫霄辟邪神雷穿透虚空！');
      setTribulationLog([...logs]);
    }, 600);

    setTimeout(() => {
      // Success check based on HP and Divine Sense
      const success = Math.random() < 0.85 || player.divineSense > 5;
      if (success) {
        logs.push('🎉 顺利渡过重重天劫，脱胎换骨，突破至更高境界！');
        sound.playBreakthrough();
        onUpdatePlayer((prev) => ({
          ...prev,
          level: prev.level + 1,
          exp: 0,
          maxExp: Math.round(prev.maxExp * 2.2),
          maxHp: Math.round(prev.maxHp * 1.5),
          maxMp: Math.round(prev.maxMp * 1.5),
          atk: Math.round(prev.atk * 1.4),
          def: Math.round(prev.def * 1.4),
          divineSense: prev.divineSense + 1,
          isBottleneck: false,
        }));
      } else {
        logs.push('💥 天劫煞气过重，肉身轻微受损，未能突破，请服用防雷仙丹重试！');
      }
      setTribulationLog([...logs]);
      setIsStriking(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#a1d1b4]" />
            <h2 className="text-xl font-bold text-[#e9c176]">洞府修仙 · 境界与掌天瓶</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#414943] bg-[#1a1c18]">
          <button
            onClick={() => setActiveTab('meditate')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'meditate'
                ? 'border-[#a1d1b4] text-[#a1d1b4] bg-[#2d5a43]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            打坐吐纳 & 境界
          </button>

          <button
            onClick={() => setActiveTab('greenVial')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'greenVial'
                ? 'border-[#a1d1b4] text-[#a1d1b4] bg-[#2d5a43]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-[#a1d1b4]" />
            掌天瓶 · 灵草催熟
          </button>

          <button
            onClick={() => setActiveTab('tribulation')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tribulation'
                ? 'border-[#e9c176] text-[#e9c176] bg-[#604403]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#e9c176]" />
            破阶突破 & 天雷劫
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'meditate' && (
            <div className="space-y-6">
              {/* Realm Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#2d5a43]/40 to-[#121410] border border-[#a1d1b4]/40 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-[#a1d1b4] font-semibold">当前修仙境界</div>
                  <div className="text-2xl font-bold text-[#e9c176] flex items-center gap-2">
                    {realmInfo.name} ({realmInfo.english})
                  </div>
                  <div className="text-xs text-[#8b938c]">
                    寿元: {realmInfo.lifespan} | 神识: {'★'.repeat(realmInfo.divineSenseStars)}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-[#8b938c]">推荐修仙等级</div>
                  <div className="text-base font-bold text-[#a1d1b4]">{realmInfo.levelRange}</div>
                  <div className="text-xs text-[#e3e3dc]">飞行能力: {realmInfo.flight ? '御剑飞行' : '徒步'}</div>
                </div>
              </div>

              {/* Meditate Action */}
              <div className="p-6 rounded-xl bg-[#1a1c18] border border-[#414943] text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#2d5a43]/50 border-2 border-[#a1d1b4] flex items-center justify-center shadow-inner">
                  <Sparkles className="w-10 h-10 text-[#a1d1b4] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#e3e3dc]">凝神屏息 · 汲取日月精华</h3>
                  <p className="text-xs text-[#8b938c] mt-1">
                    在洞府内运转《长春功》与《青元剑诀》，炼化天灵地秀积累灵气突破瓶颈。
                  </p>
                </div>

                <button
                  onClick={handleMeditate}
                  className="w-full max-w-sm mx-auto py-3 px-6 rounded-xl bg-gradient-to-r from-[#2d5a43] to-[#a1d1b4] hover:brightness-110 text-[#063824] font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  打坐吐纳增加修为 (+{Math.round(50 * player.level * 1.5)} 灵气)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'greenVial' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#2d5a43]/30 border border-[#a1d1b4]/40 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#a1d1b4] bg-[#121410] flex-shrink-0 shadow-lg">
                  <img
                    src={greenVialImage}
                    alt="掌天瓶"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#a1d1b4]">玄天至宝 · 掌天瓶</h3>
                  <p className="text-xs text-[#8b938c]">
                    韩立安身立命之本！可自动吸收月华凝结【参天绿液】，万倍缩短灵草成长周期。 当前绿液储备:
                    <strong className="text-[#e9c176] ml-1">{player.greenVialLiquids} 滴</strong>
                  </p>
                </div>
              </div>

              {/* Ripening Herb Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#e9c176] bg-[#121410] flex-shrink-0">
                      <img
                        src={getResourceImage('mat_01')}
                        alt="万年金雷竹"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#e3e3dc]">万年金雷竹</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#604403] text-[#dab36a]">天材地宝</span>
                      </div>
                      <p className="text-[11px] text-[#8b938c] line-clamp-2 mt-0.5">
                        三大神木之一！蕴含极其强横的辟邪神雷，是炼制本命飞剑【青竹蜂云剑】的唯一材料。
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRipenHerb('金雷竹', 10000, 2)}
                    disabled={isRipening || player.greenVialLiquids < 2}
                    className="w-full py-2.5 rounded-lg bg-[#2d5a43] hover:bg-[#3a674f] disabled:opacity-50 text-[#a1d1b4] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    滴灌 2 滴绿液 催熟万年金雷竹
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#a1d1b4] bg-[#121410] flex-shrink-0">
                      <img
                        src={getResourceImage('mat_02')}
                        alt="三千年龙鳞果"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#e3e3dc]">三千年龙鳞果</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4]">灵药名卉</span>
                      </div>
                      <p className="text-[11px] text-[#8b938c] line-clamp-2 mt-0.5">
                        血色禁地绝产主药，极具灵性，用于强固肉身并炼制筑基丹与结婴丹。
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRipenHerb('龙鳞果', 3000, 1)}
                    disabled={isRipening || player.greenVialLiquids < 1}
                    className="w-full py-2.5 rounded-lg bg-[#2d5a43] hover:bg-[#3a674f] disabled:opacity-50 text-[#a1d1b4] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    滴灌 1 滴绿液 催熟三千年龙鳞果
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tribulation' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#121410] border border-[#e9c176]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#e9c176] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#e9c176]" />
                    瓶颈与渡劫天雷
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#604403] text-[#dab36a]">
                    突破成功率: {player.divineSense > 4 ? '95%' : '80%'}
                  </span>
                </div>

                <p className="text-xs text-[#8b938c]">
                  突破修仙大境界瓶颈时将引动九天雷劫洗礼。若备有辟邪符或筑基丹，可大幅降低劫数风险。
                </p>

                <button
                  onClick={handleFaceTribulation}
                  disabled={isStriking}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#604403] to-[#e9c176] hover:brightness-110 text-[#412d00] font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  引动九天雷劫 · 强行渡劫破阶！
                </button>
              </div>

              {/* Tribulation Logs */}
              {tribulationLog.length > 0 && (
                <div className="p-4 rounded-xl bg-[#121410] border border-[#414943] font-mono text-xs space-y-2">
                  <div className="text-[#8b938c] font-bold border-b border-[#414943] pb-1">渡劫过程纪实:</div>
                  {tribulationLog.map((log, index) => (
                    <div key={index} className="text-[#e3e3dc]">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
