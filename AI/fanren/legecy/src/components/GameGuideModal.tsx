import React, { useState } from 'react';
import { Award, BookOpen, Sparkles, X, ChevronRight } from 'lucide-react';

interface GameGuideModalProps {
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('06 境界体系');

  const compendiumData: Record<string, { title: string; content: string }[]> = {
    '06 境界体系': [
      { title: '炼气期 (Lv1~20)', content: '修仙之始，积聚天地灵气于丹田。可施展基础火弹术、冰锥术，寿命100~150年。' },
      { title: '筑基期 (Lv20~40)', content: '凝聚道基，可御器飞行，寿元延长至300年。可服用筑基丹破瓶颈。' },
      { title: '结丹期 (Lv40~60)', content: '凝聚金丹，开始培育本命法宝青竹蜂云剑，寿元600年。' },
      { title: '元婴期 (Lv60~80)', content: '破丹成婴，元婴离体瞬移，掌天灭地，寿元超1200年！' },
      { title: '化神期 (Lv80~100)', content: '掌控天地灵气，感应飞升节点，寿元达3000年。' },
      { title: '飞升期 / 灵界 (Lv100+)', content: '渡过九重雷劫，破碎虚空飞升灵界，追求真仙道祖之位！' },
    ],
    '08 五行与变异': [
      { title: '五行相克', content: '金克木，木克土，土克水，水克火，火克金。' },
      { title: '变异属性雷', content: '最高爆发！辟邪神雷克制妖魔、邪煞、极阴邪魂，造成200%额外伤害。' },
      { title: '变异属性冰', content: '极寒封冻，附带强力减速与护甲穿透效果。' },
      { title: '空间与时间', content: '掌天瓶法则蕴含时间之力，可万倍催熟天材地宝！' },
    ],
    '17 本命飞剑': [
      { title: '青竹蜂云剑', content: '韩立本命飞剑！由万年金雷竹配合庚金精炼而成，最高可同时操纵 72 柄！' },
      { title: '辟邪神雷', content: '万年金雷竹自带天劫神雷，克制一切魔煞邪魂！' },
      { title: '青竹剑阵', content: '祭出12柄以上飞剑组成绝杀剑阵，万千剑影绞杀全屏敌寇！' },
    ],
    '18 灵兽与真灵': [
      { title: '啼魂兽', content: '专克鬼道魔煞，吐出吸魂绿光，吞噬魔气后可变身巨猿！' },
      { title: '噬金虫群', content: '无物不噬，群体作战，进化后刀枪不入，成群割草力极强。' },
      { title: '深渊墨蛟', content: '血色禁地收服的妖蛟，龙威震慑敌寇。' },
      { title: '银月', content: '灵界九尾天狐器灵，天仙附体，战力无双。' },
    ],
    '22 丹药与灵草': [
      { title: '掌天瓶', content: '自动凝结参天绿液，快速催熟千年/万年灵草主药。' },
      { title: '万年金雷竹', content: '三大神木之一，辟邪神雷载体，炼剑必需。' },
      { title: '筑基丹 / 结婴丹', content: '突破境界 bottleneck 必需的保命仙丹。' },
    ],
    '33 秘境与飞升': [
      { title: '太南谷集市', content: '散修交易法器与灵草之地。' },
      { title: '血色禁地', content: '黄枫谷试炼秘境，产出三大突破主药。' },
      { title: '虚天殿秘境', content: '乱星海第一至宝虚天鼎所在地！' },
      { title: '灵界天渊城', content: '飞升成功后探索的灵界核心雄城！' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e201c] border border-[#a1d1b4]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#414943] bg-[#121410]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#e9c176]" />
            <h2 className="text-xl font-bold text-[#e9c176]">凡人修仙全景百科全书 (34大元素图鉴)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b938c] hover:text-white hover:bg-[#292b26]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Categories */}
          <div className="space-y-2">
            {Object.keys(compendiumData).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full p-3 rounded-xl border text-left transition-all font-bold text-xs ${
                  activeCategory === cat
                    ? 'bg-[#2d5a43] text-[#a1d1b4] border-[#a1d1b4]'
                    : 'bg-[#1a1c18] text-[#8b938c] border-[#414943] hover:text-[#e3e3dc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Content Details */}
          <div className="md:col-span-2 space-y-4">
            {compendiumData[activeCategory]?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#1a1c18] border border-[#414943] space-y-1.5">
                <h4 className="font-bold text-[#e3e3dc] text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#a1d1b4]" />
                  {item.title}
                </h4>
                <p className="text-xs text-[#8b938c] leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
