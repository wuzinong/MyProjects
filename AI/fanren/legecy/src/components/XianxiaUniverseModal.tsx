import React, { useState } from 'react';
import { 
  PlayerStats, FlyingSword, Spell, Pet, GameItem, 
  CharacterOption, ElementInfo, Talisman, FuBao, 
  CultivationManual, AttackEffectType 
} from '../types/game';
import { 
  CHARACTERS_20, FLYING_SWORDS_20, SPELLS_20, ELEMENTS_20, 
  PETS_20, TALISMANS_20, FUBAO_20, MANUALS_20, ATTACK_FX_20 
} from '../data/gameData';
import { getResourceImage } from '../utils/aiImageStore';
import { 
  X, User, Shield, Zap, Sparkles, Feather, BookOpen, 
  Scroll, Flame, Eye, CheckCircle2, RefreshCw, Wand2, Star
} from 'lucide-react';

interface XianxiaUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerStats;
  spells: Spell[];
  flyingSwords: FlyingSword[];
  pets: Pet[];
  onSelectCharacter: (char: CharacterOption) => void;
  onSelectEffectFx: (fxKey: AttackEffectType) => void;
  onEquipSword: (sword: FlyingSword) => void;
  onEquipPet: (pet: Pet) => void;
  onUnlockSpell: (spellId: string) => void;
  onUseTalisman: (talisman: Talisman) => void;
  onUseFuBao: (fubao: FuBao) => void;
  onStudyManual: (manual: CultivationManual) => void;
}

