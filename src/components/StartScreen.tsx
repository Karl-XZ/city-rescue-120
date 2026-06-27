// 开始页 - 像素风格急救游戏入口
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import { unlockAudio, playSuccessSound } from '@/audio/sound';

const StartScreen: React.FC = () => {
  const { setPhase } = useGameStore();
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    unlockAudio();
    playSuccessSound();
    setPhase('briefing');
  };

  const handlePractice = () => {
    unlockAudio();
    playSuccessSound();
    setPhase('practice');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* 扫描线背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-10 scanline-bg" />

      {/* 装饰像素格子背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary opacity-20"
            style={{
              left: `${(i * 7 + 3) % 100}%`,
              top: `${(i * 13 + 7) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* 主内容区 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6"
      >
        {/* 顶部装饰 */}
        <div className="pixel-border bg-card px-6 py-2 mb-6 w-full text-center">
          <span className="text-accent hud-text text-xs">【 公益急救科普游戏 】</span>
        </div>

        {/* 游戏标题 */}
        <div className="pixel-border bg-card p-8 mb-6 w-full text-center">
          <motion.div
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-primary crt-glow game-title text-4xl md:text-5xl font-bold mb-2 tracking-wider">
              城市急救
            </div>
            <div className="text-accent crt-glow-yellow game-title text-3xl md:text-4xl font-bold tracking-wider">
              120秒
            </div>
          </motion.div>
          <div className="mt-4 text-muted-foreground hud-text text-sm">
            CITY RESCUE · 120 SECONDS
          </div>
        </div>

        {/* 副标题 */}
        <div className="pixel-border bg-secondary/30 p-4 mb-6 w-full text-center">
          <p className="text-foreground hud-text text-sm leading-relaxed">
            你是第一目击者。在专业救援到达前，<br />
            你的每一个正确行动，都可能挽救一条生命。
          </p>
        </div>

        {/* 小红花装饰 */}
        <div className="flex gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            >
              🌸
            </motion.span>
          ))}
        </div>

        {/* 按压练习按钮 */}
        <motion.button
          onClick={handlePractice}
          className="pixel-btn bg-accent text-accent-foreground game-title text-lg font-bold px-12 py-3 mb-3 w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          🫀  按压练习  (30秒)
        </motion.button>

        {/* 开始按钮 */}
        <motion.button
          onClick={handleStart}
          className="pixel-btn bg-primary text-primary-foreground game-title text-xl font-bold px-12 py-4 mb-6 w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {showCursor ? '▶  开始游戏  ◀' : '▶  开始游戏  ◀'}
        </motion.button>

        {/* 操作提示 */}
        <div className="pixel-panel p-4 mb-4 w-full">
          <p className="text-accent hud-text text-xs text-center mb-2">【 操作说明 】</p>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground hud-text text-xs">
            <span>[WASD] 移动</span>
            <span>[E] 交互/确认</span>
            <span>[1-4] 急救动作</span>
            <span>[空格] 胸外按压</span>
          </div>
        </div>

        {/* 医学安全声明 */}
        <div className="bg-muted/50 border border-border p-4 w-full">
          <p className="text-muted-foreground hud-text text-xs leading-relaxed text-center">
            ⚠️ 安全声明：本游戏仅用于公益急救科普和情景模拟，<br />
            不能替代红十字会、急救中心或其他专业机构的线下培训。<br />
            实际急救请拨打 120 并遵循专业人员指导。
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
