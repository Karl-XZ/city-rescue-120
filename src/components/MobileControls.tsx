// 手机端触屏控制：虚拟摇杆 + 动作按钮
import React, { useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '@/game/state';
import {
  playCompressionSound,
  playErrorSound,
  playAEDSound,
} from '@/audio/sound';

// 将摇杆数据写入 window.__joystickRef（由 CommunityScene 读取）
function setJoystick(x: number, y: number) {
  const ref = (window as unknown as Record<string, unknown>).__joystickRef as
    | React.MutableRefObject<{ x: number; y: number }>
    | undefined;
  if (ref) ref.current = { x, y };
}

// ── 虚拟摇杆 ────────────────────────────────────────────────────────────────
const VirtualJoystick: React.FC = () => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const baseCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const RADIUS = 44; // px

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (activeTouch.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouch.current = touch.identifier;
    const rect = baseRef.current!.getBoundingClientRect();
    baseCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouch.current);
    if (!touch) return;

    let dx = touch.clientX - baseCenter.current.x;
    let dy = touch.clientY - baseCenter.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > RADIUS) { dx = (dx / dist) * RADIUS; dy = (dy / dist) * RADIUS; }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    setJoystick(dx / RADIUS, dy / RADIUS);
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const stillActive = Array.from(e.touches).some(t => t.identifier === activeTouch.current);
    if (stillActive) return;
    activeTouch.current = null;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)';
    }
    setJoystick(0, 0);
  }, []);

  return (
    <div
      ref={baseRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="relative select-none"
      style={{ width: 112, height: 112, touchAction: 'none' }}
    >
      {/* 底座 */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/50 bg-background/40 backdrop-blur-sm" />
      {/* 摇杆旋钮 */}
      <div
        ref={knobRef}
        className="absolute top-1/2 left-1/2 rounded-full bg-primary/80 border-2 border-primary"
        style={{
          width: 48,
          height: 48,
          transform: 'translate(-50%, -50%)',
          transition: 'none',
          boxShadow: '0 0 12px hsl(var(--primary) / 0.6)',
        }}
      />
    </div>
  );
};

// ── 动作按钮 ─────────────────────────────────────────────────────────────────
interface ActionBtnProps {
  label: string;
  sub?: string;
  color?: 'primary' | 'yellow' | 'green';
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const ActionBtn: React.FC<ActionBtnProps> = ({
  label, sub, color = 'primary', onPress, disabled = false, size = 'md',
}) => {
  const colorMap = {
    primary: 'bg-primary/90 border-primary text-primary-foreground',
    yellow:  'bg-accent/90  border-accent  text-accent-foreground',
    green:   'bg-green-600/90 border-green-400 text-white',
  };
  const sizeMap = {
    sm: 'w-14 h-14 text-xs',
    md: 'w-16 h-16 text-sm',
  };

  return (
    <button
      disabled={disabled}
      onTouchStart={(e) => { e.preventDefault(); if (!disabled) onPress(); }}
      onClick={() => { if (!disabled) onPress(); }}
      className={`
        ${colorMap[color]} ${sizeMap[size]}
        rounded-full border-2 font-bold flex flex-col items-center justify-center
        active:scale-90 transition-transform select-none
        disabled:opacity-30 pixel-btn
      `}
      style={{ touchAction: 'manipulation' }}
    >
      <span>{label}</span>
      {sub && <span className="text-[10px] opacity-80 mt-0.5">{sub}</span>}
    </button>
  );
};

// ── 主组件 ───────────────────────────────────────────────────────────────────
const MobileControls: React.FC = () => {
  const {
    phase, currentStep, nearPatient, activeInteraction,
    openAed, pressCompression, startInteraction,
    showNotification,
  } = useGameStore();

  // 阻止摇杆区域触控导致页面滚动
  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-mobile-controls]')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handler, { passive: false });
    return () => document.removeEventListener('touchmove', handler);
  }, []);

  if (phase !== 'playing' || activeInteraction) return null;

  const requireNear = (fn: () => void) => {
    if (!nearPatient) { showNotification('靠近患者后才能操作', 'yellow'); return; }
    fn();
  };

  // E 键动作（覆盖所有 E 步骤）
  const handleE = () => requireNear(() => {
    if (currentStep === 'incident_found')   { startInteraction('scene_scan'); }
    else if (currentStep === 'aed_ready')   { openAed();                      playAEDSound(); }
    else if (currentStep === 'pads_attached') { startInteraction('clear_scan'); }
    else if (currentStep === 'clear_confirmed') { startInteraction('shock_confirm'); }
    else playErrorSound();
  });

  const handleCall = () => requireNear(() => {
    if (currentStep === 'scene_safe')       { startInteraction('phone_call'); }
    else playErrorSound();
  });

  const handleAED = () => requireNear(() => {
    if (currentStep === 'emergency_called') { startInteraction('npc_dialogue'); }
    else playErrorSound();
  });

  const handleCheck3 = () => requireNear(() => {
    if (currentStep === 'aed_requested')    { startInteraction('response_check'); }
    else playErrorSound();
  });

  const handleCheck4 = () => requireNear(() => {
    if (currentStep === 'response_checked') { startInteraction('breath_check'); }
    else playErrorSound();
  });

  const handleCompress = () => {
    pressCompression();
    const rating = useGameStore.getState().lastCompressionRating;
    if (rating) playCompressionSound(rating);
  };

  const isCPR = currentStep === 'cpr_active' || currentStep === 'shock_done' || currentStep === 'breath_checked';
  const isShockReady = currentStep === 'clear_confirmed';

  return (
    <div
      data-mobile-controls
      className="absolute inset-0 pointer-events-none md:hidden"
    >
      {/* 左侧：虚拟摇杆 */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <VirtualJoystick />
      </div>

      {/* 右侧：动作按钮组 */}
      <div className="absolute bottom-8 right-4 pointer-events-auto flex flex-col items-end gap-2">

        {/* 按压按钮 — 在CPR阶段高亮，其余时候半透明显示 */}
        <ActionBtn
          label="按压"
          sub="空格"
          color="primary"
          onPress={handleCompress}
          size="md"
        />

        {/* 电击确认（仅clear_confirmed阶段显示） */}
        {isShockReady && (
          <ActionBtn label="电击" sub="E" color="yellow" onPress={handleE} size="md" />
        )}

        {/* 主交互行 */}
        <div className="flex gap-2">
          <ActionBtn label="E" sub="交互" color="green"  onPress={handleE}    size="sm" />
          <ActionBtn label="1" sub="呼叫" color="yellow" onPress={handleCall}  size="sm" />
          <ActionBtn label="2" sub="AED"  color="yellow" onPress={handleAED}   size="sm" />
        </div>

        {/* 判断行 */}
        <div className="flex gap-2">
          <ActionBtn label="3" sub="意识" onPress={handleCheck3} size="sm" />
          <ActionBtn label="4" sub="呼吸" onPress={handleCheck4} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default MobileControls;
