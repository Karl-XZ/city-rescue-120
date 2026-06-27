// 游戏页 - 主游戏界面，整合3D场景、HUD和键盘控制
import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/game/state';
import CommunityScene from '@/scene/CommunityScene';
import HUD from './HUD';
import MobileControls from './MobileControls';
import InteractionLayer from './interactions/InteractionLayer';
import {
  playCompressionSound,
  playAEDSound,
  playCountdownBeep,
  startHeartbeat,
  stopHeartbeat,
} from '@/audio/sound';

const GameScreen: React.FC = () => {
  const {
    phase,
    currentStep,
    timeLeft,
    nearPatient,
    nearNPC,
    nearNPCId,
    tickTimer,
    openAed,
    pressCompression,
    startInteraction,
    activeInteraction,
    aedArrived,
    showNotification,
  } = useGameStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressedRef = useRef<Set<string>>(new Set());

  // 倒计时 tick
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, tickTimer]);

  // 倒计时音效
  useEffect(() => {
    if (timeLeft === 30 || timeLeft === 10) playCountdownBeep(true);
    else if (timeLeft % 10 === 0 && timeLeft > 0) playCountdownBeep(false);
  }, [timeLeft]);

  // 心跳音效（按压阶段）
  useEffect(() => {
    if (currentStep === 'cpr_active' || currentStep === 'shock_done') {
      startHeartbeat(110);
    } else {
      stopHeartbeat();
    }
    return () => stopHeartbeat();
  }, [currentStep]);

  // AED到达提示
  const prevAedArrived = useRef(false);
  useEffect(() => {
    if (aedArrived && !prevAedArrived.current) {
      prevAedArrived.current = true;
      playAEDSound();
      showNotification('⚡ AED 已到达！请打开设备', 'yellow');
    }
  }, [aedArrived, showNotification]);

  // 键盘事件处理
  const handleKeyAction = useCallback((e: KeyboardEvent) => {
    if (phase !== 'playing') return;
    if (pressedRef.current.has(e.code)) return;
    pressedRef.current.add(e.code);

    // 空格按压在交互中也可用
    if (e.code === 'Space') {
      e.preventDefault();
      pressCompression();
      const rating = useGameStore.getState().lastCompressionRating;
      if (rating) playCompressionSound(rating);
      return;
    }

    if (activeInteraction) return;

    // Enter 键触发当前可用动作的第一个按钮
    if (e.code === 'Enter') {
      e.preventDefault();
      const store = useGameStore.getState();
      const step = store.currentStep;

      // emergency_called 步骤：优先检测靠近 NPC
      if (step === 'emergency_called' && store.nearNPC && store.nearNPCId) {
        if (store.nearNPCId === 'npc1') { store.startInteraction('npc_dialogue_blue'); return; }
        if (store.nearNPCId === 'npc2') { store.startInteraction('npc_dialogue_purple'); return; }
        if (store.nearNPCId === 'npc3') { store.startInteraction('npc_dialogue_elder'); return; }
      }

      if (!nearPatient && step !== 'emergency_called') return;

      // 优先匹配动作面板按钮
      if (step === 'incident_found') { store.startInteraction('scene_scan'); return; }
      if (step === 'scene_safe') { store.startInteraction('phone_call'); return; }
      // emergency_called 步骤需要走到 NPC 面前按 E 才能对话
      if (step === 'emergency_called') { return; }
      if (step === 'aed_requested') { store.startInteraction('response_check'); return; }
      if (step === 'response_checked') { store.startInteraction('breath_check'); return; }
      if (step === 'aed_ready' && store.aedArrived) { store.openAed(); playAEDSound(); return; }
      if (step === 'pads_attached') { store.startInteraction('clear_scan'); return; }
      if (step === 'clear_confirmed') { store.startInteraction('shock_confirm'); return; }

      // 胸外按压阶段
      if (step === 'breath_checked' || step === 'cpr_active' || step === 'shock_done') {
        store.pressCompression();
        const rating = useGameStore.getState().lastCompressionRating;
        if (rating) playCompressionSound(rating);
        return;
      }
      return;
    }

    if (!nearPatient && currentStep !== 'emergency_called') return;

    switch (e.code) {
      case 'KeyE': {
        // emergency_called 步骤：优先检测靠近 NPC
        if (currentStep === 'emergency_called' && nearNPC && nearNPCId) {
          if (nearNPCId === 'npc1') { startInteraction('npc_dialogue_blue'); return; }
          if (nearNPCId === 'npc2') { startInteraction('npc_dialogue_purple'); return; }
          if (nearNPCId === 'npc3') { startInteraction('npc_dialogue_elder'); return; }
        }

        if (currentStep === 'incident_found') {
          startInteraction('scene_scan');
        } else if (currentStep === 'aed_ready') {
          openAed(); playAEDSound();
        } else if (currentStep === 'pads_attached') {
          startInteraction('clear_scan');
        } else if (currentStep === 'clear_confirmed') {
          startInteraction('shock_confirm');
        }
        break;
      }
      case 'Digit1': {
        if (currentStep === 'scene_safe') startInteraction('phone_call');
        break;
      }
      case 'Digit2': {
        // emergency_called 步骤：改为靠近 NPC 按 E 对话
        break;
      }
      case 'Digit3': {
        if (currentStep === 'aed_requested') startInteraction('response_check');
        break;
      }
      case 'Digit4': {
        if (currentStep === 'response_checked') startInteraction('breath_check');
        break;
      }
      case 'Space': {
        e.preventDefault();
        pressCompression();
        const rating = useGameStore.getState().lastCompressionRating;
        if (rating) playCompressionSound(rating);
        break;
      }
    }
  }, [phase, nearPatient, currentStep, openAed, pressCompression, startInteraction, activeInteraction]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    pressedRef.current.delete(e.code);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyAction);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyAction);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyAction, handleKeyUp]);

  // 阶段发光效果（电击时）
  const isShock = currentStep === 'clear_confirmed';

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-background ${isShock ? 'animate-pulse' : ''}`}>
      {/* 3D 场景 */}
      <div className="absolute inset-0">
        <CommunityScene />
      </div>

      {/* HUD 叠加层 */}
      <HUD />

      {/* 手机端触屏控制 */}
      <MobileControls />

      {/* 关键急救步骤交互层 */}
      <InteractionLayer />

      {/* 边缘发光（紧急状态） */}
      {timeLeft <= 30 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-primary opacity-30 animate-pulse" />
        </div>
      )}

      {/* 扫描线 */}
      <div className="absolute inset-0 pointer-events-none scanline-bg opacity-5" />
    </div>
  );
};

export default GameScreen;
