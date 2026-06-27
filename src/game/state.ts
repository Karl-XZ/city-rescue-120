// 游戏状态类型定义与Zustand Store

import { create } from 'zustand';
import { GAME_DURATION, AED_ARRIVAL_TIME, AMBULANCE_ARRIVAL_TIME, MISTAKE_PENALTIES } from './constants';

export type GamePhase = 'start' | 'briefing' | 'playing' | 'result' | 'credits' | 'practice' | 'practice_result';

export type RescueStep =
  | 'incident_found'
  | 'scene_safe'
  | 'emergency_called'
  | 'aed_requested'
  | 'response_checked'
  | 'breath_checked'
  | 'cpr_active'
  | 'aed_ready'
  | 'pads_attached'
  | 'clear_confirmed'
  | 'shock_done'
  | 'rescued';

export type CompressionRating = 'perfect' | 'good' | 'slow' | 'fast';

export type InteractionMode =
  | 'scene_scan'
  | 'phone_call'
  | 'npc_dialogue'
  | 'npc_dialogue_blue'
  | 'npc_dialogue_purple'
  | 'npc_dialogue_elder'
  | 'response_check'
  | 'breath_check'
  | 'aed_pad_drag'
  | 'clear_scan'
  | 'shock_confirm'
  | 'handover'
  | null;

export interface CompressionStats {
  totalPresses: number;
  perfect: number;
  good: number;
  slow: number;
  fast: number;
  longestCombo: number;
  currentCombo: number;
  lastPressAt: number | null;
}

export interface PracticeStats {
  totalPresses: number;
  perfect: number;
  good: number;
  slow: number;
  fast: number;
  longestCombo: number;
  currentCombo: number;
}

export interface PracticeResult {
  score: number;
  grade: string;
  stats: PracticeStats;
}

export interface GameState {
  phase: GamePhase;
  timeLeft: number;
  currentStep: RescueStep;
  flowers: number;
  score: number;
  grade: string;
  mistakes: string[];
  completedSteps: RescueStep[];
  compressionStats: CompressionStats;
  ambulanceEta: number | null;
  aedEta: number | null;
  aedArrived: boolean;
  aedPowered: boolean;
  ambulanceArrived: boolean;
  lastCompressionRating: CompressionRating | null;
  nearPatient: boolean;
  nearNPC: boolean;
  nearNPCId: string | null;
  showActionMenu: boolean;
  notification: string | null;
  notificationColor: 'green' | 'red' | 'yellow' | null;
  gameStartedAt: number | null;
  padTarget: 'left' | 'right' | null;
  padLeft: boolean;
  padRight: boolean;
  activeInteraction: InteractionMode;
  // 按压练习
  practiceTimeLeft: number;
  practiceStats: PracticeStats;
  practiceLastRating: CompressionRating | null;
  practiceResult: PracticeResult | null;
}

export interface GameStore extends GameState {
  // 控制流
  setPhase: (phase: GamePhase) => void;
  startGame: () => void;
  endGame: (success: boolean) => void;
  resetGame: () => void;

  // 时间
  tickTimer: () => void;

  // 急救动作
  performAction: (action: string) => void;
  openAed: () => void;
  pressCompression: () => void;
  clickPad: (side: 'left' | 'right') => void;
  deliverShock: () => void;
  startInteraction: (mode: Exclude<InteractionMode, null>) => void;
  finishInteraction: () => void;
  cancelInteraction: () => void;
  addMistake: (code: string) => void;
  completeHandover: () => void;

  // NPC
  setNearPatient: (near: boolean) => void;
  setNearNPC: (near: boolean, npcId: string | null) => void;
  setShowActionMenu: (show: boolean) => void;

  // 通知
  showNotification: (msg: string, color: 'green' | 'red' | 'yellow') => void;
  clearNotification: () => void;

  // 按压练习
  startPractice: () => void;
  endPractice: () => void;
  pressPracticeCompression: () => void;
  resetPractice: () => void;
}

const initialCompressionStats: CompressionStats = {
  totalPresses: 0,
  perfect: 0,
  good: 0,
  slow: 0,
  fast: 0,
  longestCombo: 0,
  currentCombo: 0,
  lastPressAt: null,
};

