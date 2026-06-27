import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/game/state';

type ScanZone = 'left' | 'center' | 'right';

const InteractionLayer: React.FC = () => {
  const activeInteraction = useGameStore(state => state.activeInteraction);

  if (!activeInteraction) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {activeInteraction === 'scene_scan' && (
        <ScanTask
          title="确认现场安全"
          action="check_scene"
          confirmLabel="现场安全，呼叫 120"
          hint="直接在 3D 场景中移动视线，观察左侧、前方、右侧。"
        />
      )}
      {activeInteraction === 'phone_call' && <PhoneCallTask />}
      {activeInteraction === 'npc_dialogue' && <NpcDialogueTask />}
      {activeInteraction === 'npc_dialogue_blue' && <NpcDialogueBlueTask />}
      {activeInteraction === 'npc_dialogue_purple' && <NpcDialoguePurpleTask />}
      {activeInteraction === 'npc_dialogue_elder' && <NpcDialogueElderTask />}
      {activeInteraction === 'response_check' && <ResponseCheckTask />}
      {activeInteraction === 'breath_check' && <BreathCheckTask />}
      {activeInteraction === 'aed_pad_drag' && <AedPadSceneTask />}
      {activeInteraction === 'clear_scan' && (
        <ScanTask
          title="电击前清场"
          action="clear_patient"
          confirmLabel="无人接触，允许 AED 分析"
          hint="不要离开 3D 现场，左右扫视确认旁观者、自己和患者之间没有接触。"
        />
      )}
      {activeInteraction === 'shock_confirm' && <ShockConfirmTask />}
      {activeInteraction === 'handover' && <HandoverTask />}
    </div>
  );
};

interface SceneHudProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SceneHud: React.FC<SceneHudProps> = ({ title, children, className = '' }) => (
  <div className={`pixel-panel pointer-events-auto p-3 md:p-4 bg-card/88 backdrop-blur-sm ${className}`}>
    <div className="hud-text text-[11px] text-accent mb-1">场景内急救动作</div>
    <div className="game-title text-lg text-primary font-bold mb-2">{title}</div>
    {children}
  </div>
);

interface ScanTaskProps {
  title: string;
  action: 'check_scene' | 'clear_patient';
  confirmLabel: string;
  hint: string;
}

