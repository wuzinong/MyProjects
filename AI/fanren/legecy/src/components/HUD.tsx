import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerStats, RealmInfo, GameItem } from '../types/game';
import { Store, Sparkles, Shield, Flame, BookOpen, Sword, Compass, Award, Package, Heart, Zap, RefreshCw, Feather, CheckSquare, Droplets, Leaf, Volume2, VolumeX, Tent, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import hanLiAvatar from '../assets/images/han_li_avatar_1785138199866.jpg';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';

interface HUDProps {
  player: PlayerStats;
  realmInfo: RealmInfo;
  inventory?: GameItem[];
  pets?: any[];
  onOpenModal: (modalName: 'cultivation' | 'inventory' | 'swords' | 'pets' | 'sect' | 'story' | 'secretRealm' | 'guide' | 'universe' | 'aiGallery' | 'shop' | 'home') => void;
  onUseItem?: (itemIdOrName: string) => void;
  onUsePetSkill?: (petId?: string) => void;
}

export const HUD: React.FC<HUDProps> = ({ player, realmInfo, inventory = [], pets = [], onOpenModal, onUseItem, onUsePetSkill }) => {
  const hpPercent = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
  const mpPercent = Math.min(100, Math.max(0, (player.mp / player.maxMp) * 100));
  const expPercent = Math.min(100, Math.max(0, (player.exp / player.maxExp) * 100));

  // Sound Mute State (Default muted: true)
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());

  // Idle Farming Yield Tracker State
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [initialStones, setInitialStones] = useState<number>(player.spiritStones);
  const [initialKills, setInitialKills] = useState<number>(player.killCount || 0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  // Collapsible UI Sections States
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(false);
  const [isExpCollapsed, setIsExpCollapsed] = useState<boolean>(false);
  const [isHotbarCollapsed, setIsHotbarCollapsed] = useState<boolean>(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResetSession = () => {
    setSessionStartTime(Date.now());
    setInitialStones(player.spiritStones);
    setInitialKills(player.killCount || 0);
    setElapsedSeconds(0);
    setUseToast('📊 挂机监控数据已重置归零');
    setTimeout(() => setUseToast(null), 2000);
  };

  const minutes = Math.max(elapsedSeconds / 60, 0.001);
  const stonesGained = Math.max(0, player.spiritStones - initialStones);
  const killsGained = Math.max(0, (player.killCount || 0) - initialKills);
  const stonesPerMin = Math.round(stonesGained / minutes);
  const killsPerMin = (killsGained / minutes).toFixed(1);

  const formatIdleTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Green Vial Particle Convergence State
  const [isGatheringParticles, setIsGatheringParticles] = useState<boolean>(false);
  const [vialToast, setVialToast] = useState<string | null>(null);
  const [useToast, setUseToast] = useState<string | null>(null);
  const prevLiquidsRef = useRef<number>(player.greenVialLiquids);

  // Stack inventory items by name for Hotbar Quick Slots (up to 8 slots, supporting法器, 武器, 符宝, 符箓, 丹药, 灵草)
  const hotbarItems = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    const map = new Map<string, GameItem>();
    inventory.forEach((item) => {
      if (map.has(item.name)) {
        const existing = map.get(item.name)!;
        map.set(item.name, {
          ...existing,
          quantity: (existing.quantity || 1) + (item.quantity || 1),
        });
      } else {
        map.set(item.name, { ...item, quantity: item.quantity || 1 });
      }
    });
    
    const sorted = Array.from(map.values()).sort((a, b) => {
      const getPriority = (c: string, name: string) => {
        if (name.includes('黑风') || name.includes('火龙') || name.includes('五色') || name.includes('玄青翠') || name.includes('天戈') || name.includes('六丁') || name.includes('避劫') || name.includes('落尘') || name.includes('疾风')) return 10;
        if (c === 'fubao' || c === 'fa_bao') return 5;
        if (c === 'weapon' || c === 'magic_instrument') return 4;
        if (c === 'talisman') return 3;
        if (c === 'pill') return 2;
        return 1;
      };
      return getPriority(b.category, b.name) - getPriority(a.category, a.name);
    });
    return sorted.slice(0, 8);
  }, [inventory]);

  // Global Keyboard listener for Hotbar slots (Keys 1-8) and Pet Skill (Key P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        if (onUsePetSkill) {
          onUsePetSkill();
          sound.playBreakthrough();
          setUseToast('🦍 施展出战灵宠终极神通（变身狂暴）！');
          setTimeout(() => setUseToast(null), 2500);
        }
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 8) {
        const item = hotbarItems[keyNum - 1];
        if (item && onUseItem) {
          onUseItem(item.id);
          sound.playPickup();
          setUseToast(`✨ 快捷键 [${keyNum}] 催发 【${item.name}】！`);
          setTimeout(() => setUseToast(null), 2500);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotbarItems, onUseItem, onUsePetSkill]);

  // Trigger Green Vial convergence animation when greenVialLiquids increases
  useEffect(() => {
    if (player.greenVialLiquids > prevLiquidsRef.current) {
      triggerVialGatherAnimation();
    }
    prevLiquidsRef.current = player.greenVialLiquids;
  }, [player.greenVialLiquids]);

  const triggerVialGatherAnimation = () => {
    setIsGatheringParticles(true);
    setVialToast('🌱 掌天瓶汇聚天地日月精华，生成参天造化绿液+1！(可于储物袋催熟灵药)');
    sound.playPickup();

    setTimeout(() => {
      setIsGatheringParticles(false);
    }, 1800);

    setTimeout(() => {
      setVialToast(null);
    }, 4500);
  };

  // Generate particle positions for convergence
  const particles = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const distance = 180 + Math.random() * 120;
    return {
      id: i,
      startX: Math.cos(angle) * distance,
      startY: Math.sin(angle) * distance,
      delay: Math.random() * 0.3,
      size: 6 + Math.random() * 6,
    };
  });

  return (
    <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none flex flex-col justify-end gap-2.5 z-10">
      {/* Green Vial Particle Convergence Layer */}
      {isGatheringParticles && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute top-12 right-24 rounded-full bg-gradient-to-r from-emerald-400 to-green-300 shadow-lg shadow-emerald-400/80 animate-ping"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                transform: `translate(${p.startX}px, ${p.startY}px)`,
                transition: `all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${p.delay}s`,
                left: 'calc(100vw - 120px)',
                top: '24px',
              }}
            />
          ))}
        </div>
      )}

      {/* Vial Notification Toast Banner */}
      {vialToast && (
        <div className="fixed top-16 right-6 z-40 bg-slate-950/90 border border-emerald-400/80 text-emerald-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Leaf className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span>{vialToast}</span>
        </div>
      )}

      {/* Hotbar Quick Use Notification Toast */}
      {useToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-[#1e201c]/95 border border-[#e9c176] text-[#e9c176] text-xs font-bold px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-pulse">
          <Zap className="w-4 h-4 text-[#facc15]" />
          <span>{useToast}</span>
        </div>
      )}

      {/* Top Left Character Stats Summary Banner */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-auto flex items-center gap-2 sm:gap-3 bg-[#1e201c]/95 border border-[#a1d1b4]/40 p-2 sm:p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-[48vw] sm:max-w-none">
        <div className="relative">
          <div className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-[#2d5a43] border border-[#e9c176] overflow-hidden flex items-center justify-center shadow-inner flex-shrink-0 ${player.equippedWeapon ? 'ring-2 ring-amber-400 shadow-amber-400/50' : ''}`}>
            <img
              src={hanLiAvatar}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-[#604403] text-[#dab36a] text-[8px] sm:text-[10px] px-1 rounded border border-[#e9c176] z-10">
              {player.root.slice(0, 2)}
            </span>
          </div>
          {player.equippedWeapon && (
            <div 
              className={`absolute -bottom-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border bg-slate-900 overflow-hidden z-20 transition-all duration-1000 ${
                player.equippedWeapon.rarity?.includes('仙器') || player.equippedWeapon.rarity?.includes('至宝') ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)]' :
                player.equippedWeapon.rarity?.includes('灵宝') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]' :
                player.equippedWeapon.rarity?.includes('古宝') || player.equippedWeapon.rarity?.includes('法宝') ? 'border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]' :
                player.equippedWeapon.rarity?.includes('极品') ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' :
                'border-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
              }`} 
              title={`已装备: ${player.equippedWeapon.name}`}
            >
               <img src={getResourceImage(player.equippedWeapon.id, player.equippedWeapon.icon, player.equippedWeapon.name, 'weapon')} className="w-full h-full object-cover animate-pulse" alt={player.equippedWeapon.name} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#e3e3dc] truncate">{player.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-amber-500/50 bg-amber-900/60 text-amber-300 font-bold whitespace-nowrap drop-shadow-md">
                {(() => {
                  const kills = player.killCount || 0;
                  if (kills >= 1000) return '万妖克星';
                  if (kills >= 500) return '平魔尊者';
                  if (kills >= 200) return '猎妖宗师';
                  if (kills >= 100) return '降妖真人';
                  if (kills >= 50) return '诛邪名宿';
                  if (kills >= 10) return '除魔卫道';
                  return '初入仙途';
                })()}
              </span>
            </div>
            <span className="text-[9px] sm:text-xs px-1.5 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4] font-medium whitespace-nowrap">
              {realmInfo.name}
            </span>
          </div>

          {/* Health Bar */}
          <div className="w-full bg-[#121410] h-1.5 sm:h-2 rounded-full overflow-hidden border border-[#414943] relative">
            <div
              className="bg-gradient-to-r from-red-600 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Qi / MP Bar */}
          <div className="w-full bg-[#121410] h-1.5 sm:h-2 rounded-full overflow-hidden border border-[#414943] relative">
            <div
              className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Idle Yield Statistics Panel (挂机收益监控) */}
      <div className="absolute top-[72px] sm:top-[88px] left-2 sm:left-4 z-30 pointer-events-auto">
        <div className="bg-[#181a17]/95 border border-[#e9c176]/60 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md text-[#e3e3dc] flex flex-col gap-1.5 min-w-[165px] sm:min-w-[190px] max-w-[210px] transition-all">
          <div className="flex items-center justify-between gap-1 border-b border-[#3b4138] pb-1">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-amber-300">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
              <span>挂机收益监控</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetSession}
                title="重置挂机收益统计"
                className="p-1 rounded-md bg-[#252822] hover:bg-[#343830] text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
              <button
                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                className="px-1.5 py-0.5 rounded-md bg-[#252822] hover:bg-[#343830] text-[#8b938c] hover:text-white text-[9px] sm:text-[10px] font-bold cursor-pointer"
              >
                {isStatsCollapsed ? '展开' : '收起'}
              </button>
            </div>
          </div>

          {!isStatsCollapsed && (
            <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
              <div className="flex items-center justify-between text-[#8b938c]">
                <span>⏱️ 挂机时长</span>
                <span className="font-mono font-bold text-amber-200">{formatIdleTime(elapsedSeconds)}</span>
              </div>

              <div className="flex items-center justify-between text-[#8b938c]">
                <span>💎 灵石效率</span>
                <span className="font-bold text-emerald-400 font-mono">{stonesPerMin} <span className="text-[9px] text-emerald-500">/分</span></span>
              </div>

              <div className="flex items-center justify-between text-[#8b938c]">
                <span>⚔️ 击杀妖兽</span>
                <span className="font-bold text-cyan-300 font-mono">{killsGained} <span className="text-[9px] text-cyan-500">只 ({killsPerMin}/分)</span></span>
              </div>

              <div className="flex items-center justify-between text-[#8b938c] pt-1 border-t border-[#2e332c]">
                <span>🍃 收益净增</span>
                <span className="font-bold text-amber-300 font-mono">+{stonesGained} 灵石</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Resource Counter */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-auto flex flex-wrap justify-end items-center gap-1 sm:gap-2 max-w-[50vw] sm:max-w-none">
        {/* Audio Sound Mute/Unmute Toggle (Default Muted) */}
        <button
          onClick={() => {
            const nextMute = sound.toggleMute();
            setIsMuted(nextMute);
            setUseToast(nextMute ? '🔇 已切换为静音模式' : '🔊 仙界破空音效已开启');
            setTimeout(() => setUseToast(null), 2000);
          }}
          title={isMuted ? '当前为静音模式，点击开启音效' : '音效已开启，点击切换为静音'}
          className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-md cursor-pointer border ${
            isMuted
              ? 'bg-[#292b26]/90 border-[#555] text-gray-400 hover:text-amber-200 hover:border-amber-400/60'
              : 'bg-emerald-900/90 border-emerald-400 text-emerald-100 animate-pulse'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-300" />}
          <span>{isMuted ? '静音' : '音效开'}</span>
        </button>

        <button
          onClick={() => onOpenModal('aiGallery')}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-700 hover:from-amber-500 hover:to-indigo-600 border border-amber-400/80 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-amber-100 shadow-xl animate-pulse"
        >
          <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
          <span className="hidden xs:inline">☑ AI资源</span>
        </button>

        <button
          onClick={() => onOpenModal('universe')}
          className="flex items-center gap-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 border border-emerald-400/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-amber-300 shadow-lg"
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
          <span className="hidden xs:inline">凡人典集</span>
        </button>

        <div className="flex items-center gap-1 bg-[#1e201c]/90 border border-[#414943] px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold text-[#e9c176]">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#e9c176]" />
          <span>灵石:{player.spiritStones}</span>
        </div>

        <div className="flex items-center gap-1 bg-[#1e201c]/90 border border-[#414943] px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold text-[#a4c9ff]">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#a4c9ff]" />
          <span>妖丹:{player.demonCores}</span>
        </div>

        {/* Green Vial Interactive Button with Convergence & Pulse Animation */}
        <button
          onClick={triggerVialGatherAnimation}
          title="点击吸收日月精华，凝聚造化绿液"
          className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
            isGatheringParticles
              ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 animate-vial-pulse shadow-lg'
              : 'bg-[#1e201c]/90 border border-[#2d5a43] hover:border-emerald-400 text-[#a1d1b4]'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-bounce" />
          <span>绿液:{player.greenVialLiquids}滴</span>
        </button>
      </div>

      {/* Center Cultivation Progress Bar (Collapsible) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto flex flex-col gap-1.5 transition-all">
        {/* Tribulation Warning Bar */}
        {(player.level + 1) % 10 === 0 && expPercent >= 80 && (
          <div className="w-full bg-red-950/90 border-2 border-red-500/80 p-2 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] backdrop-blur-md flex flex-col gap-1 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Zap className="w-4 h-4 animate-bounce" />
                [雷劫将至] 即将引动天劫！
              </span>
              <span className="text-red-300 font-bold font-mono text-sm">
                距雷劫降临还需: {Math.max(0, player.maxExp - player.exp)} EXP
              </span>
            </div>
          </div>
        )}

        {isExpCollapsed ? (
          <div className="w-full bg-[#1e201c]/95 border border-[#a1d1b4]/40 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-[#a1d1b4]">
              <Award className="w-3.5 h-3.5 text-[#e9c176]" />
              <span>修为感悟 [{realmInfo.name} Lv.{player.level}]</span>
              <div className="w-20 sm:w-28 bg-[#121410] h-1.5 rounded-full overflow-hidden border border-[#414943] inline-block">
                <div
                  className="bg-gradient-to-r from-teal-500 to-amber-300 h-full"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-[#8b938c] font-mono">{Math.round(expPercent)}%</span>
            </div>
            <button
              onClick={() => setIsExpCollapsed(false)}
              className="flex items-center gap-1 text-[10px] font-bold text-[#e9c176] hover:text-white px-2 py-0.5 rounded bg-[#2a2d27] border border-[#e9c176]/30 cursor-pointer"
            >
              <span>展开经验栏</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#1e201c]/90 border border-[#a1d1b4]/30 p-2 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a1d1b4] font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#e9c176]" />
                修为感悟 [{realmInfo.name} Lv.{player.level}]
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#8b938c] text-[11px] font-mono">
                  {player.exp} / {player.maxExp} ({Math.round(expPercent)}%)
                </span>
                <button
                  onClick={() => setIsExpCollapsed(true)}
                  className="flex items-center gap-0.5 text-[10px] font-bold text-[#8b938c] hover:text-[#e9c176] px-1.5 py-0.5 rounded bg-[#252822] hover:bg-[#343830] transition-colors cursor-pointer"
                  title="收起经验栏"
                >
                  <span>收起</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="w-full bg-[#121410] h-2.5 rounded-full overflow-hidden border border-[#414943] relative">
              <div
                className="bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-300 h-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hotbar Quick Use Items Bar (Collapsible) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto transition-all">
        {isHotbarCollapsed ? (
          <div className="w-full bg-[#131512]/95 border border-[#e9c176]/40 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-[#e9c176]">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>快捷栏 [1-8 / P]</span>
              <span className="text-[10px] text-[#8b938c] font-normal">({hotbarItems.length}件法宝已就绪)</span>
            </div>
            <button
              onClick={() => setIsHotbarCollapsed(false)}
              className="flex items-center gap-1 text-[10px] font-bold text-[#e9c176] hover:text-white px-2 py-0.5 rounded bg-[#604403]/60 border border-[#e9c176]/40 cursor-pointer"
            >
              <span>展开快捷栏</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#131512]/95 border border-[#e9c176]/50 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-center gap-1.5 relative group">
            <button
              onClick={() => setIsHotbarCollapsed(true)}
              className="text-[10px] font-bold text-[#e9c176] px-1.5 py-1 rounded bg-[#604403]/40 border border-[#e9c176]/30 flex flex-col items-center hover:bg-[#604403]/80 transition-colors cursor-pointer"
              title="点击收起快捷键栏"
            >
              <span>快捷</span>
              <span className="flex items-center">栏<ChevronDown className="w-2.5 h-2.5" /></span>
            </button>

            <div className="grid grid-cols-8 gap-1.5 flex-1">
              {Array.from({ length: 8 }).map((_, slotIdx) => {
                const item = hotbarItems[slotIdx];
                const slotKey = slotIdx + 1;

                if (!item) {
                  return (
                    <div
                      key={`empty_${slotIdx}`}
                      className="h-12 rounded-xl border border-dashed border-[#414943]/60 bg-[#1a1c18]/40 flex flex-col items-center justify-between p-1 opacity-50 relative"
                    >
                      <span className="text-[9px] font-bold text-[#8b938c] self-start px-1">{slotKey}</span>
                      <span className="text-[9px] text-[#8b938c] my-auto">空</span>
                    </div>
                  );
                }

                const itemImg = getResourceImage(item.id, item.icon, item.name, item.category);

                return (
                  <button
                    key={item.id + '_' + slotIdx}
                    onClick={() => {
                      if (onUseItem) {
                        onUseItem(item.id);
                        sound.playPickup();
                        setUseToast(`✨ 催发 【${item.name}】！`);
                        setTimeout(() => setUseToast(null), 2500);
                      }
                    }}
                    title={`点击或按数字键 [${slotKey}] 使用【${item.name}】`}
                    className="h-12 rounded-xl border border-[#a1d1b4]/60 bg-[#1a1c18] hover:border-[#e9c176] hover:bg-[#2d5a43]/40 transition-all flex flex-col items-center justify-between p-1 relative shadow-md group cursor-pointer"
                  >
                    {/* Hotkey Number Badge Top-Left */}
                    <span className="absolute top-0.5 left-0.5 bg-[#2d5a43] text-[#a1d1b4] text-[9px] font-black px-1 rounded border border-[#a1d1b4]/40 z-10">
                      {slotKey}
                    </span>

                    {/* Stack Quantity Badge Top-Right */}
                    <span className="absolute top-0.5 right-0.5 bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 text-[9px] font-bold px-1 rounded shadow z-10">
                      x{item.quantity || 1}
                    </span>

                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#414943] bg-[#121410] my-auto flex items-center justify-center">
                      <img
                        src={itemImg}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <span className="text-[9px] font-bold text-[#e3e3dc] line-clamp-1 group-hover:text-[#e9c176] leading-none">
                      {item.name.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pet Skill Quick Trigger Button */}
            <button
              onClick={() => {
                if (onUsePetSkill) {
                  onUsePetSkill();
                  sound.playBreakthrough();
                  setUseToast('🦍 施展出战灵宠终极神通（变身狂暴）！');
                  setTimeout(() => setUseToast(null), 2500);
                }
              }}
              title="点击或按键盘 [P] 键触发出战灵宠终极神通（变身狂暴）"
              className="h-12 px-2 rounded-xl bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 border border-amber-500/60 text-amber-200 flex flex-col items-center justify-center relative shadow-lg group cursor-pointer"
            >
              <span className="absolute top-0.5 left-0.5 bg-red-950 text-amber-300 text-[9px] font-black px-1 rounded border border-amber-400/50">
                P
              </span>
              <Zap className="w-5 h-5 text-yellow-300 animate-pulse mt-1" />
              <span className="text-[9px] font-bold text-amber-200 whitespace-nowrap">
                灵宠绝技
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Main Xianxia Navigation Bar (Collapsible) */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto transition-all">
        {isMenuCollapsed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setIsMenuCollapsed(false)}
              className="bg-[#1e201c]/95 border border-[#e9c176]/80 text-[#e9c176] hover:bg-[#2e312b] hover:text-white px-5 py-1.5 rounded-t-xl text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all animate-bounce"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>修仙主菜单 [点击展开]</span>
              <ChevronUp className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        ) : (
          <div className="relative bg-[#1e201c]/95 border border-[#414943] p-2 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-1">
            {/* Header collapse handle bar */}
            <div className="flex items-center justify-between px-2 pb-1 border-b border-[#3b4138]">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#e9c176]">
                <Menu className="w-3.5 h-3.5 text-amber-400" />
                <span>修仙核心菜单栏</span>
              </div>
              <button
                onClick={() => setIsMenuCollapsed(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-[#8b938c] hover:text-[#e9c176] px-2 py-0.5 rounded bg-[#252822] hover:bg-[#343830] transition-colors cursor-pointer"
                title="收起底部菜单"
              >
                <span>收起菜单</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="flex overflow-x-auto custom-scrollbar md:grid md:grid-cols-9 gap-1.5 pt-1">
              <button
                onClick={() => onOpenModal('cultivation')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#2d5a43]/60 hover:bg-[#2d5a43] text-[#a1d1b4] border border-[#a1d1b4]/30 transition-all group cursor-pointer"
              >
                <Sparkles className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">打坐突破</span>
              </button>

              <button
                onClick={() => onOpenModal('home')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Tent className="w-5 h-5 mb-1 text-[#34d399] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold sm:whitespace-nowrap">家园洞府</span>
              </button>

              <button
                onClick={() => onOpenModal('inventory')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Package className="w-5 h-5 mb-1 text-[#e9c176] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">储物袋</span>
              </button>

              <button
                onClick={() => onOpenModal('swords')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Sword className="w-5 h-5 mb-1 text-[#a1d1b4] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">本命飞剑</span>
              </button>

              <button
                onClick={() => onOpenModal('pets')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Feather className="w-5 h-5 mb-1 text-[#a4c9ff] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">灵宠真灵</span>
              </button>

              <button
                onClick={() => onOpenModal('sect')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Shield className="w-5 h-5 mb-1 text-[#e9c176] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">宗门势力</span>
              </button>

              <button
                onClick={() => onOpenModal('secretRealm')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Compass className="w-5 h-5 mb-1 text-[#a1d1b4] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">秘境传送</span>
              </button>

              <button
                onClick={() => onOpenModal('story')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <BookOpen className="w-5 h-5 mb-1 text-[#a4c9ff] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">修仙传奇</span>
              </button>

              <button
                onClick={() => onOpenModal('shop')}
                className="flex-shrink-0 w-16 md:w-auto flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a1c18] hover:bg-[#292b26] text-[#e3e3dc] border border-[#414943] transition-all group cursor-pointer"
              >
                <Store className="w-5 h-5 mb-1 text-[#e9c176] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">坊市集会</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

