import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, RealmInfo, GameItem, Spell, FlyingSword } from '../types/game';
import { sound } from '../engine/sound';
import { Zap, Shield, Sparkles, AlertTriangle, RefreshCw, Flame, Heart, BookOpen, Scroll, Skull, Award, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface TribulationModalProps {
  player: PlayerStats;
  realmInfo: RealmInfo;
  inventory: GameItem[];
  spells: Spell[];
  flyingSwords: FlyingSword[];
  onClose: () => void;
  onSuccessBreakthrough: () => void;
  onFailureDeath: () => void;
  onConsumeItem?: (itemId: string) => void;
}

type TribulationPhase = 
  | 'intro'
  | 'thunder_1'
  | 'thunder_2'
  | 'demon_attack'
  | 'thunder_3'
  | 'success'
  | 'failure';

interface MentalDemonQuestion {
  question: string;
  demonName: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

const DEMON_QUESTIONS: MentalDemonQuestion[] = [
  {
    demonName: '七玄门·墨居仁心魔',
    question: '“韩立，修仙之路尽是尔虞我诈！当年老夫收你为徒亦是为舍夺肉身，你杀伐果断，手染同门性命，今日天雷临头，你心有愧疚吗？！”',
    options: [
      { text: '【道心如磐】顺我者昌，逆我者亡！我心如刀，披荆斩棘，何须愧疚！', isCorrect: true, feedback: '✨ 坚定修仙无上道心，将墨居仁心魔幻象斩为粉碎！神识大增！' },
      { text: '【动摇认罪】当年杀害同门确实心存惭愧，愿受天雷惩罚...', isCorrect: false, feedback: '💥 心魔趁虚而入，识海震荡重创！扣除 150 点气血！' },
    ]
  },
  {
    demonName: '乱星海·极阴老祖煞魔',
    question: '“桀桀！天地不仁，万物为刍狗！你以为修成名门正派便可飞升仙界？不如随老夫化身无边凶魔，杀尽苍生，永享自在！”',
    options: [
      { text: '【明王镇魔】运转《明王决》与《青元剑诀》，佛光魔火归于吾身，镇杀极阴！', isCorrect: true, feedback: '✨ 明王金身佛光浩荡，将极阴尸气驱散一空！' },
      { text: '【心动化魔】修仙求道太苦，不如投身极阴魔道掌控滔天杀戮...', isCorrect: false, feedback: '💥 走火入魔经脉逆流！扣除 200 点气血！' },
    ]
  },
  {
    demonName: '修仙执念·红尘执着魔',
    question: '“凡人寿元百载，仙人动辄千载！你抛弃凡俗亲人，孤身一人在冰冷洞府中苦修数百载，落得举目无亲，值得吗？！”',
    options: [
      { text: '【斩断执念】修仙即为大道长生，不问凡俗过往，直指九霄！', isCorrect: true, feedback: '✨ 执念冰释消融，天道清明！全额恢复 300 点气血！' },
      { text: '【执念难舍】我思念山村故乡与至亲，不想再承受长生之孤独...', isCorrect: false, feedback: '💥 执念如刀割裂丹田真元！扣除 180 点气血！' },
    ]
  }
];

export const TribulationModal: React.FC<TribulationModalProps> = ({
  player,
  realmInfo,
  inventory,
  spells,
  flyingSwords,
  onClose,
  onSuccessBreakthrough,
  onFailureDeath,
  onConsumeItem,
}) => {
  const [phase, setPhase] = useState<TribulationPhase>('intro');
  const [currentHp, setCurrentHp] = useState<number>(player.hp);
  const [maxHp] = useState<number>(player.maxHp);
  const [currentShield, setCurrentShield] = useState<number>(0);
  const [defenseMode, setDefenseMode] = useState<'none' | 'sword' | 'talisman' | 'manual'>('none');
  const [selectedTalisman, setSelectedTalisman] = useState<GameItem | null>(null);
  const [strikeCountdown, setStrikeCountdown] = useState<number>(3);
  const [survivalTimer, setSurvivalTimer] = useState<number>(20);
  const [logs, setLogs] = useState<string[]>([]);
  const [demonIndex, setDemonIndex] = useState<number>(0);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // Global 20-Second Survival Timer during active Tribulation
  useEffect(() => {
    if (phase === 'intro' || phase === 'success' || phase === 'failure') return;

    if (survivalTimer > 0) {
      const interval = setInterval(() => {
        setSurvivalTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, survivalTimer]);

  useEffect(() => {
    if (survivalTimer <= 0 && phase !== 'intro' && phase !== 'success' && phase !== 'failure' && currentHp > 0) {
      setPhase('success');
      sound.playLevelUp();
    }
  }, [survivalTimer, phase, currentHp]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check for defensive talismans in inventory
  const talismansInBag = inventory.filter(i => 
    i.category === 'talisman' || 
    i.name.includes('符') || 
    i.name.includes('护') || 
    i.name.includes('避劫')
  );

  // Sound & Screen Shake trigger helper
  const triggerLightningImpact = (damage: number, color: string = 'rgba(168, 85, 247, 0.4)') => {
    sound.playTribulationThunder();
    sound.playRollingThunder();
    setScreenShake(true);
    setFlashColor(color);

    setTimeout(() => setScreenShake(false), 900);
    setTimeout(() => setFlashColor(null), 400);

    // Apply shield & damage
    const remainingDamage = Math.max(0, damage - currentShield);
    const newShield = Math.max(0, currentShield - damage);
    const nextHp = Math.max(0, currentHp - remainingDamage);

    setCurrentShield(newShield);
    setCurrentHp(nextHp);

    if (nextHp <= 0) {
      setTimeout(() => {
        setPhase('failure');
        sound.playGameOver();
      }, 800);
    }
  };

  // Add Log Entry
  const addLog = (text: string) => {
    setLogs(prev => [text, ...prev]);
  };

  // Canvas Lightning & Dynamic Thundercloud Real-time Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Persistent random lightning spark particles
    const sparks: { x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number }[] = [];

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Dark Storm Atmosphere Background
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      grad.addColorStop(0, phase === 'demon_attack' ? '#2e1065' : '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Dynamic Flickering Thundercloud Filter (动态波浪雷云层)
      const cloudPulsate = Math.sin(time * 3) * 0.2 + 0.8;
      ctx.save();
      ctx.globalAlpha = 0.35 * cloudPulsate;
      for (let c = 0; c < 6; c++) {
        const cloudX = (canvas.width / 5) * c + Math.sin(time + c) * 30;
        const cloudY = 30 + Math.cos(time * 1.5 + c) * 20;
        const cloudRad = 90 + Math.sin(time * 2 + c) * 25;

        const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 10, cloudX, cloudY, cloudRad);
        cloudGrad.addColorStop(0, phase === 'demon_attack' ? '#7e22ce' : '#3b82f6');
        cloudGrad.addColorStop(0.6, '#1e1b4b');
        cloudGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudRad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Random High-Voltage Lightning Strikes & Sparks (随机雷击粒子)
      if (phase.startsWith('thunder') || phase === 'demon_attack') {
        const isStrikeMomemt = strikeCountdown === 0;
        const boltCount = isStrikeMomemt ? 10 : phase === 'thunder_3' ? 6 : 3;

        // Draw Animated Branching Thunderbolts
        for (let b = 0; b < boltCount; b++) {
          if (Math.random() < (isStrikeMomemt ? 0.8 : 0.35)) {
            ctx.beginPath();
            let startX = Math.random() * canvas.width;
            let startY = 0;
            ctx.moveTo(startX, startY);

            for (let i = 0; i < 9; i++) {
              startX += (Math.random() - 0.5) * (isStrikeMomemt ? 90 : 60);
              startY += canvas.height / 9;
              ctx.lineTo(startX, startY);

              // Spawn spark particles at joint
              if (Math.random() < 0.4) {
                sparks.push({
                  x: startX,
                  y: startY,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: 2 + Math.random() * 3,
                  color: isStrikeMomemt ? '#fef08a' : '#c084fc',
                  life: 1.0
                });
              }
            }

            ctx.strokeStyle = isStrikeMomemt ? '#ffffff' : phase === 'demon_attack' ? '#c084fc' : phase === 'thunder_3' ? '#facc15' : '#a855f7';
            ctx.lineWidth = isStrikeMomemt ? 4 + Math.random() * 4 : 2 + Math.random() * 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 20;
            ctx.stroke();
          }
        }

        // 4. Render & Update Lightning Spark Particles
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life -= 0.05;

          if (sp.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = sp.life;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        }

        // 5. White/Cyan Flash Overlay when Countdown hits 0 (屏幕震荡雷闪滤镜)
        if (isStrikeMomemt) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [phase, strikeCountdown]);

  // Start Tribulation Flow
  const handleStartTribulation = () => {
    setPhase('thunder_1');
    setStrikeCountdown(3);
    sound.playRollingThunder();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 1200);
    addLog('⚡ 苍穹色变，九天雷云聚拢！第一道【九天罡风雷】正在蓄能！');
  };

  // Countdown timer for thunderbolts
  useEffect(() => {
    if (!phase.startsWith('thunder')) return;

    if (strikeCountdown > 0) {
      const timer = setTimeout(() => {
        setStrikeCountdown(prev => prev - 1);
        sound.playRollingThunder();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Countdown reached 0 -> Execute Thunder Strike
    if (strikeCountdown === 0) {
      if (phase === 'thunder_1') {
        let dmg = 120;
        if (defenseMode === 'sword') {
          dmg = 60;
          addLog('🛡️ 祭出本命飞剑形成护体剑网，减免 50% 天雷伤害！');
        } else if (defenseMode === 'talisman' && selectedTalisman) {
          dmg = 10;
          addLog(`📜 催动符箓【${selectedTalisman.name}】！天雷威力被符文完全抵消！`); if (onConsumeItem) onConsumeItem(selectedTalisman.id);
        } else if (defenseMode === 'manual') {
          dmg = 80;
          addLog('🧘 运转强悍炼体功法，硬抗天雷肉身蜕变！');
        }

        triggerLightningImpact(dmg, 'rgba(168, 85, 247, 0.5)');
        addLog(`💥 第一道【九天罡风雷】轰然降下！造成 ${dmg} 点天雷打击！`);

        setTimeout(() => {
          if (currentHp > 0) {
            setPhase('thunder_2');
            setStrikeCountdown(3);
            setDefenseMode('none');
            setSelectedTalisman(null);
            addLog('⚡ 劫云翻滚，第二道【紫霄辟邪神雷】轰鸣蓄能！');
          }
        }, 1200);

      } else if (phase === 'thunder_2') {
        let dmg = 180;
        if (defenseMode === 'sword') {
          dmg = 90;
          addLog('🛡️ 飞剑万剑归宗绞杀，抵挡大半紫霄雷威！');
        } else if (defenseMode === 'talisman' && selectedTalisman) {
          dmg = 20;
          addLog(`📜 符箓【${selectedTalisman.name}】绽放金光，御雷护体！`); if (onConsumeItem) onConsumeItem(selectedTalisman.id);
        } else if (defenseMode === 'manual') {
          dmg = 110;
          addLog('🧘 《明王决》金身放光明，硬接紫霄神雷！');
        }

        triggerLightningImpact(dmg, 'rgba(234, 179, 8, 0.6)');
        addLog(`💥 第二道【紫霄辟邪神雷】贯穿长空！造成 ${dmg} 点伤害！`);

        setTimeout(() => {
          if (currentHp > 0) {
            setPhase('demon_attack');
            setDemonIndex(0);
            addLog('👹 浩瀚天劫煞气弥漫，域外心魔侵袭识海！');
          }
        }, 1200);

      } else if (phase === 'thunder_3') {
        let dmg = 250;
        if (defenseMode === 'sword') {
          dmg = 120;
          addLog('🛡️ 72柄青竹蜂云剑大阵齐鸣，撕裂混沌灭世雷！');
        } else if (defenseMode === 'talisman' && selectedTalisman) {
          dmg = 30;
          addLog(`📜 终极保命仙符【${selectedTalisman.name}】庇佑真元！`); if (onConsumeItem) onConsumeItem(selectedTalisman.id);
        } else if (defenseMode === 'manual') {
          dmg = 150;
          addLog('🧘 肉身真魔金身爆发出炽热神芒，抗衡灭世雷劫！');
        }

        triggerLightningImpact(dmg, 'rgba(239, 68, 68, 0.7)');
        addLog(`💥 终极第三道【灭世混沌雷】万雷齐鸣！造成 ${dmg} 点绝杀轰击！`);

        setTimeout(() => {
          if (currentHp > 0) {
            setPhase('success');
            sound.playBreakthrough();
            addLog('🎉 顺利安度九重雷劫与域外心魔！脱胎换骨，成功晋升大境界！');
          }
        }, 1500);
      }
    }
  }, [strikeCountdown, phase]);

  // Handle Mental Demon Choice
  const handleAnswerDemon = (option: { text: string; isCorrect: boolean; feedback: string }) => {
    addLog(option.feedback);

    if (option.isCorrect) {
      sound.playPickup();
      setCurrentHp(prev => Math.min(maxHp, prev + 150));
    } else {
      sound.playTribulationThunder();
      setCurrentHp(prev => {
        const nextHp = Math.max(0, prev - 160);
        if (nextHp <= 0) {
          setTimeout(() => {
            setPhase('failure');
            sound.playGameOver();
          }, 800);
        }
        return nextHp;
      });
    }

    if (demonIndex + 1 < DEMON_QUESTIONS.length) {
      setTimeout(() => {
        setDemonIndex(prev => prev + 1);
      }, 1000);
    } else {
      // Mind demon phase cleared -> Move to final thunder strike!
      setTimeout(() => {
        setPhase('thunder_3');
        setStrikeCountdown(3);
        setDefenseMode('none');
        setSelectedTalisman(null);
        addLog('⚡ 斩灭域外心魔！迎战终极第三道【灭世混沌雷】！');
      }, 1200);
    }
  };

  // Finish Breakthrough Action
  const handleCompleteSuccess = () => {
    onSuccessBreakthrough();
    onClose();
  };

  // Finish Death & Restart Action
  const handleRestartSamsara = () => {
    onFailureDeath();
    onClose();
  };

  let lightningGradient = 'linear-gradient(to bottom, #e879f9, #c084fc, #9333ea, transparent)';
  let lightningGlow1 = '#e879f9';
  let lightningGlow2 = '#c084fc';
  let lightningGlow3 = '#a855f7';
  let flashColor1 = 'rgba(216, 180, 254, 0.15)';
  let flashColor2 = 'rgba(216, 180, 254, 0.25)';

  if (realmInfo.id === 'REALM001' || realmInfo.id === 'REALM002') {
    lightningGradient = 'linear-gradient(to bottom, #ffffff, #e2e8f0, #94a3b8, transparent)';
    lightningGlow1 = '#ffffff';
    lightningGlow2 = '#f1f5f9';
    lightningGlow3 = '#e2e8f0';
    flashColor1 = 'rgba(255, 255, 255, 0.15)';
    flashColor2 = 'rgba(255, 255, 255, 0.25)';
  } else if (realmInfo.id === 'REALM003') {
    // Purple (default)
  } else {
    // REALM004 and above (Dark Gold)
    lightningGradient = 'linear-gradient(to bottom, #fcd34d, #d97706, #78350f, transparent)';
    lightningGlow1 = '#fcd34d';
    lightningGlow2 = '#d97706';
    lightningGlow3 = '#b45309';
    flashColor1 = 'rgba(252, 211, 77, 0.15)';
    flashColor2 = 'rgba(252, 211, 77, 0.25)';
  }

  const currentDemon = DEMON_QUESTIONS[demonIndex];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/95 overflow-hidden select-none ${screenShake ? 'thunder-shake' : ''}`}>
      {/* Enhanced CSS animations */}
      {/* Dynamic Lightning Colors */}
      <style>{`
        @keyframes thunderTremor {
          0% { transform: translate(0, 0) scale(1); }
          10% { transform: translate(-8px, -6px) scale(1.01) rotate(-0.8deg); }
          20% { transform: translate(8px, 5px) scale(0.99) rotate(0.8deg); }
          30% { transform: translate(-6px, 7px) scale(1.015) rotate(-0.6deg); }
          40% { transform: translate(7px, -5px) scale(0.995) rotate(0.5deg); }
          50% { transform: translate(-5px, -7px) scale(1.01) rotate(-0.8deg); }
          60% { transform: translate(6px, 6px) scale(0.99) rotate(0.6deg); }
          70% { transform: translate(-7px, 3px) scale(1.005) rotate(-0.5deg); }
          80% { transform: translate(5px, -6px) scale(0.995) rotate(0.5deg); }
          90% { transform: translate(-3px, 4px) scale(1) rotate(-0.2deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        .thunder-shake {
          animation: thunderTremor 0.35s ease-in-out infinite;
        }
        @keyframes cloudDrift {
          0% { background-position: 0 0; }
          100% { background-position: 100vw 100vh; }
        }
        @keyframes purpleLightning {
          0%, 95%, 100% { opacity: 0; transform: translateX(-50%) scaleY(0); }
          96% { opacity: 1; transform: translateX(-50%) scaleY(1); filter: brightness(2) drop-shadow(0 0 20px ${lightningGlow2}); }
          97% { opacity: 0; transform: translateX(-50%) scaleY(0.8); }
          98% { opacity: 1; transform: translateX(-50%) scaleY(1.2); filter: brightness(3) drop-shadow(0 0 30px ${lightningGlow2}); }
          99% { opacity: 0; transform: translateX(-50%) scaleY(0.5); }
        }
        @keyframes flashEffect {
          0%, 90%, 100% { background-color: transparent; }
          92% { background-color: ${flashColor1}; }
          95% { background-color: transparent; }
          96% { background-color: ${flashColor2}; }
        }
        @keyframes randomStrike1 {
          0%, 90%, 100% { opacity: 0; transform: translateX(0) scaleY(0); }
          92% { opacity: 1; transform: translateX(-20vw) scaleY(1) rotate(15deg); filter: brightness(2) drop-shadow(0 0 20px ${lightningGlow1}); }
          94% { opacity: 0; transform: translateX(-20vw) scaleY(0.5) rotate(15deg); }
        }
        @keyframes randomStrike2 {
          0%, 80%, 100% { opacity: 0; transform: translateX(0) scaleY(0); }
          82% { opacity: 1; transform: translateX(30vw) scaleY(1.2) rotate(-10deg); filter: brightness(3) drop-shadow(0 0 30px ${lightningGlow2}); }
          85% { opacity: 0; transform: translateX(30vw) scaleY(0.5) rotate(-10deg); }
        }
        @keyframes randomStrike3 {
          0%, 60%, 100% { opacity: 0; transform: translateX(0) scaleY(0); }
          61% { opacity: 1; transform: translateX(-10vw) scaleY(0.8) rotate(5deg); filter: brightness(2.5) drop-shadow(0 0 25px ${lightningGlow3}); }
          63% { opacity: 0; transform: translateX(-10vw) scaleY(0.2) rotate(5deg); }
        }
        .cloud-bg {
          background-image: radial-gradient(circle at center, transparent 0%, #000 80%), repeating-radial-gradient(circle at center, rgba(30, 20, 50, 0.6) 0, rgba(10, 5, 20, 0.9) 20px);
          background-size: 200vw 200vh;
          animation: cloudDrift 20s linear infinite;
        }
        .lightning-bolt {
          position: absolute;
          top: 0;
          left: 50%;
          width: 8px;
          height: 100vh;
          background: ${lightningGradient};
          transform-origin: top;
          animation: purpleLightning 5s infinite;
          clip-path: polygon(40% 0, 60% 0, 50% 15%, 70% 30%, 40% 50%, 65% 70%, 30% 100%, 0 100%, 25% 70%, 10% 50%, 45% 30%, 20% 15%);
        }
        .weather-flash-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          animation: flashEffect 7s infinite;
        }
        .random-lightning {
          position: absolute;
          top: 0;
          left: 50%;
          width: 6px;
          height: 100vh;
          background: ${lightningGradient};
          transform-origin: top;
          clip-path: polygon(40% 0, 60% 0, 50% 15%, 70% 30%, 40% 50%, 65% 70%, 30% 100%, 0 100%, 25% 70%, 10% 50%, 45% 30%, 20% 15%);
          pointer-events: none;
          z-index: 2;
        }
        .strike-1 { animation: randomStrike1 6s infinite; }
        .strike-2 { animation: randomStrike2 8s infinite; }
        .strike-3 { animation: randomStrike3 11s infinite; }
      `}</style>

      {/* Dark Clouds Layer */}
      <div className="absolute inset-0 cloud-bg opacity-70 pointer-events-none mix-blend-multiply" />
      <div className="weather-flash-overlay" />
      <div className="random-lightning strike-1" />
      <div className="random-lightning strike-2" />
      <div className="random-lightning strike-3" />
      
      {/* Purple Lightning Bolt (random interval) */}
      <div className="lightning-bolt z-0 pointer-events-none" style={{ left: '30%', animationDelay: '1s' }} />
      <div className="lightning-bolt z-0 pointer-events-none" style={{ left: '70%', animationDelay: '3s', transform: 'scaleX(-1) translateX(50%)' }} />

      {/* Background Lighting Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Screen Impact Flash Overlay */}
      {flashColor && (
        <div 
          className="fixed inset-0 pointer-events-none z-50 transition-all duration-300"
          style={{ backgroundColor: flashColor }}
        />
      )}

      {/* Main Tribulation UI Card */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-slate-900/90 border-b border-amber-500/30 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-amber-300 via-amber-500 to-red-400 bg-clip-text text-transparent font-serif truncate">
                九天天劫 · 破阶渡劫与心魔考验
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                当前破阶境界: <strong className="text-amber-300">{realmInfo.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="hidden xs:flex items-center gap-1 bg-slate-900/90 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-red-500/40 text-[10px] sm:text-xs">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
              <span className="font-bold text-red-400">
                {currentHp}/{maxHp}
              </span>
            </div>

            {currentShield > 0 && (
              <div className="hidden xs:flex items-center gap-1 bg-slate-900/90 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-cyan-500/40 text-[10px] sm:text-xs">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="font-bold text-cyan-300">+{currentShield}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="关闭 / 暂避"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">暂避锋芒</span>
            </button>
          </div>
        </div>

        {/* Content Body based on Phase */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active 20s Survival HUD Banner */}
          {phase !== 'intro' && phase !== 'success' && phase !== 'failure' && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950 via-red-950 to-slate-900 border border-amber-500/60 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Zap className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <span>全屏九天雷劫与域外心魔洗礼</span>
              </div>
              <div className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-black text-sm tracking-wider shadow">
                ⏳ 存活倒计时: {survivalTimer} 秒
              </div>
            </div>
          )}
          
          {/* Phase 1: Intro */}
          {phase === 'intro' && (
            <div className="text-center space-y-6 py-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-950 via-purple-950 to-slate-900 border-2 border-amber-400/80 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <Zap className="w-12 h-12 text-amber-300 animate-bounce" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl font-bold text-amber-300 font-serif">
                  九天雷劫降临 · 准备破阶【{realmInfo.name}】
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  修仙乃逆天而行！每破大境界皆须渡九天罡风雷劫与域外心魔侵袭。备好本命法宝与辟邪符箓，方可逢凶化吉脱胎换骨。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <span className="text-slate-400">寿元增幅:</span>
                  <span className="text-amber-300 font-bold ml-2">{realmInfo.lifespan}</span>
                </div>
                <div>
                  <span className="text-slate-400">神识星级:</span>
                  <span className="text-amber-300 font-bold ml-2">{'★'.repeat(realmInfo.divineSenseStars)}</span>
                </div>
                <div>
                  <span className="text-slate-400">灵力上限:</span>
                  <span className="text-emerald-400 font-bold ml-2">+{realmInfo.qiCapacity}</span>
                </div>
                <div>
                  <span className="text-slate-400">破阶基础概率:</span>
                  <span className="text-cyan-400 font-bold ml-2">{player.divineSense > 4 ? '90%' : '75%'}</span>
                </div>
              </div>

              <button
                onClick={handleStartTribulation}
                className="w-full max-w-md mx-auto py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 hover:brightness-110 text-slate-950 font-bold text-base shadow-2xl shadow-amber-600/40 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-6 h-6" />
                引动九天雷劫 · 强行渡劫破阶！
              </button>
            </div>
          )}

          {/* Phase 2: Thunderbolts Active (thunder_1, thunder_2, thunder_3) */}
          {phase.startsWith('thunder') && (
            <div className="space-y-6">
              
              {/* Countdown Banner */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/50 text-center space-y-2 relative overflow-hidden">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                  {phase === 'thunder_1' && '⚡ 第一关 · 九天罡风雷'}
                  {phase === 'thunder_2' && '⚡ 第二关 · 紫霄辟邪神雷'}
                  {phase === 'thunder_3' && '💥 终极关 · 灭世混沌神雷'}
                </div>

                <div className="text-4xl font-extrabold text-amber-300 font-mono tracking-wider flex items-center justify-center gap-3">
                  <Zap className="w-8 h-8 text-amber-400 animate-spin-slow" />
                  <span>天雷降下倒计时: {strikeCountdown} 秒</span>
                </div>

                <p className="text-xs text-slate-400">
                  请在天雷降下前选择应对策略，减免天雷杀伤！
                </p>
              </div>

              {/* Defense Option Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. 祭出本命飞剑 / 剑阵 */}
                <button
                  onClick={() => {
                    setDefenseMode('sword');
                    setCurrentShield(200);
                  }}
                  className={`p-4 rounded-xl border transition-all text-left space-y-2 ${
                    defenseMode === 'sword'
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Shield className="w-5 h-5" />
                    <span>祭出本命飞剑 / 剑阵</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    驱动青竹蜂云剑阵与飞剑抵挡，减免 50% 天雷轰击伤害。
                  </p>
                  <div className="text-[11px] text-emerald-300/80 font-medium">
                    当前飞剑数量: {flyingSwords.reduce((acc, s) => acc + s.count, 0)} 柄
                  </div>
                </button>

                {/* 2. 催动防雷符箓 */}
                <div
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    defenseMode === 'talisman'
                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Scroll className="w-5 h-5" />
                      <span>催动避劫符箓</span>
                    </div>
                  </div>

                  {talismansInBag.length > 0 ? (
                    <select
                      onChange={(e) => {
                        const item = inventory.find(i => i.id === e.target.value);
                        if (item) {
                          setSelectedTalisman(item);
                          setDefenseMode('talisman');
                          setCurrentShield(350);
                        }
                      }}
                      className="w-full p-2 bg-slate-950 border border-amber-500/40 rounded-lg text-xs text-amber-200"
                    >
                      <option value="">-- 选择使用的符箓 --</option>
                      {talismansInBag.map((t, idx) => (
                        <option key={`${t.id}_${idx}`} value={t.id}>
                          {t.name} ({t.rarity})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      储物袋中无避劫符箓，可前往储物袋或集市获取。
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    消耗一张高阶符箓，全额化解当前天雷霸道伤害！
                  </p>
                </div>

                {/* 3. 强抗功法 / 肉身淬炼 */}
                <button
                  onClick={() => {
                    setDefenseMode('manual');
                    setCurrentShield(100);
                  }}
                  className={`p-4 rounded-xl border transition-all text-left space-y-2 ${
                    defenseMode === 'manual'
                      ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <BookOpen className="w-5 h-5" />
                    <span>运转功法 · 肉身抗雷</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    以《明王决》与《托天魔功》金身硬抗，大幅激发肉身气血潜能！
                  </p>
                  <div className="text-[11px] text-purple-300/80 font-medium">
                    肉身抗雷加成: 渡劫成功后获得额外全属性
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Mental Demon Invasion */}
          {phase === 'demon_attack' && currentDemon && (
            <div className="p-6 rounded-2xl bg-purple-950/40 border-2 border-purple-500/60 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-purple-500/30 pb-3">
                <Skull className="w-8 h-8 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-purple-300">{currentDemon.demonName}</h3>
                  <p className="text-xs text-purple-200/70">域外心魔侵蚀脑海识海，请道友坚定修仙道心！</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 text-sm text-slate-200 font-serif leading-relaxed italic">
                {currentDemon.question}
              </div>

              <div className="space-y-3">
                {currentDemon.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerDemon(opt)}
                    className="w-full p-4 rounded-xl bg-slate-900/90 hover:bg-purple-900/50 border border-purple-500/40 hover:border-purple-400 text-left text-xs font-bold text-slate-100 transition-all flex items-center justify-between group"
                  >
                    <span>{opt.text}</span>
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phase 4: Success (脱胎换骨) */}
          {phase === 'success' && (
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 p-1 shadow-2xl shadow-emerald-500/50">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Award className="w-12 h-12 text-amber-300 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-amber-300 font-serif">
                  脱胎换骨 · 顺利晋升【{realmInfo.name}】！
                </h3>
                <p className="text-sm text-emerald-300">
                  🎉 天降甘霖金莲涌现！恭喜道友度过九重雷劫，神识体魄脱胎换骨，跨入无上天道高阶！
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/50 max-w-lg mx-auto grid grid-cols-2 gap-4 text-xs text-left">
                <div>
                  <span className="text-slate-400">生命上限:</span>
                  <span className="text-emerald-400 font-bold ml-2">+{Math.round(player.maxHp * 0.5)}</span>
                </div>
                <div>
                  <span className="text-slate-400">灵力上限:</span>
                  <span className="text-cyan-400 font-bold ml-2">+{Math.round(player.maxMp * 0.5)}</span>
                </div>
                <div>
                  <span className="text-slate-400">攻击与御剑威能:</span>
                  <span className="text-amber-300 font-bold ml-2">+{Math.round(player.atk * 0.4)}</span>
                </div>
                <div>
                  <span className="text-slate-400">神识提升:</span>
                  <span className="text-amber-300 font-bold ml-2">+{realmInfo.divineSenseStars} 星级</span>
                </div>
              </div>

              <button
                onClick={handleCompleteSuccess}
                className="w-full max-w-sm mx-auto py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 hover:brightness-110 text-slate-950 font-bold text-sm shadow-xl transition-all"
              >
                出关归府 · 掌控盖世威能！
              </button>
            </div>
          )}

          {/* Phase 5: Failure (兵解兵殒 · 轮回重开) */}
          {phase === 'failure' && (
            <div className="text-center py-8 space-y-6 animate-in fade-in duration-300">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center shadow-2xl shadow-red-600/50">
                <Skull className="w-12 h-12 text-red-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-red-500 font-serif">
                  💥 兵解兵殒 · 身死道消！
                </h3>
                <p className="text-sm text-red-300/90 max-w-lg mx-auto">
                  九天灭世天雷轰塌丹田！肉身灰飞烟灭，真元与执念尽数溃散，真灵遁入六道轮回重新投胎...
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-red-500/40 max-w-md mx-auto space-y-2 text-xs text-slate-300 font-mono text-left">
                <div className="text-red-400 font-bold border-b border-red-500/30 pb-1">
                  第 1 世·修仙终极战报:
                </div>
                <div>修仙道号: {player.name} ({player.root})</div>
                <div>临终境界: {realmInfo.name} (Lv.{player.level})</div>
                <div>击杀大妖: 数百余头</div>
                <div>遗憾事迹: 未能突破九天雷劫，抱憾陨落于苍穹雷暴之下...</div>
              </div>

              <button
                onClick={handleRestartSamsara}
                className="w-full max-w-md mx-auto py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-base shadow-2xl shadow-red-900/60 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
                重新踏入六道轮回 · 重开下一世修仙！
              </button>
            </div>
          )}

          {/* Real-time Tribulation Logs Container */}
          {logs.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto">
              <div className="text-slate-500 font-bold border-b border-slate-800 pb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                天劫与道心实况日志:
              </div>
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
