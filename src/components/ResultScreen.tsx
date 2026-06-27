// 结算页 - 游戏结果展示
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import { STEP_LABELS } from '@/game/constants';
import { playCelebrationSound, playFlowerSound } from '@/audio/sound';
import type { RescueStep } from '@/game/state';

const CORRECT_FLOW: RescueStep[] = [
  'scene_safe',
  'emergency_called',
  'aed_requested',
  'response_checked',
  'breath_checked',
  'cpr_active',
  'aed_ready',
  'pads_attached',
  'clear_confirmed',
  'shock_done',
  'rescued',
];

const MISTAKE_MESSAGES: Record<string, string> = {
  compress_before_call: '❌ 未呼叫120就开始按压',
  wrong_order: '⚠️ 操作顺序有误',
  skip_scene_check: '❌ 未确认现场安全',
  skip_aed_assign: '❌ 忘记指派取AED',
  contact_during_shock: '❌ 电击时接触了患者',
  long_pause: '⏸️ 长时间停止操作',
};

const ResultScreen: React.FC = () => {
  const {
    score,
    grade,
    flowers,
    completedSteps,
    mistakes,
    compressionStats,
    timeLeft,
    resetGame,
    setPhase,
  } = useGameStore();

  const elapsed = 120 - timeLeft;
  const isSuccess = completedSteps.includes('rescued');
  const uniqueMistakes = [...new Set(mistakes.map(m => m.split(':')[0]))];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSuccess) playCelebrationSound();
      setTimeout(() => playFlowerSound(flowers), 500);
    }, 300);
    return () => clearTimeout(timer);
  }, [isSuccess, flowers]);

  const handleRestart = () => {
    resetGame();
  };

  const handleCredits = () => {
    setPhase('credits');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-y-auto py-8 px-4 relative">
      {/* 扫描线 */}
      <div className="absolute inset-0 pointer-events-none opacity-5 scanline-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* 标题 */}
        <div className="pixel-border bg-card p-4 mb-4 text-center">
          <h1 className={`game-title text-2xl font-bold mb-1 ${isSuccess ? 'text-green-400' : 'text-primary'}`}>
            {isSuccess ? '🎉 急救成功！' : '⏰ 时间结束'}
          </h1>
          <p className="text-muted-foreground hud-text text-sm">
            {isSuccess ? '你的快速行动挽救了生命！' : '继续练习，你下次会做得更好'}
          </p>
        </div>

        {/* 主要评分 */}
        <div className="pixel-border bg-card p-6 mb-4 text-center">
          {/* 等级 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <span className={`game-title text-6xl font-bold ${
              grade === 'S' ? 'text-primary crt-glow' :
              grade === 'A' ? 'text-accent crt-glow-yellow' :
              grade === 'B' ? 'text-green-400' : 'text-muted-foreground'
            }`}>
              {grade}
            </span>
            <div className="text-muted-foreground hud-text text-sm mt-1">
              综合评级 · {score} 分
            </div>
          </motion.div>

          {/* 小红花 */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: i <= flowers ? 1 : 0.4, rotate: 0, opacity: i <= flowers ? 1 : 0.25 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                className="text-3xl"
              >
                🌸
              </motion.span>
            ))}
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="pixel-panel p-2">
              <div className="text-accent hud-text text-lg font-bold">{elapsed}s</div>
              <div className="text-muted-foreground hud-text text-xs">用时</div>
            </div>
            <div className="pixel-panel p-2">
              <div className="text-green-400 hud-text text-lg font-bold">
                {compressionStats.totalPresses}
              </div>
              <div className="text-muted-foreground hud-text text-xs">总按压</div>
            </div>
            <div className="pixel-panel p-2">
              <div className={`hud-text text-lg font-bold ${mistakes.length > 0 ? 'text-primary' : 'text-green-400'}`}>
                {mistakes.length}
              </div>
              <div className="text-muted-foreground hud-text text-xs">错误</div>
            </div>
          </div>
        </div>

        {/* 按压统计 */}
        {compressionStats.totalPresses > 0 && (
          <div className="pixel-panel p-4 mb-4">
            <p className="text-accent hud-text text-xs mb-3 text-center">【 按压节奏统计 】</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(['perfect', 'good', 'slow', 'fast'] as const).map((r) => (
                <div key={r} className="pixel-panel p-2">
                  <div className={`hud-text text-sm font-bold ${
                    r === 'perfect' ? 'text-green-400' :
                    r === 'good' ? 'text-accent' :
                    r === 'slow' ? 'text-blue-400' : 'text-primary'
                  }`}>
                    {compressionStats[r]}
                  </div>
                  <div className="text-muted-foreground hud-text text-xs capitalize">{r}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center">
              <span className="text-muted-foreground hud-text text-xs">
                最长连击: <span className="text-accent">{compressionStats.longestCombo}</span>
              </span>
            </div>
          </div>
        )}

        {/* 急救流程复盘 */}
        <div className="pixel-border bg-card p-4 mb-4">
          <p className="text-accent hud-text text-xs mb-3 text-center">【 急救流程复盘 】</p>
          <div className="space-y-1">
            {CORRECT_FLOW.map((step, i) => {
              const done = completedSteps.includes(step);
              return (
                <div key={step} className="flex items-center gap-2">
                  <span className={`hud-text text-sm ${done ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {done ? '✓' : '○'}
                  </span>
                  <span className={`hud-text text-xs ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {i + 1}. {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 错误提示 */}
        {uniqueMistakes.length > 0 && (
          <div className="pixel-border bg-card p-4 mb-4">
            <p className="text-primary hud-text text-xs mb-2 text-center">【 需要改进 】</p>
            <div className="space-y-1">
              {uniqueMistakes.slice(0, 4).map((m) => (
                <p key={m} className="text-primary hud-text text-xs">
                  {MISTAKE_MESSAGES[m] || `⚠️ ${m}`}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 公益提示 */}
        <div className="pixel-border-yellow bg-accent/10 p-4 mb-4">
          <p className="text-accent hud-text text-xs text-center mb-2">💡 公益小知识</p>
          <p className="text-foreground hud-text text-xs leading-relaxed">
            心搏骤停每延误1分钟，生存率下降7-10%。
            学习真实CPR和AED操作请联系红十字会或当地急救中心参加线下培训。
          </p>
        </div>

        {/* 按钮区 */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleRestart}
            className="pixel-btn bg-primary text-primary-foreground game-title text-base font-bold px-6 py-3 flex-1"
            whileTap={{ scale: 0.97 }}
          >
            🔄 再来一次
          </motion.button>
          <button
            onClick={handleCredits}
            className="pixel-panel hud-text text-sm px-4 py-3"
          >
            关于
          </button>
        </div>

        {/* 安全声明 */}
        <div className="bg-muted/30 border border-border p-3 mt-4">
          <p className="text-muted-foreground hud-text text-xs text-center leading-relaxed">
            ⚠️ 本游戏不能替代红十字会、急救中心或其他专业机构的线下培训。
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultScreen;