const ScanTask: React.FC<ScanTaskProps> = ({ title, action, confirmLabel, hint }) => {
  const performAction = useGameStore(state => state.performAction);
  const [seen, setSeen] = useState<Record<ScanZone, boolean>>({
    left: false,
    center: false,
    right: false,
  });
  const movement = useRef(0);

  const markZone = (zone: ScanZone) => {
    setSeen(current => (current[zone] ? current : { ...current, [zone]: true }));
  };

  useEffect(() => {
    markZone('center');

    const onPointerMove = (event: PointerEvent) => {
      movement.current += event.movementX;
      if (movement.current < -90) markZone('left');
      if (movement.current > 90) markZone('right');
      if (Math.abs(movement.current) < 40) markZone('center');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') markZone('left');
      if (event.code === 'ArrowRight' || event.code === 'KeyD') markZone('right');
      if (event.code === 'ArrowUp' || event.code === 'KeyW') markZone('center');
      if (event.code === 'Enter' || event.code === 'KeyE') {
        const state = useGameStore.getState();
        if (state.activeInteraction && seen.left && seen.center && seen.right) {
          performAction(action);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [action, performAction, seen.left, seen.center, seen.right]);

  const complete = seen.left && seen.center && seen.right;
  const zones: Array<{ id: ScanZone; label: string }> = [
    { id: 'left', label: '左侧' },
    { id: 'center', label: '前方' },
    { id: 'right', label: '右侧' },
  ];

  return (
    <SceneHud title={title} className="absolute left-1/2 bottom-6 w-[min(560px,calc(100vw-24px))] -translate-x-1/2">
      <p className="hud-text text-xs text-foreground/90 leading-relaxed mb-3">{hint}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {zones.map(zone => (
          <div
            key={zone.id}
            className={`border px-2 py-2 text-center hud-text text-xs ${
              seen[zone.id] ? 'border-green-400 text-green-300 bg-green-500/10' : 'border-border text-muted-foreground'
            }`}
          >
            {seen[zone.id] ? 'OK' : '--'} {zone.label}
          </div>
        ))}
      </div>
      <button
        disabled={!complete}
        onClick={() => performAction(action)}
        className="pixel-btn bg-primary text-primary-foreground game-title text-sm font-bold px-4 py-2 w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between gap-3"
      >
        <span>{confirmLabel}</span>
        <span className="hud-text text-[10px] opacity-90">[Enter]</span>
      </button>
    </SceneHud>
  );
};

const PhoneCallTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const addMistake = useGameStore(state => state.addMistake);
  const showNotification = useGameStore(state => state.showNotification);
  const [digits, setDigits] = useState('');
  const [questionIndex, setQuestionIndex] = useState(-1);

  const questions = useMemo(() => [
    {
      question: '调度员：请说明具体位置。',
      correct: '东安社区广场，喷泉旁，有人倒地。',
      wrong: '这里有人倒了，你们快点来。',
    },
    {
      question: '调度员：患者现在是什么情况？',
      correct: '成年男性，无反应，无正常呼吸。',
      wrong: '不确定，可能只是睡着了。',
    },
    {
      question: '调度员：现场是否有人协助？',
      correct: '我已指派旁观者去取 AED。',
      wrong: '我先自己随便处理一下。',
    },
  ], []);

  const appendDigit = (value: string) => {
    setDigits(current => (current.length >= 3 ? current : current + value));
  };

  const submitNumber = () => {
    if (digits !== '120') {
      addMistake('wrong_emergency_number');
      showNotification('号码错误：急救电话应输入 120', 'red');
      setDigits('');
      return;
    }
    setQuestionIndex(0);
  };

  const chooseAnswer = (correct: boolean) => {
    if (!correct) {
      addMistake(`unclear_dispatch_answer_${questionIndex + 1}`);
      showNotification('调度信息不清楚，已记录一次错误', 'yellow');
      return;
    }
    if (questionIndex >= questions.length - 1) performAction('call_120');
    else setQuestionIndex(index => index + 1);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (questionIndex >= 0) {
        // 问答阶段：1=正确，2=错误
        if (event.code === 'Digit1') chooseAnswer(true);
        if (event.code === 'Digit2') chooseAnswer(false);
        return;
      }
      if (/^Digit[0-9]$/.test(event.code)) appendDigit(event.code.replace('Digit', ''));
      if (event.code === 'Backspace') setDigits(current => current.slice(0, -1));
      if (event.code === 'Enter') submitNumber();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [digits, questionIndex]);

  if (questionIndex >= 0) {
    const current = questions[questionIndex];
    return (
      <SceneHud title="120 通话中" className="absolute left-1/2 bottom-6 w-[min(680px,calc(100vw-24px))] -translate-x-1/2">
        <p className="hud-text text-sm text-accent mb-3">{current.question}</p>
        <div className="grid md:grid-cols-2 gap-2">
          <button
            onClick={() => chooseAnswer(true)}
            className="pixel-btn bg-primary text-primary-foreground hud-text text-xs md:text-sm px-3 py-3 text-left"
          >
            [1] {current.correct}
          </button>
          <button
            onClick={() => chooseAnswer(false)}
            className="pixel-panel hud-text text-xs md:text-sm px-3 py-3 text-left hover:border-primary transition-colors"
          >
            [2] {current.wrong}
          </button>
        </div>
      </SceneHud>
    );
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '退', '0', '清'];

  return (
    <div className="absolute right-4 bottom-5 pointer-events-auto w-[252px]">
      <div className="pixel-border bg-black/80 p-3 shadow-2xl">
        <div className="hud-text text-[11px] text-accent mb-1">手持手机</div>
        <div className="game-title text-lg text-primary font-bold mb-2">呼叫 120</div>
        <div className="bg-background border border-border h-12 flex items-center justify-center mb-3">
          <span className="game-title text-2xl text-accent tracking-[0.22em]">
            {digits || '___'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {keys.map(key => (
            <button
              key={key}
              onClick={() => {
                if (key === '退') setDigits(current => current.slice(0, -1));
                else if (key === '清') setDigits('');
                else appendDigit(key);
              }}
              className="pixel-btn hud-text text-sm bg-card text-foreground px-2 py-2"
            >
              {key}
            </button>
          ))}
        </div>
        <button
          onClick={submitNumber}
          className="pixel-btn bg-green-600 border-green-400 text-white game-title text-sm font-bold px-4 py-2 mt-3 w-full flex items-center justify-between gap-3"
        >
          <span>拨出</span>
          <span className="hud-text text-[10px] opacity-90">[Enter]</span>
        </button>
      </div>
    </div>
  );
};

const NpcDialogueTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const addMistake = useGameStore(state => state.addMistake);
  const showNotification = useGameStore(state => state.showNotification);

  const choose = (correct: boolean) => {
    if (!correct) {
      addMistake('unclear_aed_assignment');
      showNotification('指令不够明确：需要指定具体的人和任务', 'yellow');
      return;
    }
    performAction('assign_aed');
  };

  // 键盘：1=正确，2=错误
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1') choose(true);
      if (e.code === 'Digit2') choose(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SceneHud title="对旁观者下达明确指令" className="absolute left-1/2 bottom-6 w-[min(760px,calc(100vw-24px))] -translate-x-1/2">
      <p className="hud-text text-sm text-accent mb-3">旁观者：我能帮什么忙？ [1] 正确 [2] 错误</p>
      <div className="grid md:grid-cols-2 gap-2">
        <button
          onClick={() => choose(true)}
          className="pixel-btn bg-primary text-primary-foreground hud-text text-xs md:text-sm px-3 py-3 text-left"
        >
          [1] 你穿蓝色外套，请去广场入口 AED 柜取 AED，拿回来后告诉我。
        </button>
        <button
          onClick={() => choose(false)}
          className="pixel-panel hud-text text-xs md:text-sm px-3 py-3 text-left hover:border-primary transition-colors"
        >
          [2] 有人去拿一下那个机器。
        </button>
      </div>
    </SceneHud>
  );
};

// 蓝衣男性 NPC 对话（npc1）
const NpcDialogueBlueTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const addMistake = useGameStore(state => state.addMistake);
  const showNotification = useGameStore(state => state.showNotification);

  const choose = (correct: boolean) => {
    if (!correct) {
      addMistake('unclear_aed_assignment');
      showNotification('指令不够明确：需要指定具体的人和任务', 'yellow');
      return;
    }
    performAction('assign_aed');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1') choose(true);
      if (e.code === 'Digit2') choose(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SceneHud title="蓝衣男子：需要帮忙吗？" className="absolute left-1/2 bottom-6 w-[min(760px,calc(100vw-24px))] -translate-x-1/2">
      <p className="hud-text text-xs text-muted-foreground mb-2">你走到穿蓝色外套的年轻男子面前</p>
      <p className="hud-text text-sm text-accent mb-3">蓝衣男子：发生什么事了？我能帮忙吗？</p>
      <div className="grid md:grid-cols-2 gap-2">
        <button
          onClick={() => choose(true)}
          className="pixel-btn bg-primary text-primary-foreground hud-text text-xs md:text-sm px-3 py-3 text-left"
        >
          [1] 请去广场入口的 AED 柜取 AED，拿回来告诉我！
        </button>
        <button
          onClick={() => choose(false)}
          className="pixel-panel hud-text text-xs md:text-sm px-3 py-3 text-left hover:border-primary transition-colors"
        >
          [2] 帮我拿一下那边的机器。
        </button>
      </div>
    </SceneHud>
  );
};

// 紫衣女性 NPC 对话（npc2）
const NpcDialoguePurpleTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const addMistake = useGameStore(state => state.addMistake);
  const showNotification = useGameStore(state => state.showNotification);

  const choose = (correct: boolean) => {
    if (!correct) {
      addMistake('unclear_aed_assignment');
      showNotification('指令不够明确：需要指定具体的人和任务', 'yellow');
      return;
    }
    performAction('assign_aed');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1') choose(true);
      if (e.code === 'Digit2') choose(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SceneHud title="紫衣女子：需要帮忙吗？" className="absolute left-1/2 bottom-6 w-[min(760px,calc(100vw-24px))] -translate-x-1/2">
      <p className="hud-text text-xs text-muted-foreground mb-2">你走到穿紫色衣服的年轻女子面前</p>
      <p className="hud-text text-sm text-accent mb-3">紫衣女子：我看到有人倒下了，需要我做什么？</p>
      <div className="grid md:grid-cols-2 gap-2">
        <button
          onClick={() => choose(true)}
          className="pixel-btn bg-primary text-primary-foreground hud-text text-xs md:text-sm px-3 py-3 text-left"
        >
          [1] 请你去那边的 AED 柜拿自动体外除颤器，越快越好！
        </button>
        <button
          onClick={() => choose(false)}
          className="pixel-panel hud-text text-xs md:text-sm px-3 py-3 text-left hover:border-primary transition-colors"
        >
          [2] 你去看看附近有没有什么急救设备。
        </button>
      </div>
    </SceneHud>
  );
};

// 老年人 NPC 对话（npc3）- 拒绝并建议找年轻人
const NpcDialogueElderTask: React.FC = () => {
  const cancelInteraction = useGameStore(state => state.cancelInteraction);
  const showNotification = useGameStore(state => state.showNotification);

  const handleUnderstand = () => {
    cancelInteraction();
    showNotification('老人行动不便，请找旁边的年轻人帮忙', 'yellow');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1' || e.code === 'Enter') handleUnderstand();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SceneHud title="老人：我年纪大了……" className="absolute left-1/2 bottom-6 w-[min(560px,calc(100vw-24px))] -translate-x-1/2">
      <p className="hud-text text-xs text-muted-foreground mb-2">你走到一位老人面前</p>
      <p className="hud-text text-sm text-accent mb-3">
        老人：我腿脚不太方便，跑不动那么远……你还是找那边的年轻人帮忙吧。
      </p>
      <button
        onClick={handleUnderstand}
        className="pixel-btn bg-primary text-primary-foreground hud-text text-sm font-bold px-4 py-3 w-full"
      >
        [1] 好的，您别着急，我去找年轻人帮忙 [Enter]
      </button>
    </SceneHud>
  );
};

const ResponseCheckTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const [checks, setChecks] = useState({ left: false, right: false, call: false });
  const complete = checks.left && checks.right && checks.call;

  // 键盘：1=左肩, 2=右肩, 3=呼唤, Enter=确认
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1') setChecks(c => ({ ...c, left: true }));
      if (e.code === 'Digit2') setChecks(c => ({ ...c, right: true }));
      if (e.code === 'Digit3') setChecks(c => ({ ...c, call: true }));
      if (e.code === 'Enter' && checks.left && checks.right && checks.call) {
        performAction('check_response');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checks]);

  return (
    <SceneHud title="近距离判断意识" className="absolute right-4 bottom-5 w-[min(340px,calc(100vw-24px))]">
      <p className="hud-text text-xs text-foreground/90 leading-relaxed mb-3">
        相机已经贴近患者头肩。依次轻拍双肩并大声呼唤。
      </p>
      <CheckButton done={checks.left} onClick={() => setChecks(current => ({ ...current, left: true }))}>
        [1] 轻拍左肩
      </CheckButton>
      <CheckButton done={checks.right} onClick={() => setChecks(current => ({ ...current, right: true }))}>
        [2] 轻拍右肩
      </CheckButton>
      <CheckButton done={checks.call} onClick={() => setChecks(current => ({ ...current, call: true }))}>
        [3] 大声呼唤：你还好吗？
      </CheckButton>
      <button
        disabled={!complete}
        onClick={() => performAction('check_response')}
        className="pixel-btn bg-primary text-primary-foreground game-title text-sm font-bold px-4 py-2 mt-2 w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        无反应，继续判断呼吸 [Enter]
      </button>
    </SceneHud>
  );
};

const BreathCheckTask: React.FC = () => {
  const performAction = useGameStore(state => state.performAction);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / 5000) * 100));
      setProgress(pct);
      progressRef.current = pct;
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  // 键盘：Enter 确认（需等待进度条满）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && progressRef.current >= 100) {
        performAction('check_breath');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [performAction]);

  return (
    <SceneHud title="观察呼吸 5 秒" className="absolute right-4 bottom-5 w-[min(340px,calc(100vw-24px))]">
      <p className="hud-text text-xs text-foreground/90 leading-relaxed mb-3">
        视线保持在患者口鼻和胸廓，不要把偶发叹息当作正常呼吸。
      </p>
      <div className="h-4 bg-muted border border-border mb-2">
        <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="hud-text text-xs text-accent mb-3">{progress}%</div>
      <button
        disabled={progress < 100}
        onClick={() => performAction('check_breath')}
        className="pixel-btn bg-primary text-primary-foreground game-title text-sm font-bold px-4 py-2 w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        无正常呼吸，开始 CPR [Enter]
      </button>
    </SceneHud>
  );
};

