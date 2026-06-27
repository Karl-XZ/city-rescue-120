// 按压练习页 - 30秒独立按压训练
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/game/state';
import type { CompressionRating } from '@/game/state';
import { playCompressionSound } from '@/audio/sound';

const RATING_COLORS: Record<CompressionRating, string> = {
  perfect: 'text-green-400',
  good: 'text-accent',
  slow: 'text-blue-400',
  fast: 'text-primary',
};

const RATING_LABELS: Record<CompressionRating, string> = {
  perfect: 'PERFECT!',
  good: 'GOOD',
  slow: '太慢了',
  fast: '太快了',
};

const PRACTICE_DURATION = 30;

const CompressionPracticeScreen: React.FC = () => {
  const {
    practiceTimeLeft,
    practiceStats,
    practiceLastRating,
    endPractice,
    pressPracticeCompression,
  } = useGameStore();

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  // 暴露 posRef 供评分读取
  useEffect(() => {
    (window as Window & { __RHYTHM_POS__?: React.MutableRefObject<number> }).__RHYTHM_POS__ = posRef;
  }, []);

  // 节奏指示器动画
  useEffect(() => {
    const speed = 0.002; // 单程500ms，往返1000ms，每秒2次按压 ≈ 120BPM

    const animate = (_timestamp: number) => {
      let prev = 0;
      const step = (ts: number) => {
        const delta = ts - prev;
        prev = ts;

        posRef.current += speed * delta * dirRef.current;
        if (posRef.current >= 1) {
          posRef.current = 1;
          dirRef.current = -1;
        } else if (posRef.current <= 0) {
          posRef.current = 0;
          dirRef.current = 1;
        }

        if (indicatorRef.current) {
          indicatorRef.current.style.left = `${posRef.current * 100}%`;
        }
        animRef.current = requestAnimationFrame(step);
      };

      animRef.current = requestAnimationFrame(step);
    };

    animate(0);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // 30秒倒计时
  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, PRACTICE_DURATION - elapsed);
      useGameStore.setState({ practiceTimeLeft: remaining });

      if (remaining <= 0) {
        if (timerRef.current !== null) clearInterval(timerRef.current);
        endPractice();
      }
    }, 50);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [endPractice]);

  // 空格键按压
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      pressPracticeCompression();
      // 根据节奏位置预估评分来播放对应音效
      const rhythmPos = (window as Window & { __RHYTHM_POS__?: { current: number } }).__RHYTHM_POS__?.current ?? 0.5;
      const distFromCenter = Math.abs(rhythmPos - 0.5);
      let rating: 'perfect' | 'good' | 'slow' | 'fast' = 'good';
      if (distFromCenter <= 0.05) rating = 'perfect';
      else if (distFromCenter <= 0.2) rating = 'good';
      else if (rhythmPos < 0.5) rating = 'fast';
      else rating = 'slow';
      playCompressionSound(rating);
    }
  }, [pressPracticeCompression]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const elapsed = PRACTICE_DURATION - practiceTimeLeft;
  const totalPresses = practiceStats.totalPresses;
  const goodRate = totalPresses > 0
    ? Math.round(((practiceStats.perfect + practiceStats.good) / totalPresses) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* 扫描线背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-10 scanline-bg" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg px-4"
      >
        {/* 标题与倒计时 */}
        <div className="pixel-border bg-card p-4 mb-4 text-center">
          <h1 className="game-title text-xl font-bold text-primary crt-glow mb-1">
            胸外按压练习
          </h1>
          <div className="flex justify-center items-center gap-4">
            <span className="text-muted-foreground hud-text text-sm">
              剩余时间
            </span>
            <span className={`game-title text-3xl font-bold ${
              practiceTimeLeft <= 5 ? 'text-primary crt-glow' : 'text-accent'
            }`}>
              {Math.ceil(practiceTimeLeft)}s
            </span>
            <span className="text-muted-foreground hud-text text-sm">
              已过{Math.floor(elapsed)}s
            </span>
          </div>
          {/* 进度条 */}
          <div className="w-full h-2 bg-muted border border-border mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              style={{ width: `${(elapsed / PRACTICE_DURATION) * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>

        {/* 节奏条 */}
        <div className="pixel-panel p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-primary crt-glow hud-text text-xs font-bold">
              按压节奏
            </span>
            <span className="text-muted-foreground hud-text text-xs">
              次数: {totalPresses}
            </span>
          </div>

          {/* 节奏条可视化 */}
          <div className="relative w-full h-8 bg-muted border border-border mb-2 overflow-hidden">
            {/* GOOD 区域 */}
            <div
              className="absolute top-0 h-full bg-green-600/30 border-r border-green-500/50"
              style={{ left: '30%', width: '15%' }}
            />
            {/* PERFECT 区域 */}
            <div
              className="absolute top-0 h-full bg-green-500/20 border-l border-r border-green-500"
              style={{ left: '45%', width: '10%' }}
            />
            {/* GOOD 区域 */}
            <div
              className="absolute top-0 h-full bg-green-600/30 border-l border-green-500/50"
              style={{ left: '55%', width: '15%' }}
            />

            {/* 标签 */}
            <span className="absolute left-[37.5%] top-0 hud-text text-xs text-green-400 -translate-x-1/2 leading-7">
              GOOD
            </span>
            <span className="absolute left-[50%] top-0 hud-text text-xs text-green-300 -translate-x-1/2 leading-7">
              PERF
            </span>
            <span className="absolute left-[62.5%] top-0 hud-text text-xs text-green-400 -translate-x-1/2 leading-7">
              GOOD
            </span>

            {/* 移动指示器 */}
            <div
              ref={indicatorRef}
              className="absolute top-0 h-full w-1.5 bg-accent -translate-x-1/2 transition-none"
              style={{ left: '50%' }}
            />
          </div>

          {/* 评分动画 */}
          <div className="relative h-8">
            <AnimatePresence>
              {practiceLastRating && (
                <motion.div
                  key={`${practiceLastRating}-${totalPresses}`}
                  initial={{ opacity: 1, y: 0, scale: 1.2 }}
                  animate={{ opacity: 0, y: -20, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute top-0 left-1/2 -translate-x-1/2 hud-text text-base font-bold ${RATING_COLORS[practiceLastRating]}`}
                >
                  {RATING_LABELS[practiceLastRating]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 连击 */}
          <div className="flex justify-between items-center mt-1">
            <div className="hud-text text-xs text-muted-foreground">
              连击: <span className="text-accent">{practiceStats.currentCombo}</span>
              <span className="text-muted-foreground/50 ml-1">
                (最高: {practiceStats.longestCombo})
              </span>
            </div>
            <div className="hud-text text-xs text-muted-foreground">
              优质率: <span className={
                goodRate >= 80 ? 'text-green-400' : goodRate >= 60 ? 'text-accent' : 'text-primary'
              }>
                {goodRate}%
              </span>
            </div>
          </div>
        </div>

        {/* 实时统计 */}
        <div className="pixel-border bg-card p-4 mb-4">
          <p className="text-accent hud-text text-xs mb-3 text-center">【 实时统计 】</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['perfect', 'good', 'slow', 'fast'] as const).map((r) => (
              <div key={r} className="pixel-panel p-2">
                <div className={`hud-text text-lg font-bold ${
                  r === 'perfect' ? 'text-green-400' :
                  r === 'good' ? 'text-accent' :
                  r === 'slow' ? 'text-blue-400' : 'text-primary'
                }`}>
                  {practiceStats[r]}
                </div>
                <div className="text-muted-foreground hud-text text-xs capitalize">{r}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作提示 */}
        <div className="text-center">
          <span className="hud-text text-sm text-muted-foreground">
            按 <span className="text-accent font-bold text-lg">[空格]</span> 进行胸外按压
          </span>
          <p className="text-muted-foreground hud-text text-xs mt-1">
            目标频率: 100-120次/分钟 · 指示器在中间时为 PERFECT
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CompressionPracticeScreen;
