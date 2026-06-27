// 音效系统 - 使用 Web Audio API 生成程序化音效

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// 创建简单音调
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.3,
  delay = 0
): void {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch {
    // 静默失败
  }
}

// 按压音效（心跳感）
export function playCompressionSound(rating: 'perfect' | 'good' | 'slow' | 'fast'): void {
  const freqMap = {
    perfect: 220,
    good: 180,
    slow: 120,
    fast: 260,
  };
  playTone(freqMap[rating], 0.08, 'square', 0.25);
}

// 成功步骤音效
export function playSuccessSound(): void {
  playTone(523, 0.1, 'square', 0.3, 0);
  playTone(659, 0.1, 'square', 0.3, 0.1);
  playTone(784, 0.15, 'square', 0.3, 0.2);
}

// 错误音效
export function playErrorSound(): void {
  playTone(150, 0.2, 'sawtooth', 0.3, 0);
  playTone(100, 0.3, 'sawtooth', 0.25, 0.1);
}

// 警告音效
export function playWarningSound(): void {
  playTone(440, 0.1, 'square', 0.25, 0);
  playTone(440, 0.1, 'square', 0.25, 0.2);
}

// 倒计时提示音
export function playCountdownBeep(urgent = false): void {
  if (urgent) {
    playTone(880, 0.05, 'square', 0.4, 0);
    playTone(880, 0.05, 'square', 0.4, 0.1);
  } else {
    playTone(660, 0.05, 'square', 0.3);
  }
}

// 救护车音效（模拟警报）
export function playAmbulanceSiren(volume = 0.2): void {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.0);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 1.0);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.0);
  } catch {
    // 静默失败
  }
}

// AED提示音（电子感）
export function playAEDSound(): void {
  playTone(1047, 0.05, 'square', 0.2, 0);
  playTone(1319, 0.05, 'square', 0.2, 0.1);
  playTone(1047, 0.05, 'square', 0.2, 0.2);
  playTone(1319, 0.1, 'square', 0.3, 0.3);
}

// 电击音效
export function playShockSound(): void {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // 静默失败
  }
}

// 小红花奖励音效
export function playFlowerSound(count: number): void {
  const baseFreqs = [523, 659, 784, 1047, 1319];
  for (let i = 0; i < Math.min(count, 5); i++) {
    playTone(baseFreqs[i], 0.15, 'square', 0.3, i * 0.12);
  }
}

// 结算欢呼音效
export function playCelebrationSound(): void {
  const melody = [523, 659, 784, 659, 784, 1047];
  melody.forEach((freq, i) => {
    playTone(freq, 0.1, 'square', 0.3, i * 0.1);
  });
}

// 心跳背景音（用于按压阶段）
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat(bpm = 110): void {
  stopHeartbeat();
  const interval = (60 / bpm) * 1000;
  heartbeatInterval = setInterval(() => {
    playTone(80, 0.05, 'square', 0.15);
    setTimeout(() => playTone(60, 0.04, 'square', 0.1), 80);
  }, interval);
}

export function stopHeartbeat(): void {
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// 解锁音频上下文（需要用户交互触发）
export function unlockAudio(): void {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  } else {
    getAudioCtx();
  }
}
