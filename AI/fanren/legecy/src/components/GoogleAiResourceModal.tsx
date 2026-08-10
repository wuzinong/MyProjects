import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, CheckSquare, Square, Zap, Sliders, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { 
  getAllGameResources, 
  generateImageForResource, 
  ResourceInfo, 
  getAiImageMap,
  getResourceImage
} from '../utils/aiImageStore';

interface GoogleAiResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAiResourceModal: React.FC<GoogleAiResourceModalProps> = ({ isOpen, onClose }) => {
  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  
  // Selection state for checking items
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<string>>(new Set());
  
  // Custom Prompt refinement
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  // Auto mode toggle
  const [autoModeEnabled, setAutoModeEnabled] = useState<boolean>(true);

  // Batch progress tracking
  const [batchProgress, setBatchProgress] = useState<{ active: boolean; currentName: string; done: number; total: number; errorCount: number }>({
    active: false,
    currentName: '',
    done: 0,
    total: 0,
    errorCount: 0,
  });

  useEffect(() => {
    if (isOpen) {
      const allRes = getAllGameResources();
      setResources(allRes);
      setImageMap(getAiImageMap());
      // Default select all currently visible resources if empty
      if (selectedResourceIds.size === 0) {
        setSelectedResourceIds(new Set(allRes.slice(0, 12).map(r => r.id)));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: '全部资源 (190+)' },
    { key: 'swords', label: '本命飞剑/法宝 (20)' },
    { key: 'items', label: '灵物丹药 (20)' },
    { key: 'fubao', label: '上古符宝 (20)' },
    { key: 'talisman', label: '神仙符箓 (20)' },
    { key: 'spells', label: '法术/神通 (20)' },
    { key: 'pets', label: '灵兽/真灵 (20)' },
    { key: 'manuals', label: '功法/典籍 (20)' },
    { key: 'elements', label: '五行法则 (20)' },
    { key: 'fx', label: '神通特效 (20)' },
    { key: 'sects', label: '仙门宗派 (10)' },
    { key: 'zones', label: '秘境古迹 (10)' },
    { key: 'characters', label: '经典角色 (10)' },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  const isAllFilteredSelected = filteredResources.length > 0 && filteredResources.every(r => selectedResourceIds.has(r.id));

  const toggleSelectAllFiltered = () => {
    const next = new Set(selectedResourceIds);
    if (isAllFilteredSelected) {
      filteredResources.forEach(r => next.delete(r.id));
    } else {
      filteredResources.forEach(r => next.add(r.id));
    }
    setSelectedResourceIds(next);
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedResourceIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedResourceIds(next);
  };

  const handleSingleGenerate = async (resource: ResourceInfo) => {
    setLoadingMap(prev => ({ ...prev, [resource.id]: true }));
    try {
      await generateImageForResource(resource, customPrompt);
      setImageMap(getAiImageMap());
    } catch (err: any) {
      alert(`Google AI 图像生成提示: ${err.message || '生成失败'}`);
    } finally {
      setLoadingMap(prev => ({ ...prev, [resource.id]: false }));
    }
  };

  const handleGenerateSelected = async () => {
    if (batchProgress.active) return;
    
    const targetList = resources.filter(r => selectedResourceIds.has(r.id));
    if (targetList.length === 0) {
      alert('请先在下方勾选至少一个想要重新生成 AI 图元的修仙资源！');
      return;
    }

    if (!confirm(`是否确认调用 Google AI 为已勾选的 ${targetList.length} 个修仙资源重新绘制精美灵象图元？`)) {
      return;
    }

    setBatchProgress({
      active: true,
      currentName: targetList[0].name,
      done: 0,
      total: targetList.length,
      errorCount: 0,
    });

    let done = 0;
    let errors = 0;

    for (const resItem of targetList) {
      setBatchProgress(prev => ({ ...prev, currentName: resItem.name, done, errorCount: errors }));
      setLoadingMap(prev => ({ ...prev, [resItem.id]: true }));

      try {
        await generateImageForResource(resItem, customPrompt);
        setImageMap(getAiImageMap());
      } catch (e) {
        console.error(`Error generating image for ${resItem.name}:`, e);
        errors++;
      } finally {
        setLoadingMap(prev => ({ ...prev, [resItem.id]: false }));
        done++;
      }
    }

    setBatchProgress({
      active: false,
      currentName: '勾选资源 AI 重新生成完成！',
      done: targetList.length,
      total: targetList.length,
      errorCount: errors,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-7xl h-[94vh] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-500/50 rounded-xl text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent flex items-center gap-2">
                <span>Google AI 修仙资源重绘中心</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  支持勾选独立重绘
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                自由勾选要重新生成的法宝、武器、灵宠、丹药、技能图元，一键调用 Google AI 生成独一无二的古风玄幻画卷
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Status Bar */}
        {batchProgress.active && (
          <div className="bg-amber-950/80 border-b border-amber-500/40 px-6 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-300">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Google AI 正在重新生成灵象: <strong className="text-white">{batchProgress.currentName}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-amber-500/30">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                />
              </div>
              <span className="text-amber-200 font-mono font-bold">
                {batchProgress.done} / {batchProgress.total} ({Math.round((batchProgress.done / batchProgress.total) * 100)}%)
              </span>
            </div>
          </div>
        )}

        {/* Custom Prompt & Selection Control Toolbar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-3">
          {/* Top Row: Style Prompt Input & Global Settings */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-200 shrink-0">AI 风格微调:</span>
              <input 
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="（可选）输入 AI 绘图词微调，例如：水墨国风、金光炫彩、上古神符、九天玄火..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-xs text-slate-100 rounded-lg px-3 py-1.5 outline-none transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 transition-colors">
              <input 
                type="checkbox"
                checked={autoModeEnabled}
                onChange={(e) => setAutoModeEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>开启 AI 自动联动重绘机制</span>
            </label>
          </div>

          {/* Category Tabs & Selection Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Checkbox Select Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleSelectAllFiltered}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                {isAllFilteredSelected ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{isAllFilteredSelected ? '取消全选本页' : '全选本页资源'}</span>
              </button>

              <button
                onClick={handleGenerateSelected}
                disabled={batchProgress.active || selectedResourceIds.size === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>勾选 AI 重新生成资源 ({selectedResourceIds.size})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map(res => {
            const currentImg = getResourceImage(res.id, res.icon, res.name, res.category);
            const isHasCustomAiImage = !!imageMap[res.id];
            const isLoading = !!loadingMap[res.id];
            const isChecked = selectedResourceIds.has(res.id);

            return (
              <div 
                key={res.id}
                onClick={() => toggleSelectOne(res.id)}
                className={`group relative bg-slate-950/80 border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  isChecked 
                    ? 'border-amber-500 shadow-xl shadow-amber-950/40 bg-slate-900/90' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Checkbox & Category Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleSelectOne(res.id); }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-amber-300">
                        {isChecked ? '已勾选重绘' : '勾选重绘'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {res.element && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                          {res.element}
                        </span>
                      )}
                      {res.rarity && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/50 font-semibold">
                          {res.rarity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image Display Container */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80 mb-3 group-hover:border-amber-500/30 transition-colors flex items-center justify-center">
                    {currentImg ? (
                      <img 
                        src={currentImg} 
                        alt={res.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-slate-600">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-xs">未生成灵象</span>
                      </div>
                    )}

                    {/* AI Badge Overlay */}
                    {isHasCustomAiImage && (
                      <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/40 text-[10px] text-amber-300 flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Google AI 灵象</span>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-amber-400 z-10">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                        <span className="text-xs font-semibold">Google AI 实时重绘中...</span>
                      </div>
                    )}
                  </div>

                  {/* Resource Info */}
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors mb-1">
                    {res.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {res.description}
                  </p>
                  {res.backgroundStory && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 border-l-2 border-amber-500/30 pl-2 py-0.5 bg-slate-900/40 rounded-r mb-3">
                      {res.backgroundStory}
                    </p>
                  )}
                </div>

                {/* Single Generate Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSingleGenerate(res); }}
                  disabled={isLoading || batchProgress.active}
                  className={`w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isHasCustomAiImage
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  } disabled:opacity-50`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHasCustomAiImage ? 'Google AI 重新生成' : 'Google AI 生成灵象'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
