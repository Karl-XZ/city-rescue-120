// 胸外按压节奏条
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/game/state';
import type { CompressionRating } from '@/game/state';
import { COMPRESSION_TIMING } from '@/game/constants';
import { RHYTHM_ZONE_LABEL_POSITIONS, RHYTHM_ZONE_STYLES } from '@/game/rhythm';

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

const RhythmBar: React.FC = () => {
  const { compressionStats, lastCompressionRating } = useGameStore();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const animRef = useRef<number | null>(null);

  // 移动节奏指示器（120BPM → 每秒2次 → 往返1000ms → speed=0.002）
  // 暴露 posRef 到 window 供 pressCompression 读取
  useEffect(() => {
    (window as Window & { __RHYTHM_POS__?: React.MutableRefObject<number> }).__RHYTHM_POS__ = posRef;
  }, []);

  useEffect(() => {
    const speed = 0.002; // 单程500ms，往返1000ms，每秒1圈=2次按压 ≈ 120BPM

    const animate = (timestamp: number) => {
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

  const totalCompressions = compressionStats.totalPresses;
  const goodRate = totalCompressions > 0
    ? Math.round(((compressionStats.perfect + compressionStats.good) / totalCompressions) * 100)
    : 0;

  return (
    <div className="pixel-panel p-3 w-full">
      {/* 标题 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-primary crt-glow hud-text text-xs font-bold">胸外按压节奏</span>
        <span className="text-muted-foreground hud-text text-xs">
          总次数: {totalCompressions}
        </span>
      </div>

      {/* 节奏条 */}
      <div className="relative w-full h-6 bg-muted border border-border mb-2 overflow-hidden">
        {/* 左侧GOOD区域 */}
        <div
          className="absolute top-0 h-full bg-green-600/30 border-r border-green-500/50"
          style={RHYTHM_ZONE_STYLES.leftGood}
        />
        {/* 中间PERFECT区域 */}
        <div
          className="absolute top-0 h-full bg-green-500/20 border-l border-r border-green-500"
          style={RHYTHM_ZONE_STYLES.perfect}
        />
        {/* 右侧GOOD区域 */}
        <div
          className="absolute top-0 h-full bg-green-600/30 border-l border-green-500/50"
          style={RHYTHM_ZONE_STYLES.rightGood}
        />

        {/* 区间标签 */}
        <span className="absolute top-0 hud-text text-xs text-green-400 -translate-x-1/2 leading-5" style={{ left: RHYTHM_ZONE_LABEL_POSITIONS.leftGood }}>
          GOOD
        </span>
        <span className="absolute top-0 hud-text text-xs text-green-300 -translate-x-1/2 leading-5" style={{ left: RHYTHM_ZONE_LABEL_POSITIONS.perfect }}>
          PERF
        </span>
        <span className="absolute top-0 hud-text text-xs text-green-400 -translate-x-1/2 leading-5" style={{ left: RHYTHM_ZONE_LABEL_POSITIONS.rightGood }}>
          GOOD
        </span>

        {/* 移动指示器 */}
        <div
          ref={indicatorRef}
          className="absolute top-0 h-full w-1.5 bg-accent -translate-x-1/2 transition-none"
          style={{ left: '50%' }}
        />
      </div>

      {/* 连击和评分 */}
      <div className="flex justify-between items-center">
        <div className="hud-text text-xs text-muted-foreground">
          连击: <span className="text-accent">{compressionStats.currentCombo}</span>
          <span className="text-muted-foreground/50 ml-1">(最高: {compressionStats.longestCombo})</span>
        </div>
        <div className="hud-text text-xs text-muted-foreground">
          优质率: <span className={goodRate >= 80 ? 'text-green-400' : goodRate >= 60 ? 'text-accent' : 'text-primary'}>
            {goodRate}%
          </span>
        </div>
      </div>

      {/* 最后一次评分 */}
      <AnimatePresence>
        {lastCompressionRating && (
          <motion.div
            key={`${lastCompressionRating}-${compressionStats.totalPresses}`}
            initial={{ opacity: 1, y: 0, scale: 1.2 }}
            animate={{ opacity: 0, y: -20, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`absolute -top-6 left-1/2 -translate-x-1/2 hud-text text-sm font-bold ${RATING_COLORS[lastCompressionRating]}`}
          >
            {RATING_LABELS[lastCompressionRating]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 操作提示 */}
      <div className="mt-2 text-center">
        <span className="hud-text text-xs text-muted-foreground">
          按 <span className="text-accent font-bold">[空格]</span> 按压 · 目标 100-120次/分钟
        </span>
      </div>
    </div>
  );
};

export default RhythmBar;
