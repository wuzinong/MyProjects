import React, { useState, useEffect, useRef } from 'react';
import { FlyingSword, PlayerStats } from '../types/game';
import { sound } from '../engine/sound';
import { getResourceImage } from '../utils/aiImageStore';
import { Sword, Zap, Shield, Sparkles, X, ChevronRight, Plus, Flame, Wind, Droplets, Mountain, Sun } from 'lucide-react';
import { WebGLShaderCanvas, ShaderType } from './WebGLShaderCanvas';

// Interactive Real-Time 2D Elemental Sword Formation Canvas Preview
const SwordArrayCanvasPreview: React.FC<{ element: string }> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const elemColorMap: Record<string, { main: string; blade: string; trail: string; border: string }> = {
      '金': { main: '#facc15', blade: '#fef08a', trail: 'rgba(250, 204, 21, 0.65)', border: '#ca8a04' },
      '木': { main: '#10b981', blade: '#a7f3d0', trail: 'rgba(16, 185, 129, 0.65)', border: '#047857' },
      '水': { main: '#38bdf8', blade: '#e0f2fe', trail: 'rgba(56, 189, 248, 0.65)', border: '#0369a1' },
      '火': { main: '#f43f5e', blade: '#fecdd3', trail: 'rgba(244, 63, 94, 0.65)', border: '#b91c1c' },
      '土': { main: '#f59e0b', blade: '#fef3c7', trail: 'rgba(245, 158, 11, 0.65)', border: '#b45309' },
      '雷': { main: '#34d399', blade: '#fde047', trail: 'rgba(52, 211, 153, 0.65)', border: '#047857' },
      '风': { main: '#2dd4bf', blade: '#ccfbf1', trail: 'rgba(45, 212, 191, 0.65)', border: '#0f766e' },
    };

    const colors = elemColorMap[element] || elemColorMap['雷'];

    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 56;

      ctx.save();
      ctx.translate(cx, cy);

      // Central glowing elemental rune core
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = colors.main;
      ctx.shadowColor = colors.main;
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 2 Sparse Criss-cross Razor Slashes
      for (let s = 0; s < 2; s++) {
        const sang = (s * Math.PI) / 2 + Math.sin(time * 2) * 0.1;
        ctx.save();
        ctx.rotate(sang);
        ctx.beginPath();
        ctx.moveTo(-radius * 1.1, 0);
        ctx.lineTo(radius * 1.1, 0);
        ctx.strokeStyle = colors.trail;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 6 Outer Orbiting Swords (Sparse & Clean)
      for (let i = 0; i < 6; i++) {
        const ang = time * 2.2 + (i * Math.PI * 2) / 6;
        const sx = Math.cos(ang) * radius;
        const sy = Math.sin(ang) * radius;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + Math.PI / 2);

        // Trail
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 16);
        ctx.strokeStyle = colors.trail;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Blade
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(3, 4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fillStyle = colors.blade;
        ctx.shadowColor = colors.main;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Elemental specific visual accents
        if (element === '金') {
          ctx.beginPath();
          ctx.moveTo(-2, -8);
          ctx.lineTo(2, -4);
          ctx.lineTo(-2, 0);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (element === '火') {
          ctx.beginPath();
          ctx.arc(0, -10, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#f97316';
          ctx.fill();
        } else if (element === '水') {
          ctx.beginPath();
          ctx.arc(0, -4, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
          ctx.fill();
        } else if (element === '木') {
          ctx.beginPath();
          ctx.arc(4, -4, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#34d399';
          ctx.fill();
        } else if (element === '土') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.strokeRect(-4, -4, 8, 8);
        } else if (element === '雷') {
          ctx.beginPath();
          ctx.moveTo(-2, -10);
          ctx.lineTo(2, -5);
          ctx.lineTo(-2, 0);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (element === '风') {
          ctx.beginPath();
          ctx.arc(0, -2, 6, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
          ctx.stroke();
        }

        ctx.restore();
      }

      // 3 Inner Counter-Rotating Swords
      for (let j = 0; j < 3; j++) {
        const jang = -time * 3.2 + (j * Math.PI * 2) / 3;
        const ix = Math.cos(jang) * radius * 0.45;
        const iy = Math.sin(jang) * radius * 0.45;

        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(jang + Math.PI);

        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(2.5, 3);
        ctx.lineTo(0, 1.5);
        ctx.lineTo(-2.5, 3);
        ctx.closePath();
        ctx.fillStyle = colors.main;
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [element]);

  return (
    <div className="relative group shrink-0 flex flex-col items-center gap-1">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={160}
          height={160}
          className="w-32 h-32 rounded-2xl bg-black/60 border border-[#a1d1b4]/40 shadow-2xl relative z-10"
        />
        <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-md pointer-events-none" />
      </div>
      <span className="text-[10px] text-amber-300 font-bold">【{element}系绝杀剑阵全景】</span>
    </div>
  );
};

interface FlyingSwordsModalProps {
  flyingSwords: FlyingSword[];
  player: PlayerStats;
  onClose: () => void;
  onRefineSword: (swordName: string, material: string) => void;
  onAssembleFormation: () => void;
  onUpdateEquippedSwords?: (elements: string[]) => void;
}

export const FlyingSwordsModal: React.FC<FlyingSwordsModalProps> = ({
  flyingSwords,
  player,
  onClose,
  onRefineSword,
  onAssembleFormation,
  onUpdateEquippedSwords,
}) => {
  const [selectedElement, setSelectedElement] = useState<string>('雷');
  const [equippedElements, setEquippedElements] = useState<string[]>(
    player.equippedSwordElements || ['雷', '金', '木', '水', '火', '土', '风']
  );

  const toggleElementEquip = (elementName: string) => {
    sound.playSwordSlash();
    let next: string[];
    if (equippedElements.includes(elementName)) {
      next = equippedElements.filter((e) => e !== elementName);
    } else {
      next = [...equippedElements, elementName];
    }
    setEquippedElements(next);
    if (onUpdateEquippedSwords) onUpdateEquippedSwords(next);
  };

  const handleClearAllElements = () => {
    sound.playPickup();
    setEquippedElements([]);
    if (onUpdateEquippedSwords) onUpdateEquippedSwords([]);
  };

  const handleSelectAllElements = () => {
    sound.playThunder();
    const all = ['雷', '金', '木', '水', '火', '土', '风'];
    setEquippedElements(all);
    if (onUpdateEquippedSwords) onUpdateEquippedSwords(all);
  };

  const handleSelectSingleElement = (elementName: string) => {
    sound.playPickup();
    setSelectedElement(elementName);
    const single = [elementName];
    setEquippedElements(single);
    if (onUpdateEquippedSwords) onUpdateEquippedSwords(single);
  };

  // Complete List of 7 Elemental Life Swords with specific Sword Aura CSS effects
  const elementalSwords = [
    {
      id: 'SWORD_THUNDER',
      name: '青竹蜂云剑 (辟邪金雷)',
      element: '雷',
      material: '万年金雷竹',
      auraClass: 'sword-aura-thunder',
      bgGlow: 'from-emerald-900/40 via-teal-950/20 to-slate-900',
      badgeColor: 'text-amber-300 bg-emerald-950/80 border-emerald-500/50',
      desc: '由万年金雷竹凝炼，蕴含辟邪神雷，克制天地一切魔功煞气。剑芒凌厉如紫电狂风。',
      atk: 280,
      skill: '辟邪神雷降世',
    },
    {
      id: 'SWORD_GOLD',
      name: '庚金破虚剑 (锐金之芒)',
      element: '金',
      material: '太乙庚金',
      auraClass: 'sword-aura-gold',
      bgGlow: 'from-amber-900/40 via-yellow-950/20 to-slate-900',
      badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-500/50',
      desc: '融入太乙庚金精气，无坚不摧。金光剑芒可贯穿山岳万法，无视三成护体气罩。',
      atk: 320,
      skill: '庚金斩虚空',
    },
    {
      id: 'SWORD_WOOD',
      name: '乙木长生剑 (生生不息)',
      element: '木',
      material: '万年常青藤',
      auraClass: 'sword-aura-wood',
      bgGlow: 'from-emerald-900/40 via-emerald-950/20 to-slate-900',
      badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50',
      desc: '吸收草木苍翠精华，催动碧绿光芒，挥剑攻击时源源不断回补主人生命气血。',
      atk: 220,
      skill: '枯木逢春阵',
    },
    {
      id: 'SWORD_WATER',
      name: '玄冰寒魄剑 (冰冻九天)',
      element: '水',
      material: '玄天寒冰魄',
      auraClass: 'sword-aura-water',
      bgGlow: 'from-cyan-900/40 via-sky-950/20 to-slate-900',
      badgeColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50',
      desc: '极寒之地的寒魄凝结，剑芒如凛冽冰霜，命中目标时减缓其攻击与移动速度。',
      atk: 240,
      skill: '冰封千里封印',
    },
    {
      id: 'SWORD_FIRE',
      name: '纯阳赤霄剑 (真火焚天)',
      element: '火',
      material: '太阳精火石',
      auraClass: 'sword-aura-fire',
      bgGlow: 'from-rose-900/40 via-red-950/20 to-slate-900',
      badgeColor: 'text-rose-300 bg-rose-950/80 border-rose-500/50',
      desc: '三味真火淬炼成型，剑芒熊熊燃烧炽烈夺目，造成高额持续灼烧伤害。',
      atk: 350,
      skill: '三味真火燎原',
    },
    {
      id: 'SWORD_EARTH',
      name: '黄元重岩剑 (镇山御岳)',
      element: '土',
      material: '天星玄铁',
      auraClass: 'sword-aura-earth',
      bgGlow: 'from-amber-950/40 via-stone-950/20 to-slate-900',
      badgeColor: 'text-amber-200 bg-stone-900/80 border-amber-600/50',
      desc: '重如泰山沉稳无比，古黄色剑芒散发沉重威压，防御力大幅提升。',
      atk: 200,
      skill: '泰山压顶镇岳',
    },
    {
      id: 'SWORD_WIND',
      name: '九天风罡剑 (迅捷飘忽)',
      element: '风',
      material: '九天罡风之精',
      auraClass: 'sword-aura-wind',
      bgGlow: 'from-teal-900/40 via-teal-950/20 to-slate-900',
      badgeColor: 'text-teal-300 bg-teal-950/80 border-teal-500/50',
      desc: '速度极快如疾风掠影，淡青色剑芒划破苍穹，使飞剑旋转切割速度翻倍。',
      atk: 260,
      skill: '风卷残云飞刃',
    },
  ];

  const primarySword = flyingSwords[0] || {
    id: 'SWORD0001',
    name: '青竹蜂云剑',
    count: 1,
    element: '雷',
    material: '万年金雷竹',
    atk: 120,
    speed: 8,
    specialSkill: '辟邪神雷',
    isFormationUnlocked: false,
  };

  const activeSword = elementalSwords.find((s) => s.element === selectedElement) || elementalSwords[0];

  const getSwordShader = (element: string): ShaderType => {
    switch (element) {
      case '雷': return 'golden_lightning';
      case '金': return 'spatial_crack';
      case '木': return 'emerald_spiral';
      case '水': return 'spirit_ripple';
      case '火': return 'fire_burst';
      case '土': return 'golden_core';
      case '风': return 'falling_swords';
      default: return 'golden_lightning';
    }
  };

  const handleRefineNewSword = () => {
    sound.playSwordSlash();
    onRefineSword(activeSword.name, activeSword.material);
  };

  const handleAssembleFormation = () => {
    sound.playThunder();
    onAssembleFormation();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-[#a1d1b4]" />
            <h2 className="text-xl font-bold text-[#e9c176]">本命飞剑 · 剑芒与七系剑阵</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Element Selection Tabs & Multi-Equip Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a1d1b4]">
              <span className="font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300" />
                出战剑系 (切换查看各系属性，勾选多系在战斗中呈现独一无二光芒与攻击特效):
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllElements}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 font-bold transition-all text-[11px]"
                >
                  ⚡ 全选七系飞剑
                </button>
                <button
                  onClick={handleClearAllElements}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold transition-all text-[11px]"
                >
                  ❌ 卸下全阵 (不出战)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {elementalSwords.map((s) => {
                const isEquipped = equippedElements.includes(s.element);
                const isSelected = selectedElement === s.element;
                return (
                  <div
                    key={s.element}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#2d5a43] text-[#e9c176] border-[#e9c176] shadow-lg shadow-emerald-950/50 scale-105'
                        : 'bg-[#1a1c18] text-[#8b938c] border-[#414943] hover:text-[#e3e3dc]'
                    }`}
                    onClick={() => {
                      setSelectedElement(s.element);
                      sound.playPickup();
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isEquipped}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleElementEquip(s.element);
                      }}
                      className="w-3.5 h-3.5 accent-amber-400 cursor-pointer"
                    />
                    <span>{s.element}系 · {s.name.split(' ')[0]}</span>
                    {isEquipped && (
                      <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
                        出战
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Sword Display with Animated CSS "剑芒" Aura and Live 2D Sword Array Canvas Preview */}
          <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${activeSword.bgGlow} border border-[#a1d1b4]/50 shadow-2xl space-y-5 overflow-hidden`}>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Left Column: Sword Image & Real-Time Canvas Sword Array Preview */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Sword Image inside Animated CSS Sword Aura Glow Container */}
                <div className="relative group shrink-0 w-32 h-32 flex items-center justify-center">
                  {/* Live WebGL Shader Effect Behind Sword */}
                  <div className="absolute inset-0 z-0 opacity-80 scale-125 pointer-events-none overflow-hidden rounded-2xl">
                    <WebGLShaderCanvas type={getSwordShader(activeSword.element)} />
                  </div>
                  <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#e9c176] bg-[#121410] flex items-center justify-center shadow-2xl relative z-10 ${activeSword.auraClass}`}>
                    <img
                      src={getResourceImage('sw_01')}
                      alt={activeSword.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Extra ambient glow background */}
                  <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl -z-0 animate-pulse" />
                </div>

                {/* Real-Time 2D Sword Formation Canvas Preview */}
                <SwordArrayCanvasPreview element={activeSword.element} />
              </div>

              {/* Sword Details */}
              <div className="flex-1 space-y-3 text-center lg:text-left">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${activeSword.badgeColor}`}>
                      【{activeSword.element}属性剑芒】{activeSword.material}
                    </span>
                    <h3 className="text-2xl font-black text-[#e9c176] mt-1">{activeSword.name}</h3>
                  </div>

                  <div className="bg-[#121410]/80 border border-[#414943] px-4 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-[#8b938c] block">已成型飞剑</span>
                    <span className="text-lg font-black text-amber-300">{primarySword.count} / 72 柄</span>
                  </div>
                </div>

                <p className="text-xs text-[#e3e3dc]/80 leading-relaxed">
                  {activeSword.desc}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-[#121410]/90 border border-[#414943]">
                    <div className="text-[10px] text-[#8b938c]">核心剑法</div>
                    <div className="font-bold text-[#e3e3dc] mt-0.5">{activeSword.skill}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121410]/90 border border-[#414943]">
                    <div className="text-[10px] text-[#8b938c]">单柄威能</div>
                    <div className="font-bold text-emerald-400 mt-0.5">+{activeSword.atk} 攻击</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121410]/90 border border-[#414943]">
                    <div className="text-[10px] text-[#8b938c]">剑阵光影特效</div>
                    <div className="font-bold text-amber-300 mt-0.5">{activeSword.element}光剑芒</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sword Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3 hover:border-[#a1d1b4]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#e3e3dc]">开炉造化精炼【{activeSword.name}】</span>
                <span className="text-xs text-[#a1d1b4]">消耗: 100灵石</span>
              </div>
              <p className="text-xs text-[#8b938c]">
                融入【{activeSword.material}】将掌天绿液催化之精粹注入剑池，提升本命剑阵剑芒威能！
              </p>
              <button
                onClick={handleRefineNewSword}
                className="w-full py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#3a674f] text-[#a1d1b4] font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>精炼【{activeSword.element}系剑芒】飞剑 (+1柄)</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-3 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#e9c176]">催动【青竹绝杀大剑阵】</span>
                <span className="text-xs text-[#e9c176]">需 12 柄以上</span>
              </div>
              <p className="text-xs text-[#8b938c]">
                将七系元素剑芒汇聚一体，引动万千剑芒横扫八荒，造成全屏毁天灭地道法效果！
              </p>
              <button
                onClick={handleAssembleFormation}
                className="w-full py-2.5 rounded-xl bg-[#604403] hover:bg-[#735305] text-[#dab36a] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>凝聚【七彩剑芒】诛仙剑阵</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

