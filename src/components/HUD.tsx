// 游戏 HUD - 抬头显示界面
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/game/state';
import { STEP_LABELS, STEP_HINTS } from '@/game/constants';
import ActionPanel from './ActionPanel';
import RhythmBar from './RhythmBar';

const HUD: React.FC = () => {
  const {
    timeLeft,
    currentStep,
    flowers,
    completedSteps,
    mistakes,
    aedEta,
    ambulanceEta,
    notification,
    notificationColor,
    nearPatient,
    aedArrived,
    activeInteraction,
  } = useGameStore();

  const totalSteps = 11; // 不含 rescued
  const progress = Math.round((completedSteps.length / totalSteps) * 100);
  const isUrgent = timeLeft <= 30;
  const isCprActive = currentStep === 'cpr_active' || currentStep === 'shock_done';

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* ====== 顶部中央：倒计时 ====== */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <motion.div
          animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`pixel-border bg-card px-6 py-2 text-center ${isUrgent ? 'border-primary' : 'border-border'}`}
        >
          <div className={`game-title text-3xl font-bold tabular-nums ${isUrgent ? 'text-primary crt-glow' : 'text-accent crt-glow-yellow'}`}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
            {String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div className="hud-text text-xs text-muted-foreground">倒计时</div>
        </motion.div>
      </div>

      {/* ====== 左上角：当前阶段 ====== */}
      <div className="absolute top-3 left-3">
        <div className="pixel-panel p-3 max-w-[200px]">
          <div className="hud-text text-xs text-muted-foreground mb-1">当前阶段</div>
          <div className="text-primary hud-text text-sm font-bold">
            {STEP_LABELS[currentStep] || currentStep}
          </div>
          {/* 进度条 */}
          <div className="mt-2 w-full h-1.5 bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="hud-text text-xs text-muted-foreground mt-1">
            {completedSteps.length}/{totalSteps} 步骤
          </div>
        </div>
      </div>

      {/* ====== 右上角：小红花与统计 ====== */}
      <div className="absolute top-3 right-3">
        <div className="pixel-panel p-3 text-right min-w-[140px]">
          {/* 小红花 */}
          <div className="flex justify-end gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`text-base ${i <= flowers ? 'opacity-100' : 'opacity-20'}`}>
                🌸
              </span>
            ))}
          </div>
          {/* 错误次数 */}
          <div className="hud-text text-xs text-muted-foreground">
            错误: <span className={mistakes.length > 0 ? 'text-primary' : 'text-foreground'}>
              {mistakes.length}
            </span>
          </div>
          {/* AED ETA */}
          {!aedArrived && aedEta !== null && aedEta > 0 && (
            <div className="hud-text text-xs text-accent mt-1">
              AED 到达: {aedEta}s
            </div>
          )}
          {aedArrived && (
            <div className="hud-text text-xs text-green-400 mt-1">⚡ AED 已到达</div>
          )}
          {/* 救护车 ETA */}
          {ambulanceEta !== null && ambulanceEta > 0 && (
            <div className="hud-text text-xs text-muted-foreground mt-1">
              🚑 {ambulanceEta}s
            </div>
          )}
        </div>
      </div>

      {/* ====== 左下角：操作提示 ====== */}
      <div className="absolute bottom-24 left-3">
        <div className="pixel-panel p-3 max-w-[220px]">
          <div className="hud-text text-xs text-accent mb-1">【 提示 】</div>
          <p className="hud-text text-xs text-foreground leading-relaxed">
            {nearPatient
              ? STEP_HINTS[currentStep] || '按 [E] 交互'
              : '靠近患者以进行急救操作'}
          </p>
          {currentStep === 'aed_ready' && (
            <p className="hud-text text-xs text-accent mt-1">
              按 [E] 打开 AED 后拖拽电极片
            </p>
          )}
        </div>
      </div>

      {/* ====== 右下角：动作面板 ====== */}
      {nearPatient && !activeInteraction && (
        <div className="absolute bottom-24 right-3 pointer-events-auto">
          <ActionPanel />
        </div>
      )}

      {/* ====== 底部：按压节奏条 ====== */}
      {isCprActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 pointer-events-none">
          <RhythmBar />
        </div>
      )}

      {/* ====== 中央通知 ====== */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className={`pixel-border bg-card px-6 py-3 text-center ${
              notificationColor === 'green' ? 'border-green-400' :
              notificationColor === 'red' ? 'border-primary' : 'border-accent'
            }`}>
              <span className={`game-title text-base font-bold ${
                notificationColor === 'green' ? 'text-green-400' :
                notificationColor === 'red' ? 'text-primary' : 'text-accent'
              }`}>
                {notification}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HUD;
