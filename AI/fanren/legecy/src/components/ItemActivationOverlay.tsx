import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Flame, Shield, Heart, Feather, Droplets, Leaf, Compass, Sun, Moon } from 'lucide-react';
import { ElementType, ItemRarity } from '../types/game';
import { WebGLShaderCanvas, ShaderType } from './WebGLShaderCanvas';

export interface ActivatedItemInfo {
  id: string;
  name: string;
  category?: string;
  element?: ElementType | string;
  icon?: string;
  rarity?: ItemRarity | string;
  description?: string;
  effect?: string;
  timestamp: number;
}

interface ItemActivationOverlayProps {
  itemInfo: ActivatedItemInfo | null;
  onFinished?: () => void;
}

export const ItemActivationOverlay: React.FC<ItemActivationOverlayProps> = ({ itemInfo, onFinished }) => {
  const [active, setActive] = useState<ActivatedItemInfo | null>(null);
  const [phase, setPhase] = useState<'appear' | 'expand' | 'fade'>('appear');

  const handleDismiss = () => {
    setActive(null);
    if (onFinished) onFinished();
  };

  useEffect(() => {
    if (!itemInfo) {
      setActive(null);
      return;
    }

    setActive(itemInfo);
    setPhase('appear');

    // Strict 3.0 Second Sequence
    const t1 = setTimeout(() => {
      setPhase('expand');
    }, 200);

    const t2 = setTimeout(() => {
      setPhase('fade');
    }, 2400);

    const t3 = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [itemInfo]);

  if (!active) return null;

  const { name, category = '', element = '', icon, rarity = '法宝', description, effect } = active;

  // Determine specific item custom visual effects
  const isHuolong = name.includes('火龙') || name.includes('炎龙') || name.includes('火凤');
  const isHeifeng = name.includes('黑风') || name.includes('阴风') || name.includes('魔气') || name.includes('幡');
  const isJinchan = name.includes('金蝉') || name.includes('子母') || name.includes('斩灵');
  const isZhenyan = name.includes('真言') || name.includes('轮') || name.includes('化轮');
  const isXuanqing = name.includes('玄青翠') || name.includes('青竹') || name.includes('神竹');
  const isWuseshan = name.includes('五色扇') || name.includes('五行') || name.includes('九天扇');
  const isJifeng = name.includes('疾风');
  const isBijie = name.includes('避劫');
  const isLiuding = name.includes('六丁六甲');
  const isLuochen = name.includes('落尘');
  const isTiange = name.includes('天戈');
  const isHuanglong = name.includes('黄龙');
  const isJinyu = name.includes('金岫') || name.includes('金由') || name.includes('金髓');
  const isZhuji = name.includes('筑基');
  const isXingtianApe = name.includes('刑天') || name.includes('巨猿') || name.includes('啼魂');

  const isTalisman = category === 'talisman' || name.includes('符') || name.includes('敕');
  const isFuBao = category === 'fubao' || name.includes('符宝');
  const isPill = category === 'pill' || name.includes('丹') || name.includes('丸') || name.includes('散') || name.includes('瓶') || name.includes('液');
  const isManual = category === 'manual' || name.includes('经') || name.includes('诀') || name.includes('功');
  const isFire = element === '火' || name.includes('火') || name.includes('炎');
  const isThunder = element === '雷' || element === '辟邪神雷' || name.includes('雷') || name.includes('辟邪');
  const isIce = element === '冰' || element === '乾蓝冰焰' || name.includes('冰') || name.includes('寒');
  const isWind = element === '风' || name.includes('风') || name.includes('疾');

  // Select appropriate WebGL Shader Attack Effect
  const shaderType: ShaderType = (() => {
    if (isHuolong || isFire) return 'fire_burst';
    if (isHeifeng) return 'dark_smoke';
    if (isWuseshan) return 'five_element';
    if (isTiange) return 'spatial_crack';
    if (isLiuding) return 'blue_shield';
    if (isLuochen) return 'spirit_ripple';
    if (isXuanqing || isJinchan) return 'falling_swords';
    if (isJifeng) return 'emerald_spiral';
    if (isHuanglong || isJinyu || isZhuji || isPill) return 'golden_core';
    if (isXingtianApe) return 'blood_shadow';
    if (isZhenyan || isBijie) return 'time_wheel';
    if (isThunder) return 'golden_lightning';
    if (isManual) return 'five_element';
    return 'golden_core';
  })();

  // Rarity color class
  const getRarityBadge = (r: string) => {
    if (r.includes('玄天') || r.includes('混沌') || r.includes('仙器')) return 'from-amber-400 to-yellow-200 text-amber-950 border-amber-300';
    if (r.includes('通天') || r.includes('太乙')) return 'from-purple-500 to-indigo-300 text-purple-950 border-purple-300';
    if (r.includes('古宝') || r.includes('法宝')) return 'from-amber-600 to-orange-400 text-amber-950 border-amber-300';
    return 'from-emerald-600 to-teal-400 text-emerald-950 border-emerald-300';
  };

  // Border aura gradient & title text
  let auraGlow = 'shadow-[0_0_80px_rgba(234,179,8,0.8)] border-amber-400/80';
  let bgTheme = 'from-amber-950/80 via-slate-950/90 to-amber-950/80';
  let elementTitle = '✨ 祭出神物';

  if (isHuolong) {
    auraGlow = 'shadow-[0_0_120px_rgba(249,115,22,0.95)] border-orange-500';
    bgTheme = 'from-orange-950/90 via-[#1c1917]/95 to-red-950/90';
    elementTitle = '🐉 召唤九天火龙';
  } else if (isHeifeng) {
    auraGlow = 'shadow-[0_0_120px_rgba(147,51,234,0.95)] border-purple-600';
    bgTheme = 'from-purple-950/95 via-[#020617]/95 to-slate-950/95';
    elementTitle = '🌪️ 遮天黑风黑风旗';
  } else if (isWuseshan) {
    auraGlow = 'shadow-[0_0_120px_rgba(236,72,153,0.95)] border-pink-500';
    bgTheme = 'from-purple-950/90 via-slate-950/95 to-pink-950/90';
    elementTitle = '🪶 五色神光扫尽万物';
  } else if (isTiange) {
    auraGlow = 'shadow-[0_0_120px_rgba(234,179,8,0.95)] border-yellow-400';
    bgTheme = 'from-amber-950/90 via-slate-950/95 to-yellow-950/90';
    elementTitle = '🔱 黄金天戈降世破阵';
  } else if (isLiuding) {
    auraGlow = 'shadow-[0_0_120px_rgba(234,179,8,0.95)] border-amber-400';
    bgTheme = 'from-amber-950/90 via-slate-950/95 to-amber-900/90';
    elementTitle = '🛡️ 六丁六甲天将护体';
  } else if (isLuochen) {
    auraGlow = 'shadow-[0_0_100px_rgba(244,244,245,0.9)] border-zinc-200';
    bgTheme = 'from-slate-900/90 via-slate-950/95 to-teal-950/90';
    elementTitle = '✨ 降下落尘仙雨洗浊';
  } else if (isXuanqing) {
    auraGlow = 'shadow-[0_0_120px_rgba(34,197,94,0.95)] border-emerald-400';
    bgTheme = 'from-emerald-950/90 via-slate-950/95 to-teal-950/90';
    elementTitle = '🎋 玄青翠竹辟邪金雷';
  } else if (isBijie) {
    auraGlow = 'shadow-[0_0_120px_rgba(234,179,8,0.95)] border-amber-300';
    bgTheme = 'from-amber-950/90 via-slate-950/95 to-sky-950/90';
    elementTitle = '⚡ 避劫天符消融雷劫';
  } else if (isJifeng) {
    auraGlow = 'shadow-[0_0_100px_rgba(56,189,248,0.9)] border-sky-400';
    bgTheme = 'from-sky-950/90 via-slate-950/95 to-teal-950/90';
    elementTitle = '🍃 催发疾风符双腿生风';
  } else if (isHuanglong) {
    auraGlow = 'shadow-[0_0_110px_rgba(234,179,8,0.95)] border-amber-400';
    bgTheme = 'from-amber-950/90 via-slate-950/95 to-amber-900/90';
    elementTitle = '🐉 炼服黄龙金丹大补气血';
  } else if (isJinyu) {
    auraGlow = 'shadow-[0_0_110px_rgba(250,204,21,0.95)] border-yellow-300';
    bgTheme = 'from-yellow-950/90 via-slate-950/95 to-amber-950/90';
    elementTitle = '🌟 炼服金岫仙丹淬炼洗髓';
  } else if (isZhuji) {
    auraGlow = 'shadow-[0_0_130px_rgba(59,130,246,0.95)] border-blue-400';
    bgTheme = 'from-blue-950/90 via-slate-950/95 to-indigo-950/90';
    elementTitle = '💎 服用筑基丹破阶升仙';
  } else if (isXingtianApe) {
    auraGlow = 'shadow-[0_0_150px_rgba(220,38,38,1)] border-red-600';
    bgTheme = 'from-red-950/95 via-slate-950/95 to-black';
    elementTitle = '🦍 啼魂兽变身刑天巨猿！';
  } else if (isZhenyan) {
    auraGlow = 'shadow-[0_0_120px_rgba(234,179,8,0.95)] border-yellow-400';
    bgTheme = 'from-amber-950/90 via-slate-950/95 to-amber-900/90';
    elementTitle = '⏳ 运转真言化轮功';
  } else if (isTalisman) {
    auraGlow = 'shadow-[0_0_100px_rgba(245,158,11,0.9)] border-amber-400';
    bgTheme = 'from-amber-950/90 via-[#1c1917]/95 to-amber-900/90';
    elementTitle = '📜 催发上古神符';
  } else if (isFuBao) {
    auraGlow = 'shadow-[0_0_120px_rgba(239,68,68,0.95)] border-red-500';
    bgTheme = 'from-red-950/90 via-slate-950/95 to-red-950/90';
    elementTitle = '💥 祭出杀伐符宝';
  } else if (isPill) {
    auraGlow = 'shadow-[0_0_100px_rgba(16,185,129,0.9)] border-emerald-400';
    bgTheme = 'from-emerald-950/90 via-slate-950/95 to-teal-950/90';
    elementTitle = '🌿 炼服仙家妙丹';
  } else if (isManual) {
    auraGlow = 'shadow-[0_0_110px_rgba(168,85,247,0.9)] border-purple-400';
    bgTheme = 'from-purple-950/90 via-slate-950/95 to-indigo-950/90';
    elementTitle = '📖 领悟无上功法';
  } else if (isThunder) {
    auraGlow = 'shadow-[0_0_120px_rgba(56,189,248,0.95)] border-sky-400';
    bgTheme = 'from-sky-950/90 via-slate-950/95 to-cyan-950/90';
    elementTitle = '⚡ 引动九天神雷';
  } else if (isFire) {
    auraGlow = 'shadow-[0_0_110px_rgba(239,68,68,0.9)] border-orange-500';
    bgTheme = 'from-orange-950/90 via-slate-950/95 to-red-950/90';
    elementTitle = '🔥 释放三昧真火';
  }

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 pointer-events-auto cursor-pointer z-50 flex items-center justify-center overflow-hidden select-none"
      title="点击任意处快速关闭"
    >
      {/* WebGL Live Shader Full-Screen Effect */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
        <WebGLShaderCanvas type={shaderType} />
      </div>

      {/* 1. Full Screen Ambient FX Overlay */}
      <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-500 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`} />

      {/* 🐉 1. 火龙符/火系：数条咆哮火龙飞舞过屏特效 */}
      {isHuolong && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.35)_0%,transparent_80%)] animate-pulse" />
          
          <div className="absolute animate-dragon-1 flex items-center gap-2 filter drop-shadow-[0_0_30px_#f97316]">
            <div className="text-6xl sm:text-8xl transform rotate-[25deg] filter drop-shadow-[0_0_20px_#ef4444]">🐉</div>
            <div className="h-8 w-64 bg-gradient-to-r from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm" />
          </div>

          <div className="absolute animate-dragon-2 flex items-center gap-2 filter drop-shadow-[0_0_30px_#eab308]">
            <div className="text-6xl sm:text-8xl transform -rotate-[155deg] filter drop-shadow-[0_0_20px_#f59e0b]">🐉</div>
            <div className="h-8 w-72 bg-gradient-to-r from-yellow-500 via-orange-400 to-transparent rounded-full blur-sm" />
          </div>

          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316] animate-ping"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
                animationDuration: `${1 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 🌪️ 2. 黑风旗：满屏遮天黑风与阴风龙卷风暴 */}
      {isHeifeng && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-purple-950/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-purple-950/60 animate-black-wind" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/80 via-indigo-950/70 to-slate-950/80 animate-black-wind" style={{ animationDelay: '0.4s' }} />

          <div className="absolute top-1/4 left-1/4 flex gap-3 opacity-80 animate-pulse">
            <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_12px_#dc2626]" />
            <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_12px_#dc2626]" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 flex gap-3 opacity-80 animate-pulse" style={{ animationDelay: '0.6s' }}>
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]" />
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]" />
          </div>
        </div>
      )}

      {/* 🪶 3. 五色扇：五彩羽浪扫过大屏 */}
      {isWuseshan && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-cyan-500/20 to-purple-500/20 animate-pulse" />
          <div className="w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-tr from-emerald-500/20 via-pink-500/20 to-amber-500/20 animate-pulse" />
        </div>
      )}

      {/* 🔱 4. 天戈符：巨型黄金天戈刺穿九霄 */}
      {isTiange && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="animate-halberd flex flex-col items-center">
            <div className="text-8xl filter drop-shadow-[0_0_40px_#facc15]">🔱</div>
            <div className="w-4 h-96 bg-gradient-to-b from-amber-300 via-yellow-400 to-transparent shadow-[0_0_30px_#eab308]" />
          </div>
        </div>
      )}

      {/* 🛡️ 5. 六丁六甲符：六道通天金柱 */}
      {isLiuding && (
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-full bg-gradient-to-t from-amber-500/80 via-yellow-300/90 to-transparent animate-golden-pillar flex flex-col items-center justify-center"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-xl font-bold text-amber-950 font-serif my-4">甲</span>
            </div>
          ))}
        </div>
      )}

      {/* ✨ 6. 落尘符：绝尘白色仙雨 */}
      {isLuochen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-dust-rain flex flex-col items-center"
              style={{
                left: `${(i * 4) % 100}%`,
                animationDelay: `${(i % 5) * 0.2}s`,
              }}
            >
              <div className="w-1.5 h-16 bg-gradient-to-b from-white via-teal-200 to-transparent shadow-[0_0_12px_#ffffff]" />
            </div>
          ))}
        </div>
      )}

      {/* 🎋 7. 玄青翠竹：辟邪电光与翡翠竹林 */}
      {isXuanqing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="animate-bamboo-thunder flex items-center gap-4">
            <div className="text-9xl filter drop-shadow-[0_0_40px_#22c55e]">🎋</div>
            <div className="text-8xl text-emerald-300 font-bold font-serif filter drop-shadow-[0_0_30px_#34d399]">辟邪雷竹</div>
          </div>
        </div>
      )}

      {/* ⚡ 8. 避劫符：金色八卦雷光光罩 */}
      {isBijie && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-3xl animate-pulse shadow-[0_0_100px_#facc15]">
            <div className="w-full h-full flex items-center justify-center text-6xl font-serif text-amber-200 font-bold">☯️ 避劫绝煞 ☯️</div>
          </div>
        </div>
      )}

      {/* 🍃 9. 疾风符：双腿青风狂飙 */}
      {isJifeng && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-sky-400/20 to-teal-500/20 animate-pulse" />
        </div>
      )}

      {/* 🐉 10. 黄龙丹 / 金由丹 / 筑基丹 */}
      {(isHuanglong || isJinyu || isZhuji) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[500px] h-[500px] rounded-full blur-2xl animate-pulse ${isZhuji ? 'bg-blue-500/30' : 'bg-amber-500/30'}`} />
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-yellow-500 animate-bounce flex items-center justify-center shadow-[0_0_80px_#facc15] border-2 border-white/80">
            <span className="text-4xl">💊</span>
          </div>
        </div>
      )}

      {/* 🦍 11. 啼魂兽变身刑天巨猿 */}
      {isXingtianApe && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-red-950/60 animate-pulse" />
          <div className="animate-ape-roar flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_60px_#dc2626]">🦍</div>
            <div className="text-5xl font-black text-red-500 tracking-widest font-serif drop-shadow-[0_0_20px_#000]">刑天巨猿 · 狂暴降临</div>
          </div>
        </div>
      )}

      {/* ⏳ 12. 真言化轮功：金光金色时间轮盘 */}
      {isZhenyan && !isWuseshan && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full bg-amber-500/15 blur-2xl animate-pulse flex items-center justify-center">
            <span className="text-5xl font-serif font-black text-amber-200/80 tracking-widest filter drop-shadow-[0_0_20px_#facc15]">卍 梵 圣 真 言 卍</span>
          </div>
        </div>
      )}

      {/* 🗡️ 13. 金蝉符宝/斩灵剑：万剑齐发金光飞剑雨 */}
      {isJinchan && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-sword-beam flex flex-col items-center"
              style={{
                left: `${10 + i * 7}%`,
                animationDelay: `${(i % 5) * 0.15}s`,
              }}
            >
              <div className="w-1.5 h-32 bg-gradient-to-t from-transparent via-amber-300 to-white shadow-[0_0_20px_#facc15]" />
              <div className="w-4 h-4 bg-yellow-200 rotate-45 border border-amber-500 shadow-[0_0_10px_#fde047]" />
            </div>
          ))}
        </div>
      )}

      {/* ⚡ 14. 辟邪神雷/雷系：漫天狂雷电网 */}
      {isThunder && !isXuanqing && !isBijie && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full bg-cyan-500/15 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3)_0%,transparent_70%)]" />
        </div>
      )}

      {/* 🌿 15. 掌天瓶/通用丹药：翡翠灵气汇聚升腾 */}
      {isPill && !isHuanglong && !isJinyu && !isZhuji && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-[0_0_15px_#34d399] animate-bounce"
              style={{
                left: `${20 + (i * 4.5)}%`,
                top: `${35 + (Math.sin(i) * 25)}%`,
                animationDelay: `${i * 0.12}s`,
                animationDuration: '1.6s',
              }}
            />
          ))}
        </div>
      )}

      {/* 📜 16. 普通符箓背景 */}
      {isTalisman && !isHuolong && !isJifeng && !isBijie && !isLiuding && !isLuochen && !isTiange && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)] animate-pulse" />
        </div>
      )}

      {/* 2. Main Center Card - Image Enlarging & Dissolving Animation */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-1000 ease-out transform ${
          phase === 'appear'
            ? 'scale-75 opacity-0 translate-y-8'
            : phase === 'expand'
            ? 'scale-110 opacity-100 translate-y-0 blur-none'
            : 'scale-150 opacity-0 -translate-y-4 blur-md'
        }`}
      >
        {/* Outer Glow Halo */}
        <div className={`relative p-1 rounded-3xl bg-gradient-to-b ${bgTheme} border-2 ${auraGlow} backdrop-blur-xl max-w-sm sm:max-w-md w-full text-center shadow-2xl flex flex-col items-center p-6 gap-3`}>
          
          {/* Top Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-red-950 text-amber-200 hover:text-white border border-amber-400/50 flex items-center justify-center text-sm font-bold transition-colors shadow-md"
            title="关闭特效"
          >
            ✕
          </button>

          {/* Header Title Banner */}
          <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-400/50 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{elementTitle}</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>

          {/* Center Image Container with Xianxia Framed Seal */}
          <div className="relative my-2 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl p-1.5 bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-700 shadow-2xl overflow-hidden group">
            {/* Inner Image Frame */}
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 relative border border-amber-300/80">
              <img
                src={icon || '/src/assets/images/xianxia_fa_bao_1785139383923.jpg'}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform transition-transform duration-1000 scale-105 group-hover:scale-115"
              />

              {/* Xianxia Seal Stamp Banner */}
              {isTalisman && (
                <div className="absolute bottom-1 right-1 bg-red-800/90 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 shadow-md transform rotate-[-6deg]">
                  急急如律令
                </div>
              )}
              {isFuBao && (
                <div className="absolute top-1 right-1 bg-amber-900/90 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-400 shadow-md">
                  敕·镇压
                </div>
              )}
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-300" />
          </div>

          {/* Item Name */}
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wider">
            【{name}】
          </h2>

          {/* Rarity & Element Tags */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md bg-gradient-to-r border ${getRarityBadge(rarity)}`}>
              {rarity}
            </span>
            {element && (
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 border border-cyan-400/50">
                {element}系法则
              </span>
            )}
          </div>

          {/* Effect Description */}
          <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-amber-400/20 max-w-xs">
            {effect || description || '激发天地威能，降伏魑魅魍魉！'}
          </p>

          {/* Click to skip prompt */}
          <span className="text-[10px] text-amber-300/70 font-sans tracking-wide animate-pulse mt-0.5">
            （点击屏幕任意处跳过）
          </span>

        </div>
      </div>
    </div>
  );
};