const AedPadSceneTask: React.FC = () => {
  const { padLeft, padRight, clickPad } = useGameStore();

  // 键盘：1=右上胸, 2=左下胸
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1') clickPad('left');
      if (e.code === 'Digit2') clickPad('right');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clickPad]);

  return (
    <SceneHud title="在患者身上安装 AED 贴片" className="absolute right-4 bottom-5 w-[min(360px,calc(100vw-24px))]">
      <p className="hud-text text-xs text-foreground/90 leading-relaxed mb-3">
        看向患者胸部，点击场景中两个发光贴片目标。按钮只是移动端兜底。
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={padLeft}
          onClick={() => clickPad('left')}
          className="pixel-btn-yellow hud-text text-xs px-3 py-3 disabled:opacity-50"
        >
          {padLeft ? '右上胸已贴' : '[1] 右上胸'}
        </button>
        <button
          disabled={padRight}
          onClick={() => clickPad('right')}
          className="pixel-btn-yellow hud-text text-xs px-3 py-3 disabled:opacity-50"
        >
          {padRight ? '左下胸已贴' : '[2] 左下胸'}
        </button>
      </div>
    </SceneHud>
  );
};

const ShockConfirmTask: React.FC = () => {
  const deliverShock = useGameStore(state => state.deliverShock);
  const [countdown, setCountdown] = useState(3);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startHold = () => {
    if (countdown > 0 || holdTimer.current !== null) return;
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      deliverShock();
    }, 700);
  };

  const stopHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyE') startHold();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyE') stopHold();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [countdown]);

  return (
    <SceneHud title="AED 电击确认" className="absolute left-1/2 bottom-6 w-[min(420px,calc(100vw-24px))] -translate-x-1/2 text-center">
      <div className="game-title text-5xl text-accent mb-3">{countdown > 0 ? countdown : 'READY'}</div>
      <button
        disabled={countdown > 0}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={event => {
          event.preventDefault();
          startHold();
        }}
        onTouchEnd={stopHold}
        className="pixel-btn bg-primary text-primary-foreground game-title text-sm font-bold px-5 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        按住 [E] / 长按确认电击
      </button>
    </SceneHud>
  );
};

