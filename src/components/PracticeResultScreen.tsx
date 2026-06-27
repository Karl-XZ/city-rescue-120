// 按压练习结算页
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import { playCelebrationSound } from '@/audio/sound';
import type { CompressionRating } from '@/game/state';

const GRADE_COLORS: Record<string, string> = {
  S: 'text-primary crt-glow',
  A: 'text-accent crt-glow-yellow',
  B: 'text-green-400',
  C: 'text-green-300',
  F: 'text-muted-foreground',
};

const RATING_LABELS: Record<string, string> = {
  perfect: 'PERFECT',
  good: 'GOOD',
  slow: '太慢',
  fast: '太快',
};

const PracticeResultScreen: React.FC = () => {
  const { practiceResult, resetPractice, setPhase } = useGameStore();

  useEffect(() => {
    if (practiceResult && practiceResult.grade !== 'F') {
      setTimeout(() => playCelebrationSound(), 300);
    }
  }, [practiceResult]);

  if (!practiceResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground hud-text">加载中...</span>
      </div>
    );
  }

  const { score, grade, stats } = practiceResult;
  const totalPresses = stats.totalPresses;
  const goodRate = totalPresses > 0
    ? Math.round(((stats.perfect + stats.good) / totalPresses) * 100)
    : 0;
  const perfectRate = totalPresses > 0
    ? Math.round((stats.perfect / totalPresses) * 100)
    : 0;

  // 评价语
  const getComment = (): string => {
    if (grade === 'S') return '完美节奏！你是按压大师！';
    if (grade === 'A') return '非常出色，节奏感很棒！';
    if (grade === 'B') return '表现不错，继续练习会更好！';
    if (grade === 'C') return '还有提升空间，多多练习！';
    return '需要加强练习，注意节奏指示器。';
  };

  const handleBackToMenu = () => {
    resetPractice();
  };

  const handleRetry = () => {
    setPhase('practice');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-y-auto py-8 px-4 relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 scanline-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* 标题 */}
        <div className="pixel-border bg-card p-4 mb-4 text-center">
          <h1 className="game-title text-2xl font-bold text-accent mb-1">
            按压练习结束
          </h1>
          <p className="text-muted-foreground hud-text text-sm">
            30秒胸外按压训练成绩
          </p>
        </div>

        {/* 评级 */}
        <div className="pixel-border bg-card p-6 mb-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="mb-3"
          >
            <span className={`game-title text-7xl font-bold ${GRADE_COLORS[grade] || 'text-muted-foreground'}`}>
              {grade}
            </span>
            <div className="text-muted-foreground hud-text text-sm mt-1">
              综合评分 · {score} 分
            </div>
          </motion.div>

          {/* 小红花装饰 */}
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((i) => {
              const show = grade === 'S' ? i <= 5 :
                grade === 'A' ? i <= 4 :
                grade === 'B' ? i <= 3 :
                grade === 'C' ? i <= 2 : i <= 1;
              return (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: show ? 1 : 0.4, rotate: 0, opacity: show ? 1 : 0.25 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                  className="text-2xl"
                >
                  🌸
                </motion.span>
              );
            })}
          </div>

          {/* 评价语 */}
          <p className="text-foreground hud-text text-sm">{getComment()}</p>
        </div>

        {/* 按压数据统计 */}
        <div className="pixel-panel p-4 mb-4">
          <p className="text-accent hud-text text-xs mb-3 text-center">【 按压统计 】</p>

          {/* 总览数据 */}
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="pixel-panel p-2">
              <div className="text-accent hud-text text-xl font-bold">{totalPresses}</div>
              <div className="text-muted-foreground hud-text text-xs">总按压次数</div>
            </div>
            <div className="pixel-panel p-2">
              <div className="text-green-400 hud-text text-xl font-bold">
                {goodRate}%
              </div>
              <div className="text-muted-foreground hud-text text-xs">优质率</div>
            </div>
            <div className="pixel-panel p-2">
              <div className="text-primary crt-glow hud-text text-xl font-bold">
                {perfectRate}%
              </div>
              <div className="text-muted-foreground hud-text text-xs">完美率</div>
            </div>
          </div>

          {/* 详细分类 */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['perfect', 'good', 'slow', 'fast'] as const).map((r) => (
              <div key={r} className="pixel-panel p-2">
                <div className={`hud-text text-lg font-bold ${
                  r === 'perfect' ? 'text-green-400' :
                  r === 'good' ? 'text-accent' :
                  r === 'slow' ? 'text-blue-400' : 'text-primary'
                }`}>
                  {stats[r]}
                </div>
                <div className="text-muted-foreground hud-text text-xs">{RATING_LABELS[r]}</div>
              </div>
            ))}
          </div>

          {/* 连击 */}
          <div className="mt-3 text-center">
            <span className="text-muted-foreground hud-text text-xs">
              最长连击: <span className="text-accent font-bold">{stats.longestCombo}</span>
            </span>
          </div>

          {/* 频率计算 */}
          {totalPresses > 0 && (
            <div className="mt-2 text-center">
              <span className="text-muted-foreground hud-text text-xs">
                平均频率: <span className="text-accent">
                  {Math.round((totalPresses / 30) * 60)}
                </span> 次/分钟
                <span className="text-muted-foreground/50 ml-1">
                  (标准: 100-120次/分钟)
                </span>
              </span>
            </div>
          )}
        </div>

        {/* 评分细则 */}
        <div className="pixel-border bg-card p-4 mb-4">
          <p className="text-accent hud-text text-xs mb-2 text-center">【 评分细则 】</p>
          <div className="space-y-1 text-muted-foreground hud-text text-xs">
            <div className="flex justify-between">
              <span>按压数量 (30秒理想≈27次)</span>
              <span>{Math.min(30, Math.round((totalPresses / 27) * 30))} / 30</span>
            </div>
            <div className="flex justify-between">
              <span>节奏准确度</span>
              <span>{Math.round(perfectRate * 0.5 + goodRate * 0.2)} / 50</span>
            </div>
            <div className="flex justify-between">
              <span>连击加分</span>
              <span>{Math.min(20, Math.round((stats.longestCombo / 10) * 20))} / 20</span>
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div className="pixel-border-yellow bg-accent/10 p-4 mb-4">
          <p className="text-accent hud-text text-xs text-center">
            💡 提示: 注视节奏条指示器，在到达中间绿色区域时按空格键
          </p>
        </div>

        {/* 按钮区 */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleRetry}
            className="pixel-btn bg-primary text-primary-foreground game-title text-base font-bold px-6 py-3 flex-1"
            whileTap={{ scale: 0.97 }}
          >
            🔄 再来一次
          </motion.button>
          <button
            onClick={handleBackToMenu}
            className="pixel-panel hud-text text-sm px-4 py-3"
          >
            返回主页
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PracticeResultScreen;