export const XianxiaUniverseModal: React.FC<XianxiaUniverseModalProps> = ({
  isOpen,
  onClose,
  player,
  spells,
  flyingSwords,
  pets,
  onSelectCharacter,
  onSelectEffectFx,
  onEquipSword,
  onEquipPet,
  onUnlockSpell,
  onUseTalisman,
  onUseFuBao,
  onStudyManual,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'characters' | 'treasures' | 'spells' | 'elements' | 'pets' | 'talismans' | 'fubao' | 'manuals' | 'fx'
  >('characters');

  if (!isOpen) return null;

  const categories = [
    { id: 'characters', label: '人物 (20种)', icon: User, count: CHARACTERS_20.length },
    { id: 'treasures', label: '法器/法宝 (20种)', icon: Shield, count: FLYING_SWORDS_20.length },
    { id: 'spells', label: '法术/神通 (20种)', icon: Zap, count: SPELLS_20.length },
    { id: 'elements', label: '五行/法则 (20种)', icon: Flame, count: ELEMENTS_20.length },
    { id: 'pets', label: '灵宠/奇兽 (20种)', icon: Feather, count: PETS_20.length },
    { id: 'talismans', label: '符箓 (20种)', icon: Scroll, count: TALISMANS_20.length },
    { id: 'fubao', label: '符宝 (20种)', icon: Wand2, count: FUBAO_20.length },
    { id: 'manuals', label: '功法/典籍 (20种)', icon: BookOpen, count: MANUALS_20.length },
    { id: 'fx', label: '攻击特效 (20种)', icon: Sparkles, count: ATTACK_FX_20.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 bg-clip-text text-transparent font-serif">
                凡人修仙传 · 百科至宝典集
              </h2>
              <p className="text-xs text-slate-400">
                包含 人物、法器、法术、五行、灵宠、符箓、符宝、功法、攻击特效 各20种全套典藏
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* 1. 人物 (20种) */}
          {activeCategory === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHARACTERS_20.map((char) => {
                const isCurrent = player.name === char.name;
                return (
                  <div
                    key={char.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-amber-300">{char.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {char.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{char.identity}</p>
                      </div>
                      <span className="text-xs font-mono text-amber-400">{char.root}</span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 line-clamp-2">{char.description}</p>

                    <div className="bg-slate-900/80 p-2 rounded-lg text-xs space-y-1 mb-3 border border-slate-800">
                      <div className="text-emerald-400 font-medium">✨ 特性: {char.specialTrait}</div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>攻击加成: +{char.atkBonus}</span>
                        <span>移速倍率: x{char.speedBonus}</span>
                      </div>
                      <div className="text-amber-400/80 text-[11px]">专属法宝: {char.defaultWeapon}</div>
                    </div>

                    <button
                      onClick={() => onSelectCharacter(char)}
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-600/40 cursor-default'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md'
                      }`}
                    >
                      {isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>{isCurrent ? '当前入圣角色' : '替换入圣'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. 法器/法宝 (20种) */}
          {activeCategory === 'treasures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FLYING_SWORDS_20.map((sw) => {
                const isEquipped = flyingSwords.some((s) => s.id === sw.id);
                return (
                  <div
                    key={sw.id}
                    className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-amber-300 text-sm">{sw.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                        {sw.rarity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{sw.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg mb-3 text-slate-400 border border-slate-800">
                      <div>属性: <span className="text-amber-400">{sw.element}</span></div>
                      <div>材质: <span className="text-slate-200">{sw.material}</span></div>
                      <div>攻击: <span className="text-emerald-400">+{sw.atk}</span></div>
                      <div>攻速: <span className="text-cyan-400">{sw.speed}</span></div>
                      <div className="col-span-2 text-amber-300">绝杀: {sw.specialSkill}</div>
                    </div>

                    <button
                      onClick={() => onEquipSword(sw)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                        isEquipped
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-600/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isEquipped ? '已御使在阵' : '装备法宝'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. 法术/神通 (20种) */}
          {activeCategory === 'spells' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPELLS_20.map((sp) => {
                const currentSp = spells.find((s) => s.id === sp.id) || sp;
                return (
                  <div key={sp.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-cyan-300 text-sm">{sp.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {sp.type} · {sp.element}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{sp.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg mb-3 text-slate-400">
                      <div>基础伤害: <span className="text-emerald-400">{sp.damage}</span></div>
                      <div>灵力消耗: <span className="text-cyan-400">{sp.mpCost}</span></div>
                      <div>冷却时间: <span className="text-amber-400">{sp.cooldown}s</span></div>
                      <div>范围: <span className="text-purple-400">{sp.area}</span></div>
                    </div>

                    <button
                      onClick={() => onUnlockSpell(sp.id)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                        currentSp.unlocked
                          ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/40'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {currentSp.unlocked ? '神通已研习' : '感应解锁绝招'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. 五行/法则 (20种) */}
          {activeCategory === 'elements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {ELEMENTS_20.map((el, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between"
                  style={{ borderColor: `${el.color}40` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base" style={{ color: el.color }}>
                        {el.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border text-slate-300">
                        克制: {el.counterTarget}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{el.description}</p>
                  </div>
                  <div className="mt-3 text-[11px] text-emerald-400 font-mono">
                    克制伤害倍率: x{el.damageMultiplier}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. 灵宠/奇兽 (20种) */}
          {activeCategory === 'pets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PETS_20.map((pt) => {
                const currentPet = pets.find((p) => p.id === pt.id) || pt;
                return (
                  <div key={pt.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-emerald-300 text-sm">{pt.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {pt.type} · {pt.element}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{pt.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg mb-3 text-slate-400">
                      <div>攻击: <span className="text-emerald-400">+{pt.atk}</span></div>
                      <div>气血: <span className="text-red-400">+{pt.maxHp}</span></div>
                      <div>阶段: <span className="text-amber-300">{pt.evolutionStage}</span></div>
                      <div>绝技: <span className="text-cyan-300">{pt.skills.join(', ')}</span></div>
                    </div>

                    <button
                      onClick={() => onEquipPet(currentPet)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                        currentPet.isActive
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {currentPet.isActive ? '当前随行灵宠' : '召唤灵宠跟随'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 6. 符箓 (20种) */}
          {activeCategory === 'talismans' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TALISMANS_20.map((tal) => (
                <div key={tal.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-amber-300 text-sm">{tal.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      {tal.grade} · {tal.element}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{tal.description}</p>

                  <div className="bg-slate-900/80 p-2 rounded-lg text-xs space-y-1 mb-3 text-slate-300">
                    <div className="text-emerald-400">效应: {tal.effect}</div>
                    <div className="text-slate-400 text-[11px]">持续时间: {tal.duration} 秒</div>
                  </div>

                  <button
                    onClick={() => onUseTalisman(tal)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
                  >
                    使用符箓
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 7. 符宝 (20种) */}
          {activeCategory === 'fubao' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUBAO_20.map((fb) => (
                <div key={fb.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-purple-300 text-sm">{fb.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                      {fb.element}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{fb.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg mb-3 text-slate-400">
                    <div>威能源自: <span className="text-amber-300">{fb.sourceTreasure}</span></div>
                    <div>爆破伤害: <span className="text-red-400">+{fb.burstDamage}</span></div>
                    <div className="col-span-2 text-emerald-400">特效: {fb.specialEffect}</div>
                  </div>

                  <button
                    onClick={() => onUseFuBao(fb)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition"
                  >
                    激发符宝威能
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 8. 功法/典籍 (20种) */}
          {activeCategory === 'manuals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MANUALS_20.map((mn) => (
                <div key={mn.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-teal-300 text-sm">{mn.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
                      {mn.grade} · {mn.element}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{mn.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg mb-3 text-slate-400">
                    <div>创始人: <span className="text-amber-300">{mn.creator}</span></div>
                    <div>最高层数: <span className="text-cyan-300">{mn.maxLayer}层</span></div>
                    <div>被动攻击: <span className="text-emerald-400">+{mn.passiveAtk}</span></div>
                    <div>被动护甲: <span className="text-blue-400">+{mn.passiveDef}</span></div>
                  </div>

                  <button
                    onClick={() => onStudyManual(mn)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition"
                  >
                    领悟玄功典籍
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 9. 攻击特效 (20种) */}
          {activeCategory === 'fx' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ATTACK_FX_20.map((fx) => {
                const isSelected = player.selectedEffectFx === fx.key;
                return (
                  <div
                    key={fx.key}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm" style={{ color: fx.color }}>
                        {fx.name}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          生效中
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{fx.description}</p>

                    <button
                      onClick={() => onSelectEffectFx(fx.key)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-600/40 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSelected ? '已装备招式特效' : '装备招式特效'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div>凡人修仙传 · 20x9 大圆满架构模式已全部就位</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            返回游戏
          </button>
        </div>

      </div>
    </div>
  );
};
