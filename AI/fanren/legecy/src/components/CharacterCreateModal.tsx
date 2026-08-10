import React, { useState } from 'react';
import { RootType, PlayerStats } from '../types/game';
import { sound } from '../engine/sound';
import { Sparkles, Award, Shield, UserCheck } from 'lucide-react';

interface CharacterCreateModalProps {
  onStartGame: (name: string, root: RootType) => void;
}

export const CharacterCreateModal: React.FC<CharacterCreateModalProps> = ({ onStartGame }) => {
  const [name, setName] = useState('韩立');
  const [selectedRoot, setSelectedRoot] = useState<RootType>('天灵根');

  const roots: { type: RootType; title: string; desc: string; speedBonus: string }[] = [
    { type: '天灵根', title: '单一天灵根 (木)', desc: '天地独厚，无瓶颈阻碍，修仙速度与灵力纯度当世第一！', speedBonus: '修仙速度 +100%' },
    { type: '变异雷灵根', title: '变异雷灵根 (雷)', desc: '掌控劫天之雷，爆发出惊天动地的辟邪神雷，克制妖邪鬼魔！', speedBonus: '雷系伤害 +80%' },
    { type: '变异冰灵根', title: '变异冰灵根 (冰)', desc: '极寒刺骨，冰封三千里，带有极强穿透减速与防御。', speedBonus: '冰系控制 +60%' },
    { type: '双灵根', title: '双灵根 (金雷)', desc: '金雷相生，锐不可挡，修仙速度较快且战力全面。', speedBonus: '攻击力 +30%' },
    { type: '五灵根', title: '伪灵根 (五行同修)', desc: '五行俱全，早期修炼缓慢，但成道后包罗万象，底蕴浩瀚！', speedBonus: '全属性抗性 +50%' },
  ];

  const handleStart = () => {
    sound.playBreakthrough();
    onStartGame(name, selectedRoot);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121410] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2d5a43] text-[#a1d1b4] text-xs font-bold">
            <Sparkles className="w-4 h-4" /> 凡人修仙传 · 开启修仙之旅
          </div>
          <h1 className="text-3xl font-bold text-[#e9c176]">踏入修仙大道</h1>
          <p className="text-xs text-[#8b938c]">
            从一介山村平庸凡人，凭借掌天瓶与大毅力，斩妖割草，飞升灵界真仙！
          </p>
        </div>

        {/* Input Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#a1d1b4]">道号 / 尊名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#121410] border border-[#414943] text-[#e3e3dc] font-bold focus:border-[#a1d1b4] outline-none"
            placeholder="请输入道号..."
          />
        </div>

        {/* Select Spiritual Root */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#a1d1b4]">天资灵根资质选择</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {roots.map((r) => (
              <button
                key={r.type}
                onClick={() => setSelectedRoot(r.type)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                  selectedRoot === r.type
                    ? 'bg-[#2d5a43]/40 border-[#a1d1b4] shadow-lg'
                    : 'bg-[#1a1c18] border-[#414943] hover:border-[#8b938c]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#e3e3dc] text-sm">{r.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#604403] text-[#dab36a]">
                    {r.speedBonus}
                  </span>
                </div>
                <p className="text-xs text-[#8b938c]">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2d5a43] via-[#a1d1b4] to-[#e9c176] hover:brightness-110 text-[#063824] font-bold text-base shadow-2xl transition-all flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          开启修仙道途 · 割草斩妖！
        </button>
      </div>
    </div>
  );
};