const HandoverTask: React.FC = () => {
  const completeHandover = useGameStore(state => state.completeHandover);
  const compressionStats = useGameStore(state => state.compressionStats);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = [
    ['location', '地点：东安社区广场喷泉旁'],
    ['status', '患者：成年男性，倒地后无反应'],
    ['breath', '评估：无正常呼吸，已启动 CPR'],
    ['aed', 'AED：已贴片，电击后继续按压'],
    ['count', `按压：累计 ${compressionStats.totalPresses} 次`],
  ];
  const complete = items.every(([key]) => checked[key]);

  // 键盘：1-5 选择交接项，Enter 确认
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].indexOf(e.code);
      if (idx >= 0) {
        setChecked(c => ({ ...c, [items[idx][0]]: true }));
      }
      if (e.code === 'Enter') {
        const currentChecked = useGameStore.getState();
        // 需要重新检查所有项
        const allChecked = items.every(([key]) => checked[key] || (idx >= 0 && items[idx][0] === key));
        if (allChecked) completeHandover();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checked, completeHandover]);

  return (
    <SceneHud title="向医护交接" className="absolute left-1/2 bottom-6 w-[min(700px,calc(100vw-24px))] -translate-x-1/2">
      <div className="grid md:grid-cols-2 gap-2">
        {items.map(([key, label], idx) => (
          <button
            key={key}
            onClick={() => setChecked(current => ({ ...current, [key]: true }))}
            className={`pixel-panel hud-text text-xs px-3 py-2 text-left transition-colors ${
              checked[key] ? 'border-green-400 text-green-300' : 'hover:border-accent'
            }`}
          >
            {checked[key] ? 'OK ' : '-- '}
            [{idx + 1}] {label}
          </button>
        ))}
      </div>
      <button
        disabled={!complete}
        onClick={completeHandover}
        className="pixel-btn bg-primary text-primary-foreground game-title text-sm font-bold px-4 py-2 mt-3 w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        交接完成，查看结果 [Enter]
      </button>
    </SceneHud>
  );
};

interface CheckButtonProps {
  done: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const CheckButton: React.FC<CheckButtonProps> = ({ done, onClick, children }) => (
  <button
    onClick={onClick}
    className={`pixel-panel hud-text text-xs px-3 py-2 text-left w-full mb-2 transition-colors ${
      done ? 'border-green-400 text-green-300' : 'hover:border-accent'
    }`}
  >
    {done ? 'OK ' : '-- '}
    {children}
  </button>
);

export default InteractionLayer;