const initialPracticeStats: PracticeStats = {
  totalPresses: 0,
  perfect: 0,
  good: 0,
  slow: 0,
  fast: 0,
  longestCombo: 0,
  currentCombo: 0,
};

const initialGameState: GameState = {
  phase: 'start',
  timeLeft: GAME_DURATION,
  currentStep: 'incident_found',
  flowers: 0,
  score: 0,
  grade: 'F',
  mistakes: [],
  completedSteps: [],
  compressionStats: { ...initialCompressionStats },
  ambulanceEta: null,
  aedEta: null,
  aedArrived: false,
  aedPowered: false,
  ambulanceArrived: false,
  lastCompressionRating: null,
  nearPatient: false,
  nearNPC: false,
  nearNPCId: null,
  showActionMenu: false,
  notification: null,
  notificationColor: null,
  gameStartedAt: null,
  padTarget: 'left',
  padLeft: false,
  padRight: false,
  activeInteraction: null,
  practiceTimeLeft: 30,
  practiceStats: { ...initialPracticeStats },
  practiceLastRating: null,
  practiceResult: null,
};

// 步骤顺序定义
const STEP_ORDER: RescueStep[] = [
  'incident_found',
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

// 动作 → 步骤映射
const ACTION_TO_STEP: Record<string, RescueStep> = {
  check_scene: 'scene_safe',
  call_120: 'emergency_called',
  assign_aed: 'aed_requested',
  check_response: 'response_checked',
  check_breath: 'breath_checked',
  clear_patient: 'clear_confirmed',
};

function calcScore(state: GameState): { score: number; grade: string; flowers: number } {
  const requiredSteps = STEP_ORDER.slice(1);
  const completedRequired = requiredSteps.filter(step => state.completedSteps.includes(step)).length;
  const processAccuracy = Math.min(100, (completedRequired / requiredSteps.length) * 100);

  const elapsed = GAME_DURATION - state.timeLeft;
  const timeEfficiency = Math.max(0, 100 - elapsed * 0.5);

  const { compressionStats } = state;
  const totalCompressions = compressionStats.totalPresses;
  let compressionScore = 50;
  if (totalCompressions > 0) {
    const goodRatio = (compressionStats.perfect + compressionStats.good) / totalCompressions;
    compressionScore = goodRatio * 100;
  }

  const errorPenalty = Math.min(100, state.mistakes.length * 10);
  const errorScore = Math.max(0, 100 - errorPenalty);

  const cooperationScore = state.completedSteps.includes('aed_requested') ? 100 : 0;

  const score = Math.round(
    processAccuracy * 0.4 +
    timeEfficiency * 0.2 +
    compressionScore * 0.2 +
    errorScore * 0.1 +
    cooperationScore * 0.1
  );

  let grade = 'F';
  let flowers = 1;
  if (score >= 90) { grade = 'S'; flowers = 5; }
  else if (score >= 75) { grade = 'A'; flowers = 4; }
  else if (score >= 60) { grade = 'B'; flowers = 3; }
  else if (score >= 40) { grade = 'C'; flowers = 2; }

  return { score, grade, flowers };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  setPhase: (phase) => set({ phase }),

  startGame: () => set({
    ...initialGameState,
    phase: 'playing',
    gameStartedAt: Date.now(),
    timeLeft: GAME_DURATION,
    aedEta: null,
    ambulanceEta: null,
  }),

  endGame: (success) => {
    const state = get();
    const { score, grade, flowers } = calcScore(state);
    set({
      phase: 'result',
      activeInteraction: null,
      score,
      grade,
      flowers: success ? flowers : 1,
    });
  },

  resetGame: () => set({ ...initialGameState }),

  tickTimer: () => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.currentStep === 'rescued') return;

    const newTimeLeft = state.timeLeft - 1;
    const updates: Partial<GameState> = { timeLeft: newTimeLeft };

    // AED 到达
    if (state.aedEta !== null) {
      const newAedEta = state.aedEta - 1;
      updates.aedEta = newAedEta;
      if (newAedEta <= 0 && !state.aedArrived) {
        updates.aedArrived = true;
        updates.aedEta = 0;
      }
    }

    // 救护车到达
    if (state.ambulanceEta !== null) {
      const newAmbEta = state.ambulanceEta - 1;
      updates.ambulanceEta = newAmbEta;
      if (newAmbEta <= 0 && !state.ambulanceArrived) {
        updates.ambulanceArrived = true;
        updates.ambulanceEta = 0;
      }
    }

    // AED 已到，且玩家已经进入 CPR，则推进到 AED 操作阶段。
    if (updates.aedArrived && state.currentStep === 'cpr_active') {
      updates.currentStep = 'aed_ready';
      updates.completedSteps = state.completedSteps.includes('cpr_active')
        ? state.completedSteps
        : [...state.completedSteps, 'cpr_active'];
    }

    // 救护车到达后先进入专业交接。只有已进入有效按压/AED流程才标记为 rescued。
    if (updates.ambulanceArrived) {
      const hasEffectiveRescue =
        state.completedSteps.includes('breath_checked') &&
        (
          state.currentStep === 'cpr_active' ||
          state.currentStep === 'aed_ready' ||
          state.currentStep === 'pads_attached' ||
          state.currentStep === 'clear_confirmed' ||
          state.currentStep === 'shock_done' ||
          state.completedSteps.includes('shock_done')
        );

      if (hasEffectiveRescue) {
        const completedSteps = Array.from(new Set([
          ...state.completedSteps,
          state.currentStep,
          'rescued' as RescueStep,
        ]));
        set({
          ...updates,
          currentStep: 'rescued',
          completedSteps,
          activeInteraction: 'handover',
        });
        get().showNotification('救护车到达，请完成专业交接', 'green');
        return;
      }

      const resultState = { ...state, ...updates };
      const { score, grade } = calcScore(resultState);
      set({
        ...updates,
        phase: 'result',
        score,
        grade,
        flowers: 1,
        activeInteraction: null,
      });
      return;
    }

    // 倒计时结束
    if (newTimeLeft <= 0) {
      set({ ...updates, timeLeft: 0 });
      const { score, grade } = calcScore(state);
      set({ phase: 'result', score, grade, flowers: grade === 'F' ? 1 : calcScore(state).flowers, activeInteraction: null });
      return;
    }

    set(updates);
  },

  performAction: (action) => {
    const state = get();
    if (state.phase !== 'playing') return;

    const targetStep = ACTION_TO_STEP[action];
    if (!targetStep) return;

    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    const targetIndex = STEP_ORDER.indexOf(targetStep);

    // 乱序操作扣分
    if (targetIndex !== currentIndex + 1) {
      const penalty = MISTAKE_PENALTIES.wrong_order;
      const mistakes = [...state.mistakes, `wrong_order:${action}`];
      set({ mistakes });

      // 特殊错误
      if (action === 'compression' && !state.completedSteps.includes('emergency_called')) {
        set({ mistakes: [...mistakes, 'compress_before_call'] });
        get().showNotification('❌ 应先呼叫120再开始按压！', 'red');
        return;
      }

      get().showNotification(`❌ 操作顺序有误，-${penalty}分`, 'red');
      return;
    }

    // 步骤需求检查
    if (action === 'power_aed' && !state.aedArrived) {
      get().showNotification('⏳ AED还未到达，请继续按压等待', 'yellow');
      return;
    }

    const newStep = targetStep;
    const completedSteps = Array.from(new Set([...state.completedSteps, state.currentStep]));
    const updates: Partial<GameState> = { currentStep: newStep, completedSteps, activeInteraction: null };
    if (action === 'call_120') {
      updates.ambulanceEta = AMBULANCE_ARRIVAL_TIME;
    }
    if (action === 'assign_aed') {
      updates.aedEta = AED_ARRIVAL_TIME;
    }
    set(updates);
    get().showNotification(`✓ ${getActionLabel(action)}`, 'green');
  },

  openAed: () => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.currentStep !== 'aed_ready') return;
    if (!state.aedArrived) {
      get().showNotification('⏳ AED还未到达，请继续按压等待', 'yellow');
      return;
    }
    set({ aedPowered: true, activeInteraction: 'aed_pad_drag' });
    get().showNotification('✓ AED已打开，请贴上两片电极片', 'green');
  },

  pressCompression: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    const isActiveStep = state.currentStep === 'cpr_active' || state.currentStep === 'shock_done';
    if (!isActiveStep) {
      if (state.currentStep === 'breath_checked') {
        // 正确顺序，推进状态
        const completedSteps = Array.from(new Set([...state.completedSteps, 'breath_checked' as RescueStep]));
        set({ currentStep: 'cpr_active', completedSteps, activeInteraction: null });
        get().showNotification('✓ 开始胸外按压！保持节奏', 'green');
      }
      return;
    }

    if (state.currentStep === 'shock_done') {
      const completedSteps = Array.from(new Set([...state.completedSteps, 'shock_done' as RescueStep]));
      set({ currentStep: 'cpr_active', completedSteps, activeInteraction: null });
    }

    const now = Date.now();
    const { compressionStats } = state;
    let rating: CompressionRating = 'good';

    // 基于节奏条指示器位置评分（正中间=PERFECT，旁边=GOOD）
    const rhythmPos = (window as Window & { __RHYTHM_POS__?: { current: number } }).__RHYTHM_POS__?.current ?? 0.5;
    const distFromCenter = Math.abs(rhythmPos - 0.5);
    if (distFromCenter <= 0.05) {
      // 正中间 45%-55% → PERFECT
      rating = 'perfect';
    } else if (distFromCenter <= 0.2) {
      // 旁边 30%-45% 或 55%-70% → GOOD
      rating = 'good';
    } else if (rhythmPos < 0.5) {
      // 左端 0%-30% → 太快
      rating = 'fast';
    } else {
      // 右端 70%-100% → 太慢
      rating = 'slow';
    }

    const isGoodOrBetter = rating === 'perfect' || rating === 'good';
    const newCombo = isGoodOrBetter ? compressionStats.currentCombo + 1 : 0;

    const newStats: CompressionStats = {
      ...compressionStats,
      totalPresses: compressionStats.totalPresses + 1,
      [rating]: compressionStats[rating] + 1,
      currentCombo: newCombo,
      longestCombo: Math.max(compressionStats.longestCombo, newCombo),
      lastPressAt: now,
    };

    const updates: Partial<GameState> = {
      compressionStats: newStats,
      lastCompressionRating: rating,
    };

    if (
      state.currentStep === 'cpr_active' &&
      state.aedArrived &&
      newStats.totalPresses >= 5 &&
      !state.completedSteps.includes('cpr_active')
    ) {
      updates.currentStep = 'aed_ready';
      updates.completedSteps = Array.from(new Set([...state.completedSteps, 'cpr_active' as RescueStep]));
    }

    set(updates);
  },

  clickPad: (side) => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.currentStep !== 'aed_ready') return;
    if (!state.aedPowered) {
      get().showNotification('请先打开AED设备', 'yellow');
      return;
    }

    const updates: Partial<GameState> = {};
    if (side === 'left') updates.padLeft = true;
    if (side === 'right') updates.padRight = true;

    const newPadLeft = side === 'left' ? true : state.padLeft;
    const newPadRight = side === 'right' ? true : state.padRight;

    if (newPadLeft && newPadRight) {
      const completedSteps = Array.from(new Set([...state.completedSteps, 'aed_ready' as RescueStep]));
      set({ ...updates, currentStep: 'pads_attached', completedSteps, padLeft: false, padRight: false, activeInteraction: null });
      get().showNotification('✓ AED贴片完成！', 'green');
    } else {
      set(updates);
    }
  },

  deliverShock: () => {
    const state = get();
    if (state.phase !== 'playing') return;
    if (state.currentStep !== 'clear_confirmed') return;
    const completedSteps = Array.from(new Set([...state.completedSteps, 'clear_confirmed' as RescueStep]));
    set({ currentStep: 'shock_done', completedSteps, activeInteraction: null });
    get().showNotification('⚡ 电击完成！继续按压 [空格]', 'yellow');
  },

  startInteraction: (mode) => set({ activeInteraction: mode }),
  finishInteraction: () => set({ activeInteraction: null }),
  cancelInteraction: () => set({ activeInteraction: null }),
  addMistake: (code) => {
    const state = get();
    set({ mistakes: [...state.mistakes, code] });
  },
  completeHandover: () => {
    const state = get();
    const completedSteps = Array.from(new Set([...state.completedSteps, 'rescued' as RescueStep]));
    const resultState: GameState = { ...state, completedSteps, activeInteraction: null };
    const { score, grade, flowers } = calcScore(resultState);
    set({
      completedSteps,
      activeInteraction: null,
      phase: 'result',
      score,
      grade,
      flowers,
    });
  },

  setNearPatient: (near) => set({ nearPatient: near }),
  setNearNPC: (near, npcId) => set({ nearNPC: near, nearNPCId: npcId }),
  setShowActionMenu: (show) => set({ showActionMenu: show }),

  showNotification: (msg, color) => {
    set({ notification: msg, notificationColor: color });
    setTimeout(() => {
      set({ notification: null, notificationColor: null });
    }, 2500);
  },

  clearNotification: () => set({ notification: null, notificationColor: null }),

  // 按压练习
  startPractice: () => set({
    phase: 'practice',
    practiceTimeLeft: 30,
    practiceStats: { ...initialPracticeStats },
    practiceLastRating: null,
    practiceResult: null,
  }),

  endPractice: () => {
    const state = get();
    const { practiceStats } = state;

    // 计算练习评分（满分100）
    let score = 0;
    if (practiceStats.totalPresses > 0) {
      const perfectRatio = practiceStats.perfect / practiceStats.totalPresses;
      const goodRatio = (practiceStats.perfect + practiceStats.good) / practiceStats.totalPresses;
      const totalPresses = practiceStats.totalPresses;

      // 按压数量分 (30秒理想约27-30次) - 30分
      const quantityScore = Math.min(30, (totalPresses / 27) * 30);

      // 节奏准确度 - 50分
      const accuracyScore = perfectRatio * 50 + goodRatio * 20;

      // 连击加分 - 20分
      const comboScore = Math.min(20, (practiceStats.longestCombo / 10) * 20);

      score = Math.round(quantityScore + accuracyScore + comboScore);
    }

    let grade = 'F';
    if (score >= 90) grade = 'S';
    else if (score >= 75) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';

    set({
      phase: 'practice_result',
      practiceResult: {
        score,
        grade,
        stats: { ...practiceStats },
      },
    });
  },

  pressPracticeCompression: () => {
    const state = get();
    if (state.phase !== 'practice') return;

    const { practiceStats } = state;
    let rating: CompressionRating = 'good';

    const rhythmPos = (window as Window & { __RHYTHM_POS__?: { current: number } }).__RHYTHM_POS__?.current ?? 0.5;
    const distFromCenter = Math.abs(rhythmPos - 0.5);
    if (distFromCenter <= 0.05) {
      rating = 'perfect';
    } else if (distFromCenter <= 0.2) {
      rating = 'good';
    } else if (rhythmPos < 0.5) {
      rating = 'fast';
    } else {
      rating = 'slow';
    }

    const isGoodOrBetter = rating === 'perfect' || rating === 'good';
    const newCombo = isGoodOrBetter ? practiceStats.currentCombo + 1 : 0;

    set({
      practiceStats: {
        ...practiceStats,
        totalPresses: practiceStats.totalPresses + 1,
        [rating]: practiceStats[rating] + 1,
        currentCombo: newCombo,
        longestCombo: Math.max(practiceStats.longestCombo, newCombo),
      },
      practiceLastRating: rating,
    });
  },

  resetPractice: () => set({
    phase: 'start',
    practiceTimeLeft: 30,
    practiceStats: { ...initialPracticeStats },
    practiceLastRating: null,
    practiceResult: null,
  }),
}));

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as Window & { __CITY_RESCUE_STORE__?: typeof useGameStore }).__CITY_RESCUE_STORE__ = useGameStore;
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    check_scene: '确认现场安全',
    call_120: '已呼叫120',
    assign_aed: '已指派取AED',
    check_response: '已判断意识',
    check_breath: '已判断呼吸',
    power_aed: '已打开AED',
    clear_patient: '已确认无人接触',
  };
  return labels[action] || action;
}
