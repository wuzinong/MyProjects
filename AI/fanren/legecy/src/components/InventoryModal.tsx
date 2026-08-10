import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameItem, PlayerStats, GardenSlot } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Package, Flame, Hammer, Sparkles, X, Plus, Zap, CheckCircle2, RotateCw, Wind, Leaf } from 'lucide-react';

interface InventoryModalProps {
  inventory: GameItem[];
  player: PlayerStats;

  onClose: () => void;
  onCraftPill: (pillName: string, hpGain: number, mpGain: number) => void;
  onRefineWeapon: (weaponName: string, atkBonus: number) => void;
  onCraftTalisman?: (talismanName: string, effectDesc: string) => void;
  onCraftArtifact?: (name: string, desc: string, atk: number, rarity: string) => void;
  onUseItem: (itemId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  player,

  onClose,
  onUseItem,
  onCraftPill,
  onRefineWeapon,
  onCraftTalisman,
  onCraftArtifact,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'alchemy' | 'refining' | 'talisman'>('items');
  const [bagTab, setBagTab] = useState<'all' | 'weapon' | 'fubao' | 'talisman' | 'pill' | 'material'>('all');
  const [nowTick, setNowTick] = useState(Date.now());


  // Stack inventory items by name so identical items only take 1 slot with a quantity badge
  const stackedInventory = useMemo(() => {
    const map = new Map<string, GameItem>();
    inventory.forEach((item) => {
      const existing = map.get(item.name);
      if (existing) {
        map.set(item.name, {
          ...existing,
          quantity: (existing.quantity || 1) + (item.quantity || 1),
        });
      } else {
        map.set(item.name, { ...item, quantity: item.quantity || 1 });
      }
    });
    return Array.from(map.values());
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return stackedInventory.filter(item => {
      if (bagTab === 'all') return true;
      if (bagTab === 'weapon') return item.category === 'weapon' || item.category === 'armor' || item.category === 'accessory';
      if (bagTab === 'fubao') return item.category === 'fubao';
      if (bagTab === 'talisman') return item.category === 'talisman';
      if (bagTab === 'pill') return item.category === 'pill';
      if (bagTab === 'material') return item.category === 'material' || item.category === 'herb';
      return true;
    });
  }, [stackedInventory, bagTab]);

  const [selectedItem, setSelectedItem] = useState<GameItem | null>(stackedInventory[0] || null);

  useEffect(() => {
    if (stackedInventory.length > 0 && !selectedItem) {
      setSelectedItem(stackedInventory[0]);
    }
  }, [stackedInventory]);

  // Alchemy Real-Time Furnace State
  const [alchemyState, setAlchemyState] = useState<'idle' | 'brewing' | 'completed'>('idle');
  const [activePill, setActivePill] = useState<{
    name: string;
    hp: number;
    mp: number;
    rarity: string;
    desc: string;
    durationMs: number;
  } | null>(null);
  const [alchemyProgress, setAlchemyProgress] = useState<number>(0);
  const [showFragranceRipple, setShowFragranceRipple] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Available Artifact Recipes
  const artifactRecipes = [
    {
      name: '平天尺 (法宝)',
      atk: 500,
      rarity: '法宝',
      desc: '融合庚金与天星石炼制而成的无上法宝，蕴含不可思议的威能。装备在快捷槽可主动激发。',
      category: 'fubao' as const,
      skillDesc: '释放平天尺，对全屏敌人造成毁灭性打击',
    },
    {
      name: '八灵尺 (法宝)',
      atk: 800,
      rarity: '通天灵宝',
      desc: '以八种天地灵兽之骨血，辅以天雷竹锻造的通天灵宝。',
      category: 'fubao' as const,
      skillDesc: '召唤八灵幻象，持续攻击并恢复自身生命',
    }
  ];

  const handleCraftArtifact = (recipe: any) => {
    sound.playThunder();
    if (onCraftArtifact) {
      onCraftArtifact(recipe.name, recipe.skillDesc, recipe.atk, recipe.rarity);
    }
  };
  const pillRecipes = [
    {
      name: '黄龙丹 (10颗)',
      hp: 300,
      mp: 150,
      rarity: '玄品灵丹',
      desc: '修仙界通用养气炼气之法药，增益气血与灵力。',
      durationMs: 3000,
    },
    {
      name: '筑基丹 (1颗)',
      hp: 1000,
      mp: 500,
      rarity: '地品圣丹',
      desc: '结合三大主药与参天绿液合炼，极大幅度提升突破成功率。',
      durationMs: 5000,
    },
    {
      name: '培元固本丹',
      hp: 600,
      mp: 300,
      rarity: '玄品灵丹',
      desc: '滋养经脉，固本培元，恢复大量灵力与体内真元。',
      durationMs: 3500,
    },
    {
      name: '降尘丹 (特品)',
      hp: 1500,
      mp: 800,
      rarity: '天品仙丹',
      desc: '上古修仙界破障结丹至宝，降伏尘俗阴魔。',
      durationMs: 6000,
    },
  ];

  // Start Alchemy Process
  const startAlchemy = (recipe: typeof pillRecipes[0]) => {
    if (alchemyState === 'brewing') return;
    setActivePill(recipe);
    setAlchemyProgress(0);
    setAlchemyState('brewing');
    setShowFragranceRipple(false);
    sound.playFireball();

    const intervalMs = 50;
    const step = (100 / recipe.durationMs) * intervalMs;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setAlchemyProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timerRef.current);
          return 100;
        }
        return next;
      });
    }, intervalMs);
  };

  useEffect(() => {
    if (alchemyProgress >= 100 && alchemyState === 'brewing' && activePill) {
      setAlchemyState('completed');
      setShowFragranceRipple(true);
      sound.playBreakthrough();
      onCraftPill(activePill.name, activePill.hp, activePill.mp);

      setTimeout(() => setShowFragranceRipple(false), 5000);
    }
  }, [alchemyProgress, alchemyState, activePill, onCraftPill]);

  // Quick boost progress with Green Vial liquid
  const handleBoostAlchemy = () => {
    if (alchemyState !== 'brewing') return;
    setAlchemyProgress((prev) => Math.min(99, prev + 25));
    sound.playPickup();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 炼制与升级法宝法器
  const handleRefine = (name: string, atk: number) => {
    sound.playSwordSlash();
    onRefineWeapon(name, atk);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#e9c176]" />
            <h2 className="text-xl font-bold text-[#e9c176]">修仙储物袋 · 炼丹与炼器</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#414943] bg-[#1a1c18]">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'items'
                ? 'border-[#e9c176] text-[#e9c176] bg-[#604403]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Package className="w-4 h-4" />
            储物袋空间 ({inventory.length}格)
          </button>

          <button
            onClick={() => setActiveTab('alchemy')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'alchemy'
                ? 'border-[#a1d1b4] text-[#a1d1b4] bg-[#2d5a43]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Flame className="w-4 h-4 text-[#a1d1b4]" />
            三味真火 · 炼丹鼎炉
          </button>

          <button
            onClick={() => setActiveTab('refining')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'refining'
                ? 'border-[#a4c9ff] text-[#a4c9ff] bg-[#005295]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Hammer className="w-4 h-4 text-[#a4c9ff]" />
            炼器鼎 · 法宝锻造
          </button>

          <button
            onClick={() => setActiveTab('talisman')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'talisman'
                ? 'border-[#facc15] text-[#facc15] bg-[#713f12]/30'
                : 'border-transparent text-[#8b938c] hover:text-[#e3e3dc]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#facc15]" />
            画符 · 炼符秘台
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'items' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Items Grid */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'weapon', label: '法具装备' },
                    { id: 'fubao', label: '符宝' },
                    { id: 'talisman', label: '符箓' },
                    { id: 'pill', label: '丹药' },
                    { id: 'material', label: '材料灵草' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBagTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${bagTab === tab.id ? 'bg-[#2d5a43] text-[#a1d1b4] border border-[#a1d1b4]/50' : 'bg-[#1a1c18] text-[#8b938c] border border-[#414943] hover:text-[#e3e3dc]'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3 max-h-[370px] overflow-y-auto pr-2">
                  {filteredInventory.map((item) => {
                    const itemImg = getResourceImage(item.id, item.icon, item.name, item.category);
                    const isSelected = selectedItem?.name === item.name || selectedItem?.id === item.id;
                    const isEquipped = item.category === 'weapon' && player.equippedWeapon?.id === item.id;
                    return (
                      <button
                        key={item.id + '_' + item.name}
                        onClick={() => setSelectedItem(item)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center justify-between aspect-square relative overflow-hidden group ${
                          isSelected
                            ? 'border-[#e9c176] bg-[#604403]/40 shadow-lg ring-1 ring-[#e9c176]'
                            : isEquipped 
                            ? 'border-amber-500 bg-amber-900/30'
                            : 'border-[#414943] bg-[#1a1c18] hover:border-[#8b938c]'
                        }`}
                      >
                        {isEquipped && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-amber-950 font-black text-[9px] px-1 rounded shadow z-10">
                            已装备
                          </div>
                        )}
                        <div className="absolute top-1 right-1 bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 font-black text-[10px] px-1.5 py-0.5 rounded-md shadow border border-amber-300/80 z-10">
                          x{item.quantity || 1}
                        </div>

                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#414943] bg-[#121410] flex-shrink-0 flex items-center justify-center mt-1">
                          <img
                            src={itemImg}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="text-[11px] font-bold text-[#e3e3dc] line-clamp-1 text-center mt-1">{item.name}</div>
                        <div className="flex items-center justify-between w-full text-[9px] mt-1">
                          <span className="px-1 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4]">{item.rarity || '普通'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Item Details Panel */}
              <div className="p-5 rounded-xl bg-[#121410] border border-[#414943] flex flex-col justify-between space-y-4">
                {selectedItem ? (
                  <>
                    <div className="space-y-3">
                      <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-[#e9c176] bg-[#121410] shadow-xl">
                        <img
                          src={getResourceImage(selectedItem.id, selectedItem.icon, selectedItem.name, selectedItem.category)}
                          alt={selectedItem.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-[#e9c176]">{selectedItem.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4]">
                          {selectedItem.rarity}
                        </span>
                      </div>

                      <p className="text-xs text-[#8b938c] leading-relaxed">{selectedItem.description}</p>

                      {selectedItem.effect && (
                        <div className="p-2.5 rounded-lg bg-[#604403]/20 border border-[#e9c176]/40 text-xs text-[#e9c176] font-semibold">
                          ✨ 符文/特殊效果: {selectedItem.effect}
                        </div>
                      )}

                      {selectedItem.stats && (
                        <div className="p-3 rounded-lg bg-[#1a1c18] border border-[#414943] space-y-1 text-xs text-[#a1d1b4]">
                          {selectedItem.stats.hp && <div>恢复气血: +{selectedItem.stats.hp}</div>}
                          {selectedItem.stats.mp && <div>恢复灵力: +{selectedItem.stats.mp}</div>}
                          {selectedItem.stats.atk && <div>攻击力加成: +{selectedItem.stats.atk}</div>}
                        </div>
                      )}
                    </div>

                    {(selectedItem.category === 'pill' || selectedItem.category === 'talisman' || selectedItem.category === 'fubao' || selectedItem.category === 'weapon' || selectedItem.category === 'herb' || selectedItem.stats || selectedItem.effect) && (
                      <button
                        onClick={() => {
                          onUseItem(selectedItem.id);
                          sound.playPickup();
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#2d5a43] hover:bg-[#3a674f] text-[#a1d1b4] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 text-[#e9c176]" />
                        {selectedItem.category === 'weapon' ? (player.equippedWeapon?.id === selectedItem.id ? '已装备' : '装备武器') : selectedItem.category === 'pill' ? '服用灵丹妙药' : selectedItem.category === 'talisman' ? '祭出催发符箓' : selectedItem.category === 'fubao' ? '激活解封符宝' : '直接消耗使用'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-xs text-[#8b938c] my-auto">请点击左侧物品查看详情</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'alchemy' && (
            <div className="space-y-6">
              {/* Top Furnace Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2d5a43]/30 via-[#1a1c18] to-[#604403]/30 border border-[#a1d1b4]/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2d5a43]/40 border border-[#a1d1b4]/50 text-[#a1d1b4]">
                    <Flame className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#e9c176]">三味真火造化宝鼎</h3>
                    <p className="text-xs text-[#8b938c]">
                      采集万年药草投入宝鼎，实时催动纯阳真火炼制！炼成时将散发出【清香四溢】的仙丹药香！
                    </p>
                  </div>
                </div>

                {alchemyState === 'brewing' && (
                  <button
                    onClick={handleBoostAlchemy}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>掌天绿液催化 (+25%进度)</span>
                  </button>
                )}
              </div>

              {/* Central Real-Time Alchemy Progress Furnace Display */}
              <div className="relative p-6 rounded-2xl bg-[#121410] border border-[#414943] flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
                {/* Fragrance Ripple Animation Layer */}
                {showFragranceRipple && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-48 h-48 rounded-full border-2 border-emerald-400 animate-fragrance-ripple-1 absolute" />
                    <div className="w-48 h-48 rounded-full border-2 border-amber-300 animate-fragrance-ripple-2 absolute" />
                    <div className="w-48 h-48 rounded-full border-2 border-teal-300 animate-fragrance-ripple-3 absolute" />
                    
                    <div className="animate-fragrance-text text-amber-200 font-bold text-sm bg-emerald-950/90 border border-emerald-400/80 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md z-20">
                      <Wind className="w-5 h-5 text-emerald-300 animate-spin" />
                      <span>🌸 清香四溢 · 【{activePill?.name}】丹成特品！药香弥漫洞府！</span>
                    </div>
                  </div>
                )}

                {/* Circular Progress Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Ring Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="text-[#2a2d28]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Dynamic Progress Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="text-[#a1d1b4] transition-all duration-150 ease-linear"
                      strokeWidth="8"
                      strokeDasharray={263.8}
                      strokeDashoffset={263.8 * (1 - alchemyProgress / 100)}
                      strokeLinecap="round"
                      stroke="url(#alchemyGradient)"
                      fill="transparent"
                    />
                    <defs>
                      <linearGradient id="alchemyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Progress Text & Icon */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {alchemyState === 'idle' && (
                      <div className="space-y-1">
                        <Flame className="w-8 h-8 text-[#a1d1b4]/60 mx-auto" />
                        <span className="text-xs font-bold text-[#8b938c]">选择丹方开炉</span>
                      </div>
                    )}

                    {alchemyState === 'brewing' && (
                      <div className="space-y-1">
                        <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                          {Math.floor(alchemyProgress)}%
                        </span>
                        <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>三味真火淬炼中</span>
                        </div>
                      </div>
                    )}

                    {alchemyState === 'completed' && (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                        <span className="text-xs font-bold text-amber-300">丹成即出</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtext info */}
                <div className="text-xs text-center mt-2">
                  {alchemyState === 'brewing' && (
                    <span className="text-[#a1d1b4] font-semibold">
                      正在凝练【{activePill?.name}】... 药香正在逐渐浓郁
                    </span>
                  )}
                  {alchemyState === 'completed' && (
                    <span className="text-amber-300 font-bold">
                      极品【{activePill?.name}】炼制成功！已放入储物袋中。
                    </span>
                  )}
                  {alchemyState === 'idle' && (
                    <span className="text-[#8b938c]">点击下方丹方开始消耗药材炼丹</span>
                  )}
                </div>
              </div>

              {/* Recipe Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pillRecipes.map((recipe) => (
                  <div key={recipe.name} className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3 hover:border-[#a1d1b4]/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#e3e3dc] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#e9c176]" />
                        {recipe.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2d5a43] text-[#a1d1b4]">
                        {recipe.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b938c]">{recipe.desc}</p>
                    <div className="text-xs text-[#a1d1b4]">
                      回复加成: +{recipe.hp} 气血 / +{recipe.mp} 灵力
                    </div>
                    <button
                      onClick={() => startAlchemy(recipe)}
                      disabled={alchemyState === 'brewing'}
                      className="w-full py-2 rounded-lg bg-[#2d5a43] hover:bg-[#3a674f] disabled:opacity-50 text-[#a1d1b4] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>开炉炼制 ({Math.round(recipe.durationMs / 1000)}秒)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'refining' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#005295]/20 border border-[#a4c9ff]/40 flex items-center gap-3">
                <Hammer className="w-6 h-6 text-[#a4c9ff]" />
                <div className="text-xs text-[#8b938c]">
                  融入庚金、天星石等天材地宝，极具锐气的法宝锻造炉，全面提升本命装备战力！
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#e3e3dc]">庚金精锻飞剑</span>
                    <span className="text-xs text-[#a4c9ff]">攻击力 +120</span>
                  </div>
                  <p className="text-xs text-[#8b938c]">无坚不摧的锐金飞剑，极大强化攻击输出。</p>
                  <button
                    onClick={() => handleRefine('庚金精锻飞剑', 120)}
                    className="w-full py-2 rounded-lg bg-[#005295] hover:bg-[#0062b3] text-[#a4c9ff] font-bold text-xs transition-all"
                  >
                    使用庚金锻造飞剑
                  </button>
                </div>
                
                {artifactRecipes.map((recipe) => (
                  <div key={recipe.name} className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3 hover:border-[#a4c9ff]/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#e3e3dc] flex items-center gap-1.5">
                        <Hammer className="w-4 h-4 text-[#a4c9ff]" />
                        {recipe.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#005295] text-[#a4c9ff]">
                        {recipe.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b938c]">{recipe.desc}</p>
                    <div className="text-xs text-[#a4c9ff]">
                      法宝技能: {recipe.skillDesc}
                    </div>
                    <button
                      onClick={() => handleCraftArtifact(recipe)}
                      className="w-full py-2 rounded-lg bg-[#005295] hover:bg-[#0062b3] text-[#a4c9ff] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Hammer className="w-4 h-4 text-[#a4c9ff]" />
                      <span>开炉炼制法宝</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'talisman' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#713f12]/30 border border-[#facc15]/40 flex items-center gap-3">
                <Zap className="w-6 h-6 text-[#facc15]" />
                <div className="text-xs text-[#e3e3dc]">
                  <span className="font-bold text-[#facc15]">《凡人修仙传》秘传符箓画法：</span>
                  朱砂画符，妖血蕴灵！绘制出的符箓可用于破敌、加速、防护，尤其是<span className="text-amber-300 font-bold">【避劫保命符】</span>可帮你在度过境界雷劫时抵御90%绝命闪电！
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: '避劫保命符',
                    rarity: '极品仙符',
                    desc: '凡人修仙界渡劫渡难至宝！吸收绝大部分雷劫天威，大幅降低渡劫陨落风险。',
                    effect: '渡劫雷霆伤害降低 90%',
                    materials: '避劫符纸 + 妖兽精血 + 庚金精石',
                  },
                  {
                    name: '疾风迅雷符',
                    rarity: '中品灵符',
                    desc: '将极速风雷印记刻入腿部身法，大幅提速，来去如风。',
                    effect: '移动速度与攻速 +80%',
                    materials: '黄符纸 + 朱砂',
                  },
                  {
                    name: '金刚护体符',
                    rarity: '上品灵符',
                    desc: '凝聚金刚不坏佛光护罩，抵挡万千飞剑与法术轰击。',
                    effect: '获得 1000 点金刚护罩',
                    materials: '黄符纸 + 百炼铁精',
                  },
                  {
                    name: '辟邪神雷符',
                    rarity: '极品灵符',
                    desc: '将万年金雷竹中的辟邪神雷封入符中，对周遭魔煞造成致命重创。',
                    effect: '召唤 12 道辟邪金雷狂轰',
                    materials: '黄符纸 + 庚金精石',
                  },
                  {
                    name: '太乙化清符',
                    rarity: '玄天级仙符',
                    desc: '真仙界避祸禁术！身化清气融入虚空，免疫一切物理与法术伤害。',
                    effect: '10 秒内完全无敌化清',
                    materials: '避劫符纸 + 庚金精石',
                  },
                ].map((recipe) => (
                  <div key={recipe.name} className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3 hover:border-[#facc15]/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#e3e3dc] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#facc15]" />
                        {recipe.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#713f12] text-[#facc15] font-semibold">
                        {recipe.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b938c]">{recipe.desc}</p>
                    <div className="text-xs text-amber-300 font-semibold">
                      功效: {recipe.effect}
                    </div>
                    <div className="text-[11px] text-[#8b938c]">
                      所需材料: <span className="text-[#a1d1b4]">{recipe.materials}</span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playBreakthrough();
                        if (onCraftTalisman) {
                          onCraftTalisman(recipe.name, recipe.effect);
                        } else {
                          onCraftPill(recipe.name, 200, 200);
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-[#713f12] to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30"
                    >
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-900" />
                      <span>绘制符箓 (消耗材料)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

