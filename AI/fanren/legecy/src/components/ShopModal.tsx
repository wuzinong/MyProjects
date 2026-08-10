import React, { useState } from 'react';
import { GameItem, PlayerStats } from '../types/game';
import { Store, Coins, Package, X, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { sound } from '../engine/sound';
import { SpiritStoneChart, StoneRecord } from './SpiritStoneChart';
import { getResourceImage, handleImageError } from '../utils/aiImageStore';

interface ShopModalProps {
  player: PlayerStats;
  inventory: GameItem[];
  stoneHistory?: StoneRecord[];
  onBuy: (item: GameItem, cost: number) => void;
  onSell: (item: GameItem, price: number) => void;
  onClose: () => void;
}

const SHOP_ITEMS: GameItem[] = [
  { id: 'shop_pill_1', name: '黄龙丹', category: 'pill', rarity: '中品法器', description: '低阶修士精进法力的丹药', effect: '增加少量气血和法力', stats: { hp: 200, mp: 100 }, quantity: 1 },
  { id: 'shop_pill_2', name: '金髓丸', category: 'pill', rarity: '上品法器', description: '固本培元，药力深厚', effect: '增加较多气血和法力', stats: { hp: 500, mp: 300 }, quantity: 1 },
  { id: 'shop_herb_1', name: '霓裳草', category: 'herb', rarity: '上品法器', description: '散发奇香的灵草，可诱妖', effect: '炼丹材料', quantity: 1 },
  { id: 'shop_material_1', name: '玄铁', category: 'material', rarity: '中品法器', description: '炼器基础材料', effect: '炼器可用', quantity: 1 },
  { id: 'shop_talisman_1', name: '高阶火弹符', category: 'talisman', rarity: '上品法器', description: '封印高阶火弹术的符箓', effect: '临时增加攻击', stats: { atk: 50 }, quantity: 1 },
  { id: 'shop_fubao_1', name: '平天尺符宝', category: 'fubao', rarity: '极品法器', description: '元婴大能法宝平天尺的一缕分光符宝', effect: '祭出镇压诸天', stats: { atk: 120 }, quantity: 1 },
];

const ITEM_PRICES: Record<string, number> = {
  '黄龙丹': 20,
  '金髓丸': 80,
  '霓裳草': 150,
  '玄铁': 30,
  '高阶火弹符': 60,
  '平天尺符宝': 300,
};

export const ShopModal: React.FC<ShopModalProps> = ({ player, inventory, stoneHistory = [], onBuy, onSell, onClose }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'chart'>('buy');

  const getSellPrice = (item: GameItem) => {
    let base = ITEM_PRICES[item.name] ? Math.floor(ITEM_PRICES[item.name] * 0.5) : 10;
    if (item.rarity === '上品法器') base += 20;
    if (item.rarity === '极品法器' || item.rarity === '法宝') base += 100;
    if (item.rarity === '通天灵宝' || item.rarity === '玄天灵宝') base += 500;
    return base;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1a1c18] border-2 border-[#414943] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[80vh] sm:h-[600px] overflow-hidden">
        <div className="p-4 border-b border-[#2d5a43]/50 flex items-center justify-between bg-gradient-to-r from-[#1a1c18] via-[#2d5a43]/20 to-[#1a1c18]">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-[#e9c176]" />
            <h2 className="text-xl font-bold text-[#e3e3dc] font-serif tracking-wider">天星城坊市</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#292b26] px-3 py-1 rounded-full border border-[#414943]">
              <Coins className="w-4 h-4 text-[#e9c176]" />
              <span className="text-sm font-bold text-[#e9c176]">{player.spiritStones} 灵石</span>
            </div>
            <button onClick={onClose} className="text-[#a1d1b4] hover:text-[#e3e3dc] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#414943]">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'buy' ? 'bg-[#2d5a43]/30 text-[#a1d1b4] border-b-2 border-[#a1d1b4]' : 'text-[#888] hover:bg-[#292b26]'}`}
          >
            <Store className="w-4 h-4" /> 购买物品
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'sell' ? 'bg-[#2d5a43]/30 text-[#e9c176] border-b-2 border-[#e9c176]' : 'text-[#888] hover:bg-[#292b26]'}`}
          >
            <ArrowRightLeft className="w-4 h-4" /> 出售物品
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chart' ? 'bg-[#2d5a43]/30 text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#888] hover:bg-[#292b26]'}`}
          >
            <TrendingUp className="w-4 h-4" /> 灵石账目曲线
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activeTab === 'buy' && (
            SHOP_ITEMS.map((item) => {
              const price = ITEM_PRICES[item.name] || 50;
              const canAfford = player.spiritStones >= price;
              const itemImg = getResourceImage(item.id, item.icon, item.name, item.category);
              return (
                <div key={item.id} className="bg-[#292b26]/50 border border-[#414943] rounded-xl p-3 flex justify-between items-center hover:bg-[#292b26] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#1a1c18] border border-[#414943] overflow-hidden flex-shrink-0">
                      <img
                        src={itemImg}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, item.name, item.category)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#e3e3dc] text-base">{item.name}</h3>
                      <p className="text-xs text-[#a1d1b4]/70">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canAfford) {
                        sound.playEquip();
                        onBuy(item, price);
                      } else {
                        sound.playError();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-all ${
                      canAfford
                        ? 'bg-emerald-600/80 hover:bg-emerald-500 text-emerald-100 border border-emerald-400/50'
                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    {price}
                  </button>
                </div>
              );
            })
          )}

          {activeTab === 'sell' && (
            inventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <Package className="w-12 h-12 opacity-20" />
                <p>储物袋空空如也...</p>
              </div>
            ) : (
              inventory.map((item, idx) => {
                const sellPrice = getSellPrice(item);
                const itemImg = getResourceImage(item.id, item.icon, item.name, item.category);
                return (
                  <div key={idx} className="bg-[#292b26]/50 border border-[#414943] rounded-xl p-3 flex justify-between items-center hover:bg-[#292b26] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1c18] border border-[#414943] overflow-hidden flex-shrink-0">
                        <img
                          src={itemImg}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, item.name, item.category)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#e3e3dc] text-sm flex items-center gap-2">
                          {item.name}
                          <span className="text-[10px] bg-[#1a1c18] px-1.5 py-0.5 rounded border border-[#414943] text-gray-400">
                            x{item.quantity || 1}
                          </span>
                        </h3>
                        <p className="text-xs text-[#e9c176]/70 truncate max-w-[150px] sm:max-w-xs">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playEquip();
                        onSell(item, sellPrice);
                      }}
                      className="px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 transition-all bg-amber-600/80 hover:bg-amber-500 text-amber-100 border border-amber-400/50"
                    >
                      出售 <Coins className="w-3.5 h-3.5 ml-1" /> {sellPrice}
                    </button>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'chart' && (
            <div className="space-y-3">
              <SpiritStoneChart history={stoneHistory} currentStones={player.spiritStones} />
              
              <div className="bg-[#292b26]/60 border border-[#414943] rounded-xl p-3 space-y-2">
                <h4 className="text-xs font-bold text-[#e9c176]">📜 账目历史明细</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {stoneHistory.length === 0 ? (
                    <p className="text-xs text-gray-500">暂无灵石流水记录...</p>
                  ) : (
                    [...stoneHistory].reverse().map((rec, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 bg-[#1a1c18] rounded border border-[#414943]/50">
                        <span className="text-gray-400">{rec.timestamp} - {rec.source}</span>
                        <span className={`font-bold ${rec.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {rec.change >= 0 ? `+${rec.change}` : rec.change} 灵石 (余额: {rec.stones})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
