import React, { useState, useEffect, useReducer } from 'react';
import { PlayerStats, RealmInfo, MapZone, Spell, FlyingSword, Pet, Sect, Quest, GameItem, RootType } from './types/game';
import { REALMS, MAP_ZONES, INITIAL_SPELLS, INITIAL_FLYING_SWORDS, INITIAL_PETS, SECTS, INITIAL_QUESTS, INITIAL_INVENTORY } from './data/gameData';
import { gameReducer, initialGameState } from './store/gameReducer';
import { GameCanvas } from './engine/GameCanvas';
import { HUD } from './components/HUD';
import { ShopModal } from './components/ShopModal';
import { CultivationModal } from './components/CultivationModal';
import { InventoryModal } from './components/InventoryModal';
import { HomeModal } from './components/HomeModal';
import { FlyingSwordsModal } from './components/FlyingSwordsModal';
import { PetsModal } from './components/PetsModal';
import { SectModal } from './components/SectModal';
import { SecretRealmModal } from './components/SecretRealmModal';
import { StoryModal } from './components/StoryModal';
import { GameGuideModal } from './components/GameGuideModal';
import { CharacterCreateModal } from './components/CharacterCreateModal';
import { XianxiaUniverseModal } from './components/XianxiaUniverseModal';
import { GoogleAiResourceModal } from './components/GoogleAiResourceModal';
import { TribulationModal } from './components/TribulationModal';
import { CharacterOption, Talisman, FuBao, CultivationManual, AttackEffectType, GardenSlot } from './types/game';
import { sound } from './engine/sound';
import { Sparkles } from 'lucide-react';
import { StoneRecord } from './components/SpiritStoneChart';
import { ItemActivationOverlay, ActivatedItemInfo } from './components/ItemActivationOverlay';
import { getItemExactImage } from './utils/aiImageStore';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  // Active Item Usage Effect Overlay State
  const [activatedItem, setActivatedItem] = useState<ActivatedItemInfo | null>(null);

  // Spirit Stone History Log for D3 Chart
  const [stoneHistory, setStoneHistory] = useState<StoneRecord[]>([
    { timestamp: '12:00:00', stones: 200, change: +200, source: '宗门散人初始灵石' },
    { timestamp: '12:01:30', stones: 250, change: +50, source: '击杀墨蛟妖兽' },
    { timestamp: '12:03:00', stones: 300, change: +50, source: '完成修仙初阶试炼' },
  ]);

  const recordStoneChange = (change: number, source: string, baseStones?: number) => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setStoneHistory((prev) => {
      const lastStones = prev.length > 0 ? prev[prev.length - 1].stones : 200;
      const currentStones = baseStones !== undefined ? baseStones + change : lastStones + change;
      const newRecord: StoneRecord = {
        timestamp: timeStr,
        stones: Math.max(0, currentStones),
        change,
        source,
      };
      return [...prev.slice(-25), newRecord];
    });
  };

  // Active Talisman state for HUD/FX
  const [activeTalismanName, setActiveTalismanName] = useState<string>('太乙避劫符');

  // Unified Game State using useReducer
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Deconstruct state for local variables
  const { player, spells, flyingSwords, pets, mapZones, currentMap, quests, inventory, garden, sects } = gameState;

  // Polyfills for old setX functions to avoid massive refactor
  const setPlayer = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_PLAYER', updater });
    else dispatch({ type: 'SET_PLAYER', payload: updater });
  };
  const setSpells = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_SPELLS', updater });
    else dispatch({ type: 'SET_SPELLS', payload: updater });
  };
  const setFlyingSwords = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_FLYING_SWORDS', updater });
    else dispatch({ type: 'SET_FLYING_SWORDS', payload: updater });
  };
  const setPets = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_PETS', updater });
    else dispatch({ type: 'SET_PETS', payload: updater });
  };
  const setMapZones = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_MAP_ZONES', updater });
    else dispatch({ type: 'SET_MAP_ZONES', payload: updater });
  };
  const setCurrentMap = (payload: any) => dispatch({ type: 'SET_CURRENT_MAP', payload });
  const setQuests = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_QUESTS', updater });
    else dispatch({ type: 'SET_QUESTS', payload: updater });
  };
  const setInventory = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_INVENTORY', updater });
    else dispatch({ type: 'SET_INVENTORY', payload: updater });
  };
  const setGarden = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_GARDEN', updater });
    else dispatch({ type: 'SET_GARDEN', payload: updater });
  };
  const setSects = (updater: any) => {
    if (typeof updater === 'function') dispatch({ type: 'UPDATE_SECTS', updater });
    else dispatch({ type: 'SET_SECTS', payload: updater });
  };

  // Active Modal state
  const [activeModal, setActiveModal] = useState<
    'none' | 'cultivation' | 'inventory' | 'swords' | 'pets' | 'sect' | 'story' | 'secretRealm' | 'guide' | 'universe' | 'aiGallery' | 'tribulation' | 'buildingEncounter'
  >('none');

  const [encounteredBuilding, setEncounteredBuilding] = useState<{type: number, name: string} | null>(null);

  // Handle Samsara Restart (渡劫失败 - 轮回重开)
  const handleRestartGame = () => {
    setHasStarted(false);
    dispatch({ type: 'RESTART_GAME' });
    setActiveModal('none');
  };

  // Handle Breakthrough Success (渡劫成功 - 脱胎换骨)
  const handleSuccessBreakthrough = () => {
    setActiveModal('none');
    const nextRealmMap: Record<string, string> = {
      'REALM001': 'REALM002', // 练气 -> 筑基
      'REALM002': 'REALM003', // 筑基 -> 结丹
      'REALM003': 'REALM004', // 结丹 -> 元婴
      'REALM004': 'REALM005', // 元婴 -> 化神
      'REALM005': 'REALM006', // 化神 -> 炼虚
      'REALM006': 'REALM007', // 炼虚 -> 合体
      'REALM007': 'REALM008', // 合体 -> 大乘
      'REALM008': 'REALM009', // 大乘 -> 渡劫
      'REALM009': 'REALM010', // 渡劫 -> 飞升
    };

    const nextRealmId = nextRealmMap[player.realmId] || 'REALM002';
    const nextRealm = REALMS[nextRealmId] || REALMS['REALM002'];

    setPlayer((prev) => ({
      ...prev,
      realmId: nextRealmId,
      realmName: nextRealm.name,
      level: prev.level + 1,
      hp: Math.round(prev.maxHp * 1.5),
      maxHp: Math.round(prev.maxHp * 1.5),
      mp: Math.round(prev.maxMp * 1.5),
      maxMp: Math.round(prev.maxMp * 1.5),
      atk: Math.round(prev.atk * 1.4),
      def: Math.round(prev.def * 1.4),
      exp: 0,
      maxExp: Math.round(prev.maxExp * 2.2),
      isBottleneck: false,
      divineSense: prev.divineSense + 1,
      spiritStones: prev.spiritStones + 500,
    }));

    sound.playLevelUp();
  };

  // Green Vial automatic liquid accumulation over time
  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      setPlayer((prev) => ({
        ...prev,
        greenVialLiquids: prev.greenVialLiquids + 1,
        // Passive Qi Regen
        mp: Math.min(prev.maxMp, prev.mp + prev.qiRegen),
      }));
    }, 15000); // 1 drop every 15 sec
    return () => clearInterval(interval);
  }, [hasStarted]);

  // Handle Character Creation
  const handleStartGame = (name: string, root: RootType) => {
    setPlayer((prev) => ({
      ...prev,
      name: name || '韩立',
      root: root,
      title: root === '天灵根' ? '天道骄子' : root.includes('雷') ? '狂雷剑客' : '凡人隐士',
    }));
    setHasStarted(true);
  };

  // Handle Enemy Kills & Quest Progress
  const handleEnemyKilled = (enemyName: string, exp: number, stones: number, cores: number) => {
    let shouldTriggerTribulation = false;
    
    if (stones > 0) {
      recordStoneChange(stones, `击杀妖兽【${enemyName}】`, player.spiritStones);
    }

    setPlayer((prev) => {
      let currentExp = prev.exp + exp;
      let currentLevel = prev.level;
      let currentMaxExp = prev.maxExp;
      let bottleneck = prev.isBottleneck;

      if (currentExp >= currentMaxExp) {
        if (!bottleneck) {
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
            bottleneck = true;
            currentExp = currentMaxExp;
            shouldTriggerTribulation = true;
          } else {
            currentLevel += 1;
            currentExp = currentExp - currentMaxExp;
            currentMaxExp = Math.round(currentMaxExp * 1.5);
          }
        } else {
          currentExp = currentMaxExp;
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
            shouldTriggerTribulation = true;
          }
        }
      }

      return {
        ...prev,
        exp: currentExp,
        level: currentLevel,
        maxExp: currentMaxExp,
        isBottleneck: bottleneck,
        spiritStones: prev.spiritStones + stones,
        demonCores: prev.demonCores + cores,
        killCount: (prev.killCount || 0) + 1,
        hp: Math.min(prev.maxHp, prev.hp + 5), // Kill leech HP
      };
    });

    if (shouldTriggerTribulation) {
      setActiveModal('tribulation');
    }

    // Update quest targets
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.active && !q.completed && (q.targetEnemy === enemyName || enemyName.includes('妖'))) {
          const newCnt = (q.currentCount || 0) + 1;
          const isDone = newCnt >= (q.targetCount || 1);
          return {
            ...q,
            currentCount: newCnt,
          };
        }
        return q;
      })
    );
  };

  // Handle Item Collection
  const handleItemCollected = (item: GameItem) => {
    setInventory((prev) => [...prev, item]);
  };

  // Handle Boss Defeated
  const handleBossDefeated = (mapId: string) => {
    // 1. Unlock next map
    setMapZones((prev) =>
      prev.map((zone, idx) => {
        if (zone.id === mapId && idx + 1 < prev.length) {
          return zone;
        }
        if (prev[idx - 1]?.id === mapId) {
          return { ...zone, unlocked: true };
        }
        return zone;
      })
    );

    // 2. Progressive Pet Discovery: unlock first locked pet
    let newlyUnlockedPetName = '';
    setPets((prev) => {
      let unlockedOne = false;
      return prev.map((p) => {
        if (!p.unlocked && !unlockedOne) {
          unlockedOne = true;
          newlyUnlockedPetName = p.name;
          return { ...p, unlocked: true, isActive: true }; // Auto set active if no active pet
        }
        return p;
      });
    });

    // 3. Progressive Flying Sword Unlock: unlock first locked sword
    let newlyUnlockedSwordName = '';
    let newlyUnlockedSwordElement = '';
    setFlyingSwords((prev) => {
      let unlockedOne = false;
      return prev.map((s) => {
        if (!s.unlocked && !unlockedOne) {
          unlockedOne = true;
          newlyUnlockedSwordName = s.name;
          newlyUnlockedSwordElement = s.element;
          return { ...s, unlocked: true, isEquipped: true };
        }
        return s;
      });
    });

    // 4. Update equipped sword elements automatically
    if (newlyUnlockedSwordElement) {
      setPlayer((prev) => {
        const currentElements = prev.equippedSwordElements || ['木'];
        const nextElements = Array.from(new Set([...currentElements, newlyUnlockedSwordElement]));
        return {
          ...prev,
          spiritStones: prev.spiritStones + 3000,
          demonCores: prev.demonCores + 10,
          equippedSwordElements: nextElements,
        };
      });
    }

    // 5. Sound & Visual Alert Overlay
    sound.playBreakthrough();
  };

  const handleEncounterBuilding = (building: { type: number, name: string }) => {
    if (!currentMap.id.startsWith('BLD_') && activeModal === 'none') {
       setEncounteredBuilding(building);
       setActiveModal('buildingEncounter');
    }
  };

  const handleEnterBuilding = () => {
    if (!encounteredBuilding) return;
    
    const bType = encounteredBuilding.type;
    
    // 大幅度增加BOSS血量以及攻击力
    const baseBossHp = Math.max(100000, player.maxHp * 45); 
    const baseBossAtk = Math.max(5000, player.atk * 18);
    
    let bossName = '秘境守护灵';
    let monsterTypes = ['秘境幻影', '守护灵兽'];
    
    if (bType === 1) bossName = '太一宗主分神';
    else if (bType === 2) bossName = '万年古松妖王';
    else if (bType === 3) bossName = '雷光竹海巨魔';
    else if (bType === 4) bossName = '庚金山岳巨怪';
    else if (bType === 5) bossName = '九曲仙灵分身';
    else if (bType === 6) bossName = '悬浮岛主亡灵';
    else if (bType === 7) bossName = '深壑云雾蛟龙';
    else if (bType === 8) bossName = '镇魔塔上古巨魔';

    const newMap: MapZone = {
      id: `BLD_${bType}_${Date.now()}`,
      name: encounteredBuilding.name + '秘境',
      recommendedRealm: '巅峰试炼',
      description: `【${encounteredBuilding.name}】内部的专属空间，充满着未知的凶险与无上机缘。`,
      bgColor: '#160d1c',
      monsterTypes,
      bossName,
      bossHp: baseBossHp,
      bossAtk: baseBossAtk,
      drops: ['极品灵石', '玄天果', '万年灵草'],
      unlocked: true,
      isSecretRealm: true
    };
    
    setCurrentMap(newMap);
    setActiveModal('none');
  };

  // Handle Using Pills / Talismans / Items
  
  
  const handleUpgradeCave = () => {
    setPlayer(p => {
      if (p.spiritStones >= 10000) {
        // Just for flavor, consume stones
        return {
          ...p,
          spiritStones: p.spiritStones - 10000
        };
      } else {
        alert('灵石不足，需要10000灵石！');
      }
      return p;
    });
  };

  const handleCultivate = () => {
    setPlayer(p => {
      const level = parseInt(p.realmId.replace('REALM', '')) || 1;
      let tier = 1;
      if (level <= 2) tier = 1;
      else if (level <= 4) tier = 2;
      else if (level <= 7) tier = 3;
      else tier = 4;
      
      const expGain = 50 * tier;
      return {
        ...p,
        exp: Math.min(p.maxExp, p.exp + expGain)
      };
    });
  };

  const handlePlantHerb = (slotId: string, item: GameItem) => {
    setGarden(prev => prev.map(slot => {
      if (slot.id === slotId) {
        if (!item.id) {
          return { ...slot, itemId: '', itemName: '', plantedAt: 0, lastHarvestedAt: 0 };
        }
        return {
          ...slot,
          itemId: item.id,
          itemName: item.name,
          plantedAt: Date.now(),
          lastHarvestedAt: Date.now()
        };
      }
      return slot;
    }));
  };

  const handleHarvestHerb = (slotId: string) => {
    setGarden(prev => prev.map(slot => {
      if (slot.id === slotId && slot.itemId) {
        const timeElapsed = Date.now() - slot.lastHarvestedAt;
        const amount = Math.max(1, Math.floor(timeElapsed / 10000));
        setInventory(inv => {
          const existing = inv.find(i => i.id === slot.itemId || i.name === slot.itemName);
          if (existing) {
            return inv.map(i => i.name === slot.itemName ? { ...i, quantity: (i.quantity || 1) + amount } : i);
          } else {
            const base = INITIAL_INVENTORY.find(i => i.name === slot.itemName);
            if (base) return [...inv, { ...base, quantity: amount }];
            return [...inv, { id: slot.itemId, name: slot.itemName, rarity: '极品法器', category: 'material', description: '药田产出', quantity: amount } as GameItem];
          }
        });
        return { ...slot, lastHarvestedAt: Date.now() };
      }
      return slot;
    }));
  };

  const handleAccelerateGardenPlot = (slotId: string) => {
    if ((player.greenVialLiquids || 0) <= 0) {
      alert('掌天瓶绿液不足！请在斩杀强敌或日常凝聚后使用。');
      return;
    }
    setPlayer(prev => ({
      ...prev,
      greenVialLiquids: Math.max(0, (prev.greenVialLiquids || 0) - 1)
    }));
    sound.playBreakthrough();
    handleHarvestHerb(slotId);
  };

  const handleUseItem = (itemIdOrName: string) => {
    const item = inventory.find((i) => i.id === itemIdOrName || i.name === itemIdOrName);
    if (!item) return;

    if (item.category === 'weapon') {
      setPlayer(prev => {
        // Remove old weapon stats if replacing
        const oldWeapon = prev.equippedWeapon;
        let newAtk = prev.atk;
        if (oldWeapon && oldWeapon.stats?.atk) newAtk -= oldWeapon.stats.atk;
        if (item.stats?.atk) newAtk += item.stats.atk;
        return {
          ...prev,
          atk: newAtk,
          equippedWeapon: item
        };
      });
      // We don't remove weapon from inventory, just equip it.
      sound.playThunder();
      return;
    }

    // Trigger center page item usage animation overlay
    const itemImg = getItemExactImage(item.name, item.category, item.icon);
    setActivatedItem({
      id: item.id,
      name: item.name,
      category: item.category,
      element: item.element,
      icon: itemImg,
      rarity: item.rarity,
      description: item.description,
      effect: item.effect || (item.category === 'pill' ? '增益气血灵力与修仙精气' : '催发至宝，降伏魑魅魍魉'),
      timestamp: Date.now(),
    });

    // Pills give stats permanently, Fubao gives massive burst in GameCanvas, not permanent stats.
    const hpGain = item.stats?.hp || (item.category === 'pill' ? 150 : 0);
    const mpGain = item.stats?.mp || (item.category === 'pill' ? 100 : 0);
    const atkGain = item.category === 'fubao' ? 0 : (item.stats?.atk || 0);
    
    // Determine EXP gain based on pill type
    let expGain = 0;
    if (item.name.includes('黄龙丹')) expGain = 200;
    if (item.name.includes('金髓丸')) expGain = 500;
    if (item.name.includes('聚气散')) expGain = 1000;
    if (item.name.includes('筑基丹')) expGain = 5000;

    let shouldTriggerTribulation = false;

    setPlayer((prev) => {
      let newEffectFx = prev.selectedEffectFx;
      if (item.category === 'fubao') {
        newEffectFx = 'fubao_press_stamp';
      } else if (item.category === 'pill') {
        newEffectFx = 'pill_consume';
      } else if (item.category === 'talisman') {
        newEffectFx = 'talisman_burst_ring';
      }

      let currentExp = prev.exp + expGain;
      let currentLevel = prev.level;
      let currentMaxExp = prev.maxExp;
      let bottleneck = prev.isBottleneck;

      if (expGain > 0 && currentExp >= currentMaxExp) {
        if (!bottleneck) {
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
            bottleneck = true;
            currentExp = currentMaxExp;
            shouldTriggerTribulation = true;
          } else {
            currentLevel += 1;
            currentExp = currentExp - currentMaxExp;
            currentMaxExp = Math.round(currentMaxExp * 1.5);
          }
        } else {
          currentExp = currentMaxExp;
          if ((currentLevel + 1) % 10 === 0 || currentLevel + 1 === 10) {
            shouldTriggerTribulation = true;
          }
        }
      }

      return {
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + hpGain),
        mp: Math.min(prev.maxMp, prev.mp + mpGain),
        atk: prev.atk + atkGain,
        speed: item.name.includes('疾风') ? prev.speed * 1.5 : prev.speed,
        exp: currentExp,
        level: currentLevel,
        maxExp: currentMaxExp,
        isBottleneck: bottleneck,
        selectedEffectFx: newEffectFx,
      };
    });

    // Auto clear canvas effect after 3.0s
    setTimeout(() => {
      setPlayer((prev) => ({ ...prev, selectedEffectFx: null }));
    }, 3000);

    if (shouldTriggerTribulation) {
      setActiveModal('tribulation');
    }

    setInventory((prev) => {
      // Artifacts (fubao) are not consumed
      if (item.category === 'fubao') {
        return prev;
      }
      
      const index = prev.findIndex((i) => i.id === item.id || i.name === item.name);
      if (index === -1) return prev;
      const updated = [...prev];
      if ((updated[index].quantity || 1) > 1) {
        updated[index] = {
          ...updated[index],
          quantity: (updated[index].quantity || 1) - 1,
        };
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });

    sound.playPickup();
  };

  // Handle Herb Added from Green Vial
  const handleAddHerb = (herb: GameItem) => {
    setInventory((prev) => [herb, ...prev]);
  };

  // Handle Refining New Flying Sword
  const handleRefineSword = (swordName: string, material: string) => {
    let unlockedElement = '';
    setFlyingSwords((prev) => {
      let unlockedOne = false;
      return prev.map((s) => {
        if (!s.unlocked && !unlockedOne) {
          unlockedOne = true;
          unlockedElement = s.element;
          return { ...s, unlocked: true, isEquipped: true, count: 12 };
        }
        return {
          ...s,
          count: Math.min(72, s.count + 1),
          atk: s.atk + 15,
        };
      });
    });

    setPlayer((prev) => {
      const currentElements = prev.equippedSwordElements || ['木'];
      const nextElements = unlockedElement ? Array.from(new Set([...currentElements, unlockedElement])) : currentElements;
      return {
        ...prev,
        atk: prev.atk + 35,
        equippedSwordElements: nextElements,
      };
    });
    sound.playThunder();
  };

  // Handle Assembling Bamboo Sword Formation
  const handleAssembleFormation = () => {
    setSpells((prev) =>
      prev.map((s) => (s.name === '青竹蜂云剑阵' ? { ...s, unlocked: true } : s))
    );
    alert('🎉 成功祭出 72 柄青竹蜂云剑！【青竹蜂云剑阵】大神通已解锁，在斩妖割草中自动绝杀！');
  };

  // Handle Feeding Pet with level up & skill acquisitions
  const handleFeedPet = (petId: string) => {
    if (player.demonCores < 2) {
      alert('妖丹不足！需要 2 颗妖丹喂养灵宠。');
      return;
    }

    setPlayer((prev) => ({ ...prev, demonCores: prev.demonCores - 2 }));
    setPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;
        const newLevel = (p.level || 1) + 1;
        const newAtk = p.atk + 45;
        const newHp = (p.maxHp || 500) + 150;
        
        // Skill unlock pool based on level & pet name
        let updatedSkills = [...(p.skills || [])];
        if (p.name.includes('啼魂') && !updatedSkills.includes('变身刑天巨猿')) {
          updatedSkills.push('变身刑天巨猿');
        }
        if (p.name.includes('噬金虫') && !updatedSkills.includes('金光虫群狂暴')) {
          updatedSkills.push('金光虫群狂暴');
        }
        if (p.name.includes('六翼霜蚣') && !updatedSkills.includes('六翼风刃')) {
          updatedSkills.push('六翼风刃');
        }
        if (p.name.includes('墨蛟') && !updatedSkills.includes('蛟龙撼地')) {
          updatedSkills.push('蛟龙撼地');
        }
        if (p.name.includes('麒麟') && !updatedSkills.includes('五彩神光')) {
          updatedSkills.push('五彩神光');
        }

        // Random bonus skill at milestones
        const extraSkills = ['天雷正法', '辟邪金煞', '龙啸九天', '太乙真火', '撕裂虚空', '冰魄死光', '百鬼护体'];
        if (newLevel % 3 === 0 && updatedSkills.length < 6) {
          const randomSkill = extraSkills[(newLevel + updatedSkills.length) % extraSkills.length];
          if (!updatedSkills.includes(randomSkill)) {
            updatedSkills.push(randomSkill);
          }
        }

        // Evolution stage update
        let stage = p.evolutionStage || '幼年期';
        if (newLevel >= 25) stage = '真灵巅峰';
        else if (newLevel >= 15) stage = '成虫蜕变期';
        else if (newLevel >= 8) stage = '成熟变身期';

        return {
          ...p,
          level: newLevel,
          atk: newAtk,
          hp: newHp,
          maxHp: newHp,
          skills: updatedSkills,
          evolutionStage: stage
        };
      })
    );
  };

  // Trigger Active Pet Ultimate Skill Transformation
  const handleTriggerPetSkill = (petId?: string) => {
    const pet = pets.find((p) => petId ? p.id === petId : p.isActive) || pets[0];
    if (!pet) {
      alert('未拥有出战灵宠！');
      return;
    }

    const isTihun = pet.name.includes('啼魂') || pet.name.includes('刑天');
    const skillName = isTihun ? '变身刑天巨猿' : (pet.skills[pet.skills.length - 1] || '真灵神通');

    // Display 3s Overlay Effect
    setActivatedItem({
      id: pet.id + '_' + Date.now(),
      name: isTihun ? '啼魂兽 · 变身刑天巨猿' : `${pet.name} · ${skillName}`,
      category: 'pet_skill',
      element: pet.element,
      icon: getItemExactImage(pet.name, 'pet', pet.icon),
      rarity: pet.rarity || '真灵古宝',
      description: `【${pet.name}】震撼激发终极神通【${skillName}】！满屏金红煞气冲霄，毁灭万妖！`,
      effect: `攻击力暴增 +${pet.atk * 3}，并引爆全屏狂暴音波！`,
      timestamp: Date.now(),
    });

    // Massive attack buff & canvas shockwave
    setPlayer((prev) => ({
      ...prev,
      atk: prev.atk + pet.atk * 3,
      selectedEffectFx: 'fubao_press_stamp' as any
    }));

    setTimeout(() => {
      setPlayer((prev) => ({
        ...prev,
        atk: Math.max(50, prev.atk - pet.atk * 3),
        selectedEffectFx: null
      }));
    }, 5000);

    sound.playBreakthrough();
  };

  // Toggle Active Pet
  const handleTogglePet = (petId: string) => {
    setPets((prev) => prev.map((p) => ({ ...p, isActive: p.id === petId })));
  };

  // Join Sect
  const handleJoinSect = (sect: Sect) => {
    setPlayer((prev) => ({ ...prev, sectId: sect.id, sectName: sect.name }));
  };

  // Buy Item from Sect
  const handleBuySectItem = (item: GameItem) => {
    const price = item.price || 100;
    if (player.spiritStones < price) {
      alert(`灵石不足！需要 ${price} 灵石，当前拥有 ${player.spiritStones} 灵石。`);
      return;
    }

    recordStoneChange(-price, `宗门兑换【${item.name}】`, player.spiritStones);
    setPlayer((prev) => ({ ...prev, spiritStones: prev.spiritStones - price }));
    setInventory((prev) => [...prev, item]);
  };

  // Shop Handlers
  const handleBuyItem = (item: GameItem, cost: number) => {
    recordStoneChange(-cost, `坊市购买【${item.name}】`, player.spiritStones);
    setPlayer(prev => ({ ...prev, spiritStones: prev.spiritStones - cost }));
    setInventory(prev => {
      const existing = prev.find(i => i.id === item.id || i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleSellItem = (item: GameItem, price: number) => {
    recordStoneChange(price, `坊市出售【${item.name}】`, player.spiritStones);
    setPlayer(prev => ({ ...prev, spiritStones: prev.spiritStones + price }));
    setInventory(prev => {
      const idx = prev.findIndex(i => i.id === item.id || i.name === item.name);
      if (idx === -1) return prev;
      const updated = [...prev];
      if ((updated[idx].quantity || 1) > 1) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity! - 1 };
      } else {
        updated.splice(idx, 1);
      }
      return updated;
    });
  };

  // Claim Quest Reward
  const handleClaimReward = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q) return;

    setPlayer((prev) => ({
      ...prev,
      exp: prev.exp + q.rewardExp,
      spiritStones: prev.spiritStones + q.rewardStones,
    }));

    if (q.rewardItems) {
      setInventory((prev) => [...prev, ...q.rewardItems]);
    }

    setQuests((prev) =>
      prev.map((item, idx) => {
        if (item.id === questId) return { ...item, completed: true, active: false };
        if (prev[idx - 1]?.id === questId) return { ...item, active: true };
        return item;
      })
    );
  };

  // Handle Tribulation Failure Death (Samsara Reset)
  const handleFailureDeath = () => {
    setActiveModal('none');
    handleRestartGame();
    alert('💥 惨遭毁灭性天雷轰顶！未能度过天劫，肉身崩解！轮回重开修仙之路...');
  };

  // Universe Modal Action Handlers
  const handleSelectCharacter = (char: CharacterOption) => {
    setPlayer((prev) => ({
      ...prev,
      name: char.name,
      title: char.title,
      root: char.root as any,
      atk: prev.atk + char.atkBonus,
      moveSpeed: 3.5 * char.speedBonus,
    }));
  };

  const handleSelectEffectFx = (fxKey: AttackEffectType) => {
    setPlayer((prev) => ({
      ...prev,
      selectedEffectFx: fxKey,
    }));
  };

  const handleEquipSword = (sword: FlyingSword) => {
    setFlyingSwords((prev) => {
      const exists = prev.some((s) => s.id === sword.id);
      if (exists) return prev;
      return [sword, ...prev];
    });
  };

  const handleEquipPet = (pet: Pet) => {
    setPets((prev) => {
      const exists = prev.some((p) => p.id === pet.id);
      if (exists) {
        return prev.map((p) => ({ ...p, isActive: p.id === pet.id }));
      }
      return [{ ...pet, isActive: true }, ...prev.map((p) => ({ ...p, isActive: false }))];
    });
  };

  const handleUnlockSpell = (spellId: string) => {
    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, unlocked: true } : s))
    );
  };

  const handleUseTalisman = (talisman: Talisman) => {
    setPlayer((prev) => ({
      ...prev,
      atk: prev.atk + 20,
      def: prev.def + 15,
      moveSpeed: prev.moveSpeed + 0.5,
      selectedEffectFx: 'talisman_burst_ring' as any
    }));
    setActiveTalismanName(talisman.name);

    setTimeout(() => {
      setPlayer((prev) => ({ ...prev, selectedEffectFx: null }));
    }, 3000);

    const itemImg = getItemExactImage(talisman.name, 'talisman', talisman.icon);
    setActivatedItem({
      id: talisman.id,
      name: talisman.name,
      category: 'talisman',
      element: talisman.element,
      icon: itemImg,
      rarity: talisman.rarity || talisman.grade,
      description: talisman.description,
      effect: talisman.effect,
      timestamp: Date.now(),
    });
  };

  const handleUseFuBao = (fubao: FuBao) => {
    setPlayer((prev) => ({
      ...prev,
      atk: prev.atk + fubao.burstDamage,
      selectedEffectFx: 'fubao_press_stamp' as any
    }));

    setTimeout(() => {
      setPlayer((prev) => ({ ...prev, selectedEffectFx: null }));
    }, 3000);

    const itemImg = getItemExactImage(fubao.name, 'fubao', fubao.icon);
    setActivatedItem({
      id: fubao.id,
      name: fubao.name,
      category: 'fubao',
      element: fubao.element,
      icon: itemImg,
      rarity: fubao.rarity || '极品法器',
      description: fubao.description,
      effect: `激发【${fubao.name}】！爆发极致威力 +${fubao.burstDamage}`,
      timestamp: Date.now(),
    });
  };

  const handleStudyManual = (manual: CultivationManual) => {
    setPlayer((prev) => ({
      ...prev,
      atk: prev.atk + manual.passiveAtk,
      def: prev.def + manual.passiveDef,
    }));

    const itemImg = getItemExactImage(manual.name, 'manual', manual.icon);
    setActivatedItem({
      id: manual.id,
      name: manual.name,
      category: 'manual',
      element: manual.element,
      icon: itemImg,
      rarity: manual.rarity || manual.grade,
      description: manual.description,
      effect: `悟解玄功！获得攻击力 +${manual.passiveAtk}，防御力 +${manual.passiveDef}`,
      timestamp: Date.now(),
    });
  };

  const currentRealmInfo = REALMS[player.realmId] || REALMS['REALM001'];

  // Clear visual effect FX automatically
  useEffect(() => {
    if (
      player.selectedEffectFx === 'fubao_press_stamp' ||
      player.selectedEffectFx === 'pill_consume' ||
      player.selectedEffectFx === 'talisman_burst_ring'
    ) {
      const timer = setTimeout(() => {
        setPlayer((prev) => ({ ...prev, selectedEffectFx: 'default_slash' }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [player.selectedEffectFx]);

  return (
    <div className="w-screen h-screen bg-[#121410] text-[#e3e3dc] overflow-hidden flex flex-col relative font-sans">
      {/* Dynamic Item / Talisman Usage Center Overlay Animation */}
      <ItemActivationOverlay
        itemInfo={activatedItem}
        onFinished={() => setActivatedItem(null)}
      />

      {/* Initial Character Creation Screen */}
      {!hasStarted ? (
        <CharacterCreateModal onStartGame={handleStartGame} />
      ) : (
        <>
          {/* Main 2D Hack-and-Slash Canvas World */}
          <div className="w-full h-full relative">
            <GameCanvas
              player={player}
              spells={spells}
              flyingSwords={flyingSwords}
              pets={pets}
              currentMap={currentMap}
              onUpdatePlayer={setPlayer}
              onEnemyKilled={handleEnemyKilled}
              onItemCollected={handleItemCollected}
              onBossDefeated={handleBossDefeated}
              onEncounterBuilding={handleEncounterBuilding}
              isModalOpen={activeModal !== 'none'}
            />

            {/* Main Xianxia HUD Controls & Nav */}
            <HUD
              player={player}
              realmInfo={currentRealmInfo}
              inventory={inventory}
              pets={pets}
              onOpenModal={(modal) => setActiveModal(modal)}
              onUseItem={handleUseItem}
              onUsePetSkill={handleTriggerPetSkill}
            />
          </div>

          {/* Interactive Xianxia Feature Modals */}
          {activeModal === 'cultivation' && (
            <CultivationModal
              player={player}
              realmInfo={currentRealmInfo}
              inventory={inventory}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={setPlayer}
              onUseItem={handleUseItem}
              onAddHerb={handleAddHerb}
              onOpenTribulation={() => setActiveModal('tribulation')}
            />
          )}

          {activeModal === 'shop' && (
            <ShopModal
              player={player}
              inventory={inventory}
              stoneHistory={stoneHistory}
              onBuy={handleBuyItem}
              onSell={handleSellItem}
              onClose={() => setActiveModal('none')}
            />
          )}

          {activeModal === 'inventory' && (
            <InventoryModal
              inventory={inventory}
              player={player}
              onClose={() => setActiveModal('none')}
              onUseItem={handleUseItem}
              onCraftPill={(pillName, hp, mp) => {
                setInventory((prev) => [
                  ...prev,
                  {
                    id: `pill_${Date.now()}`,
                    name: pillName,
                    rarity: '极品法器',
                    category: 'pill',
                    description: '炼丹炉亲自炼制的精纯妙丹！',
                    stats: { hp, mp },
                    quantity: 1,
                  },
                ]);
              }}
              onRefineWeapon={(weaponName, atk) => {
                setPlayer((prev) => ({ ...prev, atk: prev.atk + atk }));
              }}
              onCraftTalisman={(talismanName, effectDesc) => {
                setInventory((prev) => [
                  ...prev,
                  {
                    id: `talisman_${Date.now()}`,
                    name: talismanName,
                    rarity: talismanName.includes('避劫') ? '极品仙符' : '上品灵符',
                    category: 'talisman',
                    description: `炼符秘台亲笔绘制之【${talismanName}】！功效: ${effectDesc}`,
                    effect: effectDesc,
                    quantity: 1,
                  },
                ]);
              }}
              onCraftArtifact={(name, desc, atk, rarity) => {
                setInventory((prev) => [
                  ...prev,
                  {
                    id: `artifact_${Date.now()}`,
                    name,
                    rarity: rarity as any,
                    category: 'fubao',
                    description: desc,
                    effect: desc,
                    stats: { atk },
                    quantity: 1,
                  },
                ]);
              }}
            />
          )}

          {activeModal === 'swords' && (
            <FlyingSwordsModal
              flyingSwords={flyingSwords}
              player={player}
              onClose={() => setActiveModal('none')}
              onRefineSword={handleRefineSword}
              onAssembleFormation={handleAssembleFormation}
              onUpdateEquippedSwords={(elements) => {
                setPlayer((prev) => ({ ...prev, equippedSwordElements: elements }));
              }}
            />
          )}

          {activeModal === 'tribulation' && (
            <TribulationModal
              player={player}
              realmInfo={currentRealmInfo}
              inventory={inventory}
              spells={spells}
              flyingSwords={flyingSwords}
              onClose={() => setActiveModal('none')}
              onSuccessBreakthrough={handleSuccessBreakthrough}
              onFailureDeath={handleFailureDeath}
              onConsumeItem={(itemId) => {
                setInventory((prev) => {
                  const index = prev.findIndex((i) => i.id === itemId);
                  if (index === -1) return prev;
                  const updated = [...prev];
                  if ((updated[index].quantity || 1) > 1) {
                    updated[index] = { ...updated[index], quantity: (updated[index].quantity || 1) - 1 };
                  } else {
                    updated.splice(index, 1);
                  }
                  return updated;
                });
              }}
            />
          )}

          {activeModal === 'pets' && (
            <PetsModal
              pets={pets}
              player={player}
              onClose={() => setActiveModal('none')}
              onTogglePet={handleTogglePet}
              onFeedPet={handleFeedPet}
              onTriggerPetSkill={handleTriggerPetSkill}
            />
          )}

          {activeModal === 'sect' && (
            <SectModal
              sects={sects}
              player={player}
              onClose={() => setActiveModal('none')}
              onJoinSect={handleJoinSect}
              onBuySectItem={handleBuySectItem}
            />
          )}

          {activeModal === 'secretRealm' && (
            <SecretRealmModal
              mapZones={mapZones}
              currentMap={currentMap}
              player={player}
              onClose={() => setActiveModal('none')}
              onSelectMap={(zone) => setCurrentMap(zone)}
            />
          )}

          {activeModal === 'story' && (
            <StoryModal
              quests={quests}
              onClose={() => setActiveModal('none')}
              onClaimReward={handleClaimReward}
            />
          )}

          {activeModal === 'guide' && (
            <GameGuideModal onClose={() => setActiveModal('none')} />
          )}

          {activeModal === 'universe' && (
            <XianxiaUniverseModal
              isOpen={activeModal === 'universe'}
              onClose={() => setActiveModal('none')}
              player={player}
              spells={spells}
              flyingSwords={flyingSwords}
              pets={pets}
              onSelectCharacter={handleSelectCharacter}
              onSelectEffectFx={handleSelectEffectFx}
              onEquipSword={handleEquipSword}
              onEquipPet={handleEquipPet}
              onUnlockSpell={handleUnlockSpell}
              onUseTalisman={handleUseTalisman}
              onUseFuBao={handleUseFuBao}
              onStudyManual={handleStudyManual}
            />
          )}

          {activeModal === 'buildingEncounter' && encounteredBuilding && (
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveModal('none');
                }
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 pointer-events-auto cursor-pointer"
            >
              <div className="bg-[#181a17] p-6 rounded-2xl border-2 border-amber-500/60 max-w-md w-full shadow-2xl text-center text-[#e3e3dc] animate-in fade-in zoom-in-95 cursor-default">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 上古秘境入口
                </div>
                <h2 className="text-2xl font-black text-amber-300 mb-3">发现【{encounteredBuilding.name}】</h2>
                <p className="text-xs text-[#a1a8a0] mb-6 leading-relaxed bg-[#20231e] p-3 rounded-xl border border-[#3b4138]">
                  你来到了【{encounteredBuilding.name}】的入口。<br/>
                  此处灵气涌动，隐隐有绝世大妖盘踞，凶险万分。<br/>
                  是否要进入其中探索，寻觅逆天机缘？
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveModal('none')}
                    className="px-5 py-2 bg-[#282b25] hover:bg-[#343831] border border-[#484f44] text-[#a1a8a0] hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    暂不进入
                  </button>
                  <button
                    onClick={handleEnterBuilding}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/30 border border-emerald-400 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>深入探索</span>
                  </button>
                </div>
              </div>
            </div>
          )}

                    {activeModal === 'home' && (
            <HomeModal
              player={player}
              inventory={inventory}
              garden={garden}
              onPlant={handlePlantHerb}
              onHarvest={handleHarvestHerb}
              onCultivate={handleCultivate}
              onUpgradeCave={handleUpgradeCave}
              onUseGreenVialOnGarden={handleAccelerateGardenPlot}
              onUpdatePlayer={setPlayer}
              onClose={() => setActiveModal('none')}
            />
          )}
          <GoogleAiResourceModal
            isOpen={activeModal === 'aiGallery'}
            onClose={() => setActiveModal('none')}
          />
        </>
      )}
    </div>
  );
}
