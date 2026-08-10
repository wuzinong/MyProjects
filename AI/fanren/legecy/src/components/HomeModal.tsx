import React, { useState, useEffect } from 'react';
import { PlayerStats, GardenSlot, GameItem } from '../types/game';
import { 
  Tent, Leaf, X, Sparkles, Sprout, Wind, Droplets, 
  Shield, Zap, ArrowUpCircle, MousePointer2, Flame, 
  Coffee, Flower2, CheckCircle2, RefreshCw, Award, Crown, Sun
} from 'lucide-react';
import { sound } from '../engine/sound';
import { resolveAssetUrl, getItemExactImage } from '../utils/aiImageStore';

// Preset Xianxia seeds and images
const PRESET_SEEDS = [
  {
    id: 'seed_jiuqu',
    name: '九曲灵参',
    rarity: '玄天灵宝' as const,
    category: 'material' as const,
    description: '夺天地造化之万年神参，能化形成白兔遁走，炼制延寿渡劫神丹之主药。',
    icon: 'jiuqu_ginseng_1785397409414.jpg',
    ripenYears: 10000
  },
  {
    id: 'seed_qiling',
    name: '七灵雪芝',
    rarity: '通天灵宝' as const,
    category: 'material' as const,
    description: '产于极寒雪峰的奇绝灵芝，七彩祥云环绕，精粹灵气直透肺腑。',
    icon: 'qiling_xueling_1785397436637.jpg',
    ripenYears: 5000
  },
  {
    id: 'seed_xuantian',
    name: '玄天仙果',
    rarity: '玄天灵宝' as const,
    category: 'material' as const,
    description: '玄天藤结出之仙家灵果，蕴含混沌法则碎片，参悟玄功仙法必不可少。',
    icon: 'xuantian_guo_1785397537133.jpg',
    ripenYears: 12000
  },
  {
    id: 'seed_jiangmo',
    name: '降魔果',
    rarity: '上品法器' as const,
    category: 'material' as const,
    description: '蕴含辟邪正气之奇果，能克制域外天魔与红莲魔火。',
    icon: 'jiangmo_guo_1785397628377.jpg',
    ripenYears: 3000
  },
  {
    id: 'seed_bamboo',
    name: '玄青翠竹',
    rarity: '极品法器' as const,
    category: 'material' as const,
    description: '万年不干之避雷神竹，乃炼制青竹蜂云剑之绝佳主材。',
    icon: 'xuanqing_cuizhu_bamboo_1785403739205.jpg',
    ripenYears: 2000
  },
  {
    id: 'seed_pine',
    name: '仙灵古松',
    rarity: '古宝' as const,
    category: 'material' as const,
    description: '古仙洞府门前所种松果，饱饮太清仙气，枝干如盘龙般苍劲。',
    icon: 'xianling_gusong_1785397465154.jpg',
    ripenYears: 4000
  }
];

interface HomeModalProps {
  player: PlayerStats;
  inventory: GameItem[];
  garden: GardenSlot[];
  onPlant: (slotId: string, item: GameItem) => void;
  onHarvest: (slotId: string) => void;
  onClose: () => void;
  onCultivate?: () => void;
  onUpgradeCave?: () => void;
  onUseGreenVialOnGarden?: (slotId: string) => void;
  onUpdatePlayer?: React.Dispatch<React.SetStateAction<PlayerStats>>;
}

