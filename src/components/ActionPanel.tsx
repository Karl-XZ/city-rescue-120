// 急救动作面板 - 右下角交互按钮组
import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import {
  playAEDSound, playCompressionSound,
} from '@/audio/sound';

interface ActionButton {
  id: string;
  label: string;
  key: string;
  icon: string;
  condition: string[];
}

const ACTIONS: ActionButton[] = [
  { id: 'check_scene',    label: '确认安全',   key: 'E / Enter', icon: '🔍', condition: ['incident_found'] },
  { id: 'call_120',       label: '呼叫120',    key: '1 / Enter', icon: '📞', condition: ['scene_safe'] },
  { id: 'check_response', label: '判断意识',   key: '3 / Enter', icon: '👁️', condition: ['aed_requested'] },
  { id: 'check_breath',   label: '判断呼吸',   key: '4 / Enter', icon: '💨', condition: ['response_checked'] },
  { id: 'power_aed',      label: '打开AED',    key: 'E / Enter', icon: '⚡', condition: ['aed_ready'] },
  { id: 'clear_patient',  label: '确认清场',   key: 'E / Enter', icon: '🚫', condition: ['pads_attached'] },
  { id: 'deliver_shock',  label: '确认电击',   key: 'E / Enter', icon: '⚡', condition: ['clear_confirmed'] },
];

const ActionPanel: React.FC = () => {
  const {
    currentStep, openAed, pressCompression, aedArrived, startInteraction,
  } = useGameStore();

  const availableActions = ACTIONS.filter(a => a.condition.includes(currentStep));
  const showCprBtn = currentStep === 'breath_checked'
    || currentStep === 'cpr_active'
    || currentStep === 'shock_done';

  const handleAction = (actionId: string) => {
    if (actionId === 'deliver_shock') {
      startInteraction('shock_confirm');
    } else if (actionId === 'power_aed') {
      playAEDSound();
      openAed();
    } else if (actionId === 'clear_patient') {
      startInteraction('clear_scan');
    } else if (actionId === 'check_scene') {
      startInteraction('scene_scan');
    } else if (actionId === 'call_120') {
      startInteraction('phone_call');
    } else if (actionId === 'check_response') {
      startInteraction('response_check');
    } else if (actionId === 'check_breath') {
      startInteraction('breath_check');
    } else {
      startInteraction('scene_scan');
    }
  };

  const handleCompress = () => {
    pressCompression();
    const rating = useGameStore.getState().lastCompressionRating;
    if (rating) playCompressionSound(rating);
  };

  if (availableActions.length === 0 && !showCprBtn && currentStep !== 'emergency_called') return null;

  return (
    <div className="pixel-panel p-3 min-w-[160px]">
      <p className="text-accent hud-text text-xs mb-2 text-center">【 可用动作 】</p>
      <div className="flex flex-col gap-2">
        {/* emergency_called 步骤：提示找 NPC */}
        {currentStep === 'emergency_called' && (
          <div className="pixel-border-yellow bg-accent/10 p-2 text-center">
            <p className="text-accent hud-text text-xs font-bold mb-1">🏃 找人取AED</p>
            <p className="text-muted-foreground hud-text text-xs leading-relaxed">
              走到广场上的旁观者面前，按 [E] 对话请他们帮忙取 AED
            </p>
          </div>
        )}

        {availableActions.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => handleAction(action.id)}
            whileTap={{ scale: 0.95 }}
            disabled={action.id === 'power_aed' && !aedArrived}
            className={`pixel-btn text-sm font-bold px-3 py-2 flex items-center gap-2 w-full text-left ${
              action.id === 'power_aed' && !aedArrived
                ? 'opacity-40 cursor-not-allowed border-muted'
                : action.id === 'deliver_shock'
                  ? 'bg-accent text-accent-foreground cursor-pointer border-accent'
                  : 'bg-primary text-primary-foreground cursor-pointer'
            }`}
          >
            <span>{action.icon}</span>
            <span className="flex-1 hud-text">{action.label}</span>
            <span className="bg-muted text-muted-foreground hud-text text-xs px-1 py-0.5 border border-border">
              [{action.key}]
            </span>
          </motion.button>
        ))}

        {/* 胸外按压可点击按钮 */}
        {showCprBtn && (
          <motion.button
            onClick={handleCompress}
            whileTap={{ scale: 0.9 }}
            className="pixel-btn bg-primary text-primary-foreground text-sm font-bold px-3 py-2 flex items-center gap-2 w-full text-left"
          >
            <span>💓</span>
            <span className="flex-1 hud-text">胸外按压</span>
            <span className="bg-muted text-muted-foreground hud-text text-xs px-1 py-0.5 border border-border">
              [空格 / Enter]
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