export const HomeModal: React.FC<HomeModalProps> = ({
  player,
  inventory,
  garden,
  onPlant,
  onHarvest,
  onClose,
  onCultivate,
  onUpgradeCave,
  onUseGreenVialOnGarden,
  onUpdatePlayer
}) => {
  const [activeTab, setActiveTab] = useState<'cave' | 'garden' | 'altar'>('cave');
  const [nowTick, setNowTick] = useState(Date.now());
  const [selectedSlotForPlanting, setSelectedSlotForPlanting] = useState<string | null>(null);
  const [isCultivating, setIsCultivating] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text?: string }[]>([]);
  const [incenseActive, setIncenseActive] = useState(false);
  const [teaRestored, setTeaRestored] = useState(false);
  const [soilLevel, setSoilLevel] = useState(1); // 1: 普通灵土, 2: 赤红阳土, 3: 九天紫霄息壤

  // Realm-based Cave Appearance Tier (1-4)
  const caveTier = (() => {
    const level = parseInt(player.realmId.replace('REALM', '')) || 1;
    if (level <= 2) return 1;
    if (level <= 4) return 2;
    if (level <= 7) return 3;
    return 4;
  })();

  const tierConfig = {
    1: {
      name: '简陋石屋',
      subtitle: '清苦简陋 · 潜心笃志',
      bgImg: resolveAssetUrl('xianxia_fa_bao_1785139383923.jpg'),
      bgGradient: 'from-stone-900 via-stone-950 to-black',
      accentColor: 'text-amber-200',
      accentBorder: 'border-amber-500/30',
      accentBg: 'bg-amber-600',
      glow: 'shadow-[0_0_30px_rgba(180,130,50,0.15)]',
      arrayName: '初级聚气阵',
      desc: '依山开凿的简朴石室，虽仅有一榻一蒲团，却胜在静谧无人打扰。',
      wheelImg: resolveAssetUrl('zhenyan_hualun_gong_1785398351089.jpg')
    },
    2: {
      name: '清修竹居',
      subtitle: '翠竹清泉 · 碧气盈室',
      bgImg: resolveAssetUrl('xuanqing_cuizhu_bamboo_1785403739205.jpg'),
      bgGradient: 'from-emerald-950 via-teal-950 to-black',
      accentColor: 'text-emerald-300',
      accentBorder: 'border-emerald-500/40',
      accentBg: 'bg-emerald-500',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.25)]',
      arrayName: '小聚灵大阵',
      desc: '绿竹环绕，清泉潺潺。布置了隐匿与聚灵复合大阵，草木灵气极其浓郁。',
      wheelImg: resolveAssetUrl('zhenyan_hualun_gong_1785398351089.jpg')
    },
    3: {
      name: '仙家别院',
      subtitle: '瑞彩千条 · 仙气缭绕',
      bgImg: resolveAssetUrl('xianxia_sect_art_1785140406211.jpg'),
      bgGradient: 'from-purple-950 via-indigo-950 to-black',
      accentColor: 'text-purple-300',
      accentBorder: 'border-purple-500/40',
      accentBg: 'bg-purple-500',
      glow: 'shadow-[0_0_50px_rgba(168,85,247,0.3)]',
      arrayName: '九宫聚灵大阵',
      desc: '仙气缭绕的宏伟庭院，奇花异草争艳，终年有灵云停驻，道韵悠长。',
      wheelImg: resolveAssetUrl('zhenyan_hualun_gong_1785398351089.jpg')
    },
    4: {
      name: '洞天福地',
      subtitle: '自成一界 · 万古长春',
      bgImg: resolveAssetUrl('xuanfu_lingdao_map_1785398454777.jpg'),
      bgGradient: 'from-amber-950 via-orange-950 to-black',
      accentColor: 'text-amber-300',
      accentBorder: 'border-amber-400/50',
      accentBg: 'bg-amber-500',
      glow: 'shadow-[0_0_70px_rgba(245,158,11,0.35)]',
      arrayName: '造化夺天大阵',
      desc: '自成一界的随身仙境小世界，法则隐现，日月同辉，乃人间无上修仙圣地。',
      wheelImg: resolveAssetUrl('zhenyan_hualun_gong_1785398351089.jpg')
    }
  };

  const config = tierConfig[caveTier as keyof typeof tierConfig];

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter materials and seeds from inventory
  const inventorySeeds = inventory.filter(i => i.category === 'material' || i.category === 'herb');

  // Combined available seed selection
  const allAvailableSeeds = [
    ...inventorySeeds,
    ...PRESET_SEEDS.filter(ps => !inventorySeeds.some(is => is.name === ps.name))
  ];

  const handleCultivateClick = (e: React.MouseEvent) => {
    sound.playEquip();
    if (onCultivate) onCultivate();
    setIsCultivating(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const expGained = caveTier * 50;

    const newParticle = { 
      id: Date.now() + Math.random(), 
      x, 
      y, 
      text: `+${expGained} 修为` 
    };
    setParticles(p => [...p, newParticle]);

    setTimeout(() => setIsCultivating(false), 200);
    setTimeout(() => {
      setParticles(p => p.filter(pt => pt.id !== newParticle.id));
    }, 1200);
  };

  // Drink Spirit Tea / Spring Water
  const handleDrinkTea = () => {
    sound.playBreakthrough();
    setTeaRestored(true);
    if (onUpdatePlayer) {
      onUpdatePlayer(prev => ({
        ...prev,
        hp: prev.maxHp,
        mp: prev.maxMp
      }));
    }
    setTimeout(() => setTeaRestored(false), 3000);
  };

  // Burn Spirit Incense
  const handleBurnIncense = () => {
    sound.playThunder();
    setIncenseActive(true);
    if (onUpdatePlayer) {
      onUpdatePlayer(prev => ({
        ...prev,
        critRate: Math.min(1.0, prev.critRate + 0.1)
      }));
    }
  };

  // Batch Harvest All Ready Plots
  const handleBatchHarvest = () => {
    sound.playPickup();
    garden.forEach(slot => {
      if (slot.itemId) {
        const timeElapsed = slot.plantedAt > 0 ? nowTick - slot.lastHarvestedAt : 0;
        const speedMultiplier = soilLevel === 3 ? 2 : soilLevel === 2 ? 1.5 : 1;
        const harvestAmount = Math.floor((timeElapsed * speedMultiplier) / 10000);
        if (harvestAmount > 0) {
          onHarvest(slot.id);
        }
      }
    });
  };

  // Soil Upgrade
  const handleUpgradeSoil = () => {
    if (soilLevel >= 3) return;
    const cost = soilLevel === 1 ? 2000 : 8000;
    if (player.spiritStones < cost) {
      alert(`灵石不足！升阶灵土需要 ${cost} 灵石。`);
      return;
    }
    sound.playBreakthrough();
    if (onUpdatePlayer) {
      onUpdatePlayer(prev => ({ ...prev, spiritStones: prev.spiritStones - cost }));
    }
    setSoilLevel(prev => prev + 1);
  };

  // Get herb image URL from name
  const getHerbImage = (name: string) => {
    const matchPreset = PRESET_SEEDS.find(s => s.name === name);
    if (matchPreset) return resolveAssetUrl(matchPreset.icon);
    return getItemExactImage(name, 'herb');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="w-full h-full md:h-[92vh] md:max-h-[850px] max-w-6xl bg-black/50 border border-amber-500/20 md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative backdrop-blur-2xl">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 border-b border-amber-500/20 bg-black/70 z-20">
          <h2 className="text-base font-black text-amber-200 flex items-center gap-2">
            <Tent className="w-5 h-5 text-amber-400" />
            <span>仙家洞府 · {config.name}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-amber-500/15 flex flex-row md:flex-col shrink-0 z-20">
          <div className="hidden md:flex flex-col p-6 border-b border-amber-500/15 bg-gradient-to-br from-amber-950/30 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-amber-100 tracking-wider">洞府药田</h2>
                <span className="text-[10px] text-amber-400/80 font-semibold tracking-widest uppercase">Immortal Sanctuary</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              隐世修真，吞吐灵气。<br/>绿液造化，培育万载神药。
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-row md:flex-col gap-2 p-2.5 md:p-5 flex-1 overflow-x-auto md:overflow-visible">
            <button
              onClick={() => { setActiveTab('cave'); sound.playEquip(); }}
              className={`flex-1 md:flex-none text-left px-4 py-3 md:py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center md:justify-start gap-3 group relative cursor-pointer ${
                activeTab === 'cave' 
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Wind className={`w-5 h-5 ${activeTab === 'cave' ? 'text-amber-400' : 'text-gray-500'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold">仙家洞府</span>
                <span className="text-[10px] text-gray-400 hidden md:block">打坐吐纳 · 升级灵脉</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('garden'); sound.playEquip(); }}
              className={`flex-1 md:flex-none text-left px-4 py-3 md:py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center md:justify-start gap-3 group relative cursor-pointer ${
                activeTab === 'garden' 
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Leaf className={`w-5 h-5 ${activeTab === 'garden' ? 'text-emerald-400' : 'text-gray-500'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold">掌天药田</span>
                <span className="text-[10px] text-gray-400 hidden md:block">种植灵药 · 绿液催熟</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('altar'); sound.playEquip(); }}
              className={`flex-1 md:flex-none text-left px-4 py-3 md:py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center md:justify-start gap-3 group relative cursor-pointer ${
                activeTab === 'altar' 
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Coffee className={`w-5 h-5 ${activeTab === 'altar' ? 'text-purple-400' : 'text-gray-500'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold">灵泉香案</span>
                <span className="text-[10px] text-gray-400 hidden md:block">品茗灵泉 · 焚香祈福</span>
              </div>
            </button>
          </div>

          {/* Player Mini Status Footer */}
          <div className="hidden md:flex flex-col p-4 m-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">洞府契合境界:</span>
              <span className="font-bold text-amber-300">{player.realmId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">掌天绿液:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                {player.greenVialLiquids || 0} 滴
              </span>
            </div>
          </div>
        </div>

        {/* Main Interactive Content Panel */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-black/60 via-black/80 to-black">
          
          {/* Desktop Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all hidden md:flex items-center justify-center z-50 cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-10">
            
            {/* ===================================================== */}
            {/* --- TAB 1: CAVE (仙家洞府) --- */}
            {/* ===================================================== */}
            {activeTab === 'cave' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto flex flex-col min-h-full justify-between space-y-6">
                
                {/* Header Title with Realm Exterior Tier */}
                <div className="relative rounded-3xl overflow-hidden p-6 border border-amber-500/20 bg-black/60 shadow-xl">
                  {/* Background Artwork */}
                  <img 
                    src={config.bgImg} 
                    alt="Cave Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[2px] transition-all duration-700 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                        <Award className="w-3.5 h-3.5" />
                        洞府外观等级 Phase {caveTier}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-widest flex items-center gap-3">
                        {player.name}的【{config.name}】
                      </h3>
                      <p className="text-amber-200/70 text-xs font-medium mt-1">{config.subtitle}</p>
                      <p className="text-gray-400 text-xs max-w-lg mt-2 leading-relaxed">{config.desc}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-gray-400">当前聚灵阵</span>
                      <span className="text-sm font-bold text-amber-300 border-b border-amber-500/30 pb-0.5">
                        {config.arrayName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Center Array Circle */}
                <div className="relative flex-1 flex items-center justify-center min-h-[300px] my-4">
                  {/* Glowing background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30 rounded-full blur-[100px]`} />
                  
                  {/* Array Circles */}
                  <div className={`relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center rounded-full ${config.glow}`}>
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed ${config.accentBorder} animate-[spin_25s_linear_infinite]`} />
                    <div className={`absolute inset-4 rounded-full border border-dotted ${config.accentBorder} animate-[spin_18s_linear_infinite_reverse]`} />
                    <div className={`absolute inset-10 rounded-full border border-solid ${config.accentBorder} opacity-40`} />
                    
                    {/* Rotating Magic Wheel Artwork */}
                    <img 
                      src={config.wheelImg} 
                      alt="Cultivation Wheel" 
                      className="absolute inset-8 w-auto h-auto object-contain opacity-25 animate-[spin_40s_linear_infinite] pointer-events-none rounded-full"
                    />

                    {/* Central Meditation Statue / Icon */}
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-black/60 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                        <Wind className={`w-9 h-9 ${config.accentColor}`} />
                      </div>
                      <span className={`text-base font-black tracking-widest ${config.accentColor}`}>{config.arrayName}</span>
                      <span className="text-xs text-amber-200/60 font-semibold">修仙洞府等级 Tier {caveTier}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        灵气加成 +{caveTier * 50}%
                      </span>
                    </div>

                    {/* Floating Interaction Particles */}
                    {particles.map(p => (
                      <div 
                        key={p.id}
                        className="absolute pointer-events-none text-xs font-black text-amber-300 animate-out fade-out zoom-out duration-1000"
                        style={{ left: p.x, top: p.y }}
                      >
                        {p.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions & Stats Grid */}
                <div className="flex flex-col gap-6">
                  {/* Main Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={handleCultivateClick}
                      className={`relative overflow-hidden group px-8 py-4 rounded-2xl font-black text-base transition-all cursor-pointer ${
                        isCultivating ? 'scale-95' : 'hover:scale-105'
                      } bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 border border-amber-300 active:scale-95`}
                    >
                      <span className="flex items-center gap-2.5">
                        <MousePointer2 className="w-5 h-5 text-black" />
                        <span>打坐吐纳 (获得+{caveTier * 50}修为)</span>
                      </span>
                    </button>

                    {onUpgradeCave && (
                      <button
                        onClick={() => { sound.playEquip(); onUpgradeCave(); }}
                        className="px-6 py-4 rounded-2xl font-bold text-gray-200 bg-black/60 hover:bg-black/80 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowUpCircle className="w-5 h-5 text-amber-400" />
                        <span>升级灵脉阵法 (1万灵石)</span>
                      </button>
                    )}
                  </div>

                  {/* Cave Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-black/50 rounded-2xl p-3.5 border border-amber-500/20 flex flex-col items-center text-center gap-1">
                      <Zap className={`w-5 h-5 ${config.accentColor}`} />
                      <div className="text-xs font-bold text-gray-400">灵气浓度</div>
                      <div className="text-sm font-black text-amber-300">+{caveTier * 50}%</div>
                    </div>
                    <div className="bg-black/50 rounded-2xl p-3.5 border border-amber-500/20 flex flex-col items-center text-center gap-1">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <div className="text-xs font-bold text-gray-400">阵法防御</div>
                      <div className="text-sm font-black text-blue-300">绝佳金光大阵</div>
                    </div>
                    <div className="bg-black/50 rounded-2xl p-3.5 border border-amber-500/20 flex flex-col items-center text-center gap-1">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <div className="text-xs font-bold text-gray-400">悟性加成</div>
                      <div className="text-sm font-black text-amber-300">+{caveTier * 5} 点</div>
                    </div>
                    <div className="bg-black/50 rounded-2xl p-3.5 border border-amber-500/20 flex flex-col items-center text-center gap-1">
                      <Sun className="w-5 h-5 text-emerald-400" />
                      <div className="text-xs font-bold text-gray-400">修炼速率</div>
                      <div className="text-sm font-black text-emerald-300">{caveTier * 1.5}x 倍速</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================== */}
            {/* --- TAB 2: GARDEN (掌天药田) --- */}
            {/* ===================================================== */}
            {activeTab === 'garden' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6">
                
                {/* Garden Banner Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-black/80 to-black p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-950/90 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-900/30 shrink-0 overflow-hidden">
                      <img 
                        src={resolveAssetUrl('green_vial_item_1785138256906.jpg')} 
                        alt="掌天瓶" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-emerald-100 flex items-center gap-2.5">
                        <span>掌天药田</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          造化之宝
                        </span>
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        绿液催熟，造化夺天。种植仙草神药，炼制无上仙丹。
                      </p>
                    </div>
                  </div>

                  {/* Actions & Soil Status Bar */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleBatchHarvest}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-lg shadow-emerald-500/20 border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>一键收获</span>
                    </button>

                    <button
                      onClick={handleUpgradeSoil}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-emerald-300 font-bold text-xs transition-all border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      <span>
                        {soilLevel === 1 ? '升级阳土 (2千灵石)' : soilLevel === 2 ? '升级紫霄息壤 (8千灵石)' : '息壤顶阶 (200%加速)'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Soil Quality Bar */}
                <div className="flex items-center justify-between bg-black/40 px-5 py-3 rounded-2xl border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-400">当前灵土:</span>
                    <span className="font-bold text-amber-300">
                      {soilLevel === 1 ? '普通灵土 (100% 基础生长)' : soilLevel === 2 ? '赤红阳土 (150% 快速生长)' : '九天紫霄息壤 (200% 极速成熟)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Droplets className="w-4 h-4" />
                    <span>瓶灵绿液: {player.greenVialLiquids || 0} 滴</span>
                  </div>
                </div>

                {/* Plot Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {garden.map((slot, index) => {
                    const timeElapsed = slot.plantedAt > 0 ? nowTick - slot.lastHarvestedAt : 0;
                    const speedMultiplier = soilLevel === 3 ? 2 : soilLevel === 2 ? 1.5 : 1;
                    const harvestAmount = Math.floor((timeElapsed * speedMultiplier) / 10000);
                    const progress = Math.min(1.0, ((timeElapsed * speedMultiplier) % 10000) / 10000);
                    const isSelected = selectedSlotForPlanting === slot.id;
                    const isReady = harvestAmount > 0;
                    const plantImg = slot.itemName ? getHerbImage(slot.itemName) : '';

                    return (
                      <div 
                        key={slot.id} 
                        className={`relative overflow-hidden rounded-3xl transition-all duration-300 border ${
                          isSelected 
                            ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                            : isReady 
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'bg-black/60 border-white/10 hover:border-emerald-500/30'
                        }`}
                      >
                        {/* Top Bar */}
                        <div className="p-3.5 pb-0 flex items-center justify-between relative z-10">
                          <span className="text-[10px] font-black text-emerald-400/80 tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            PLOT 0{index + 1}
                          </span>
                          {isReady && (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>

                        {/* Content Body */}
                        <div className="p-4 relative z-10 flex flex-col h-full min-h-[200px]">
                          {slot.itemId ? (
                            <div className="flex-1 flex flex-col justify-between space-y-3">
                              
                              {/* Plant Card Header */}
                              <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden ${
                                  isReady ? 'border-emerald-400 shadow-md shadow-emerald-900/40 bg-emerald-950/80' : 'border-white/10 bg-black/60'
                                }`}>
                                  <img 
                                    src={plantImg} 
                                    alt={slot.itemName} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-black text-amber-100">{slot.itemName}</div>
                                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                                    {isReady ? `可收获: x${harvestAmount}` : '生息滋养中...'}
                                  </div>
                                </div>
                              </div>

                              {/* Growth Progress Bar */}
                              <div className="space-y-1.5 my-2">
                                <div className="flex justify-between text-[10px] text-gray-400">
                                  <span>生长阶段: {isReady ? '100% 仙药熟' : `${Math.round(progress * 100)}%`}</span>
                                  <span>{isReady ? '成药' : '成长'}</span>
                                </div>
                                <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10">
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-linear relative"
                                    style={{ width: `${isReady ? 100 : progress * 100}%` }}
                                  >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 pt-1">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (isReady) {
                                        sound.playPickup();
                                        onHarvest(slot.id);
                                      }
                                    }}
                                    disabled={!isReady}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                      isReady 
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/30' 
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    Harvest 收获
                                  </button>

                                  <button
                                    onClick={() => {
                                      sound.playEquip();
                                      onPlant(slot.id, { id: '', name: '' } as any);
                                    }}
                                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/20 cursor-pointer"
                                  >
                                    铲除
                                  </button>
                                </div>

                                {/* Green Vial Drop Acceleration Button */}
                                <button
                                  onClick={() => {
                                    if (onUseGreenVialOnGarden) {
                                      onUseGreenVialOnGarden(slot.id);
                                    } else {
                                      if ((player.greenVialLiquids || 0) <= 0) {
                                        alert('掌天瓶绿液不足！请在战胜强敌或日常凝聚后使用。');
                                        return;
                                      }
                                      sound.playBreakthrough();
                                      if (onUpdatePlayer) {
                                        onUpdatePlayer(prev => ({
                                          ...prev,
                                          greenVialLiquids: Math.max(0, (prev.greenVialLiquids || 0) - 1)
                                        }));
                                      }
                                      onHarvest(slot.id);
                                    }
                                  }}
                                  className="w-full py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>掌天瓶滴液催熟 (-1滴绿液)</span>
                                </button>
                              </div>

                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col justify-between">
                              {isSelected ? (
                                <div className="space-y-2 flex-1 flex flex-col">
                                  <div className="text-xs text-emerald-300 font-bold mb-1 flex items-center justify-between">
                                    <span>选择种子播种:</span>
                                    <button 
                                      onClick={() => setSelectedSlotForPlanting(null)}
                                      className="text-[10px] text-gray-400 hover:text-white"
                                    >
                                      取消
                                    </button>
                                  </div>

                                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 max-h-[160px] pr-1">
                                    {allAvailableSeeds.map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => {
                                          sound.playEquip();
                                          onPlant(slot.id, item as GameItem);
                                          setSelectedSlotForPlanting(null);
                                        }}
                                        className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-emerald-950/60 border border-transparent hover:border-emerald-500/40 transition-all flex items-center gap-2.5 cursor-pointer group"
                                      >
                                        <img 
                                          src={getHerbImage(item.name)} 
                                          alt={item.name} 
                                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-bold text-amber-100 truncate group-hover:text-emerald-300">
                                            {item.name}
                                          </div>
                                          <div className="text-[10px] text-gray-400 truncate">{item.description}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3 text-center">
                                  <div className="w-12 h-12 rounded-2xl bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center text-gray-500">
                                    <Sprout className="w-6 h-6 text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-gray-400">灵田空置</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">播下种子即可生息发芽</div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedSlotForPlanting(slot.id)}
                                    className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-all border border-emerald-500/40 cursor-pointer"
                                  >
                                    播种灵药
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ===================================================== */}
            {/* --- TAB 3: ALTAR & SPIRIT SPRING (灵泉香案) --- */}
            {/* ===================================================== */}
            {activeTab === 'altar' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-6">
                
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black to-black border border-purple-500/20 shadow-xl space-y-6">
                  
                  <div className="flex items-center gap-4 border-b border-purple-500/15 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-md">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-purple-100">灵泉品茗 & 香案祈福</h3>
                      <p className="text-gray-400 text-xs mt-0.5">清修养神，品鉴上古灵泉，焚香默祷大道。</p>
                    </div>
                  </div>

                  {/* Interactive Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Spirit Spring Tea */}
                    <div className="p-5 rounded-2xl bg-black/60 border border-purple-500/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-purple-200 flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-purple-400" />
                            洞府千载灵泉
                          </span>
                          {teaRestored && (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 已饮用 (状态已满)
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          源自洞府最深处地脉渗出的千载清泉，饮之可瞬间恢复满额气血与真元！
                        </p>
                      </div>

                      <button
                        onClick={handleDrinkTea}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30 border border-purple-300 cursor-pointer"
                      >
                        品饮灵泉 (瞬间恢复满额血量与法力)
                      </button>
                    </div>

                    {/* Burn Incense */}
                    <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-amber-200 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-400" />
                            香案焚香祈福
                          </span>
                          {incenseActive && (
                            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> 暴击率+10% 祈福中
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          点燃太清安神沉香，余香缥缈，凝神静气，增加战斗暴击几率！
                        </p>
                      </div>

                      <button
                        onClick={handleBurnIncense}
                        disabled={incenseActive}
                        className={`w-full py-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                          incenseActive
                            ? 'bg-white/10 text-gray-400 border border-white/10 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 border border-amber-300'
                        }`}
                      >
                        {incenseActive ? '香火袅袅 (祈福加成中)' : '点燃沉香 (获得暴击几率+10%)'}
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
