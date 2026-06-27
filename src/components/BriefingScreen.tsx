// 教学页 - 30秒教学引导
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/game/state';
import { playSuccessSound } from '@/audio/sound';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 1,
    icon: '🏃',
    title: '移动与靠近',
    content: [
      '[WASD] 键控制角色移动',
      '靠近患者后可以进行互动',
      '场景中有 AED 站点和旁观者 NPC',
      '注意观察场景中的黄色高亮提示',
    ],
    tip: '先靠近患者，才能看到可用的急救动作',
  },
  {
    id: 2,
    icon: '🆘',
    title: '急救行动链',
    content: [
      '① 确认现场安全 [E]',
      '② 呼叫 120 急救 [1]',
      '③ 指派旁观者取 AED [2]',
      '④ 判断意识 [3] → 判断呼吸 [4]',
    ],
    tip: '按照正确顺序操作，乱序会导致扣分',
  },
  {
    id: 3,
    icon: '💓',
    title: '胸外按压节奏',
    content: [
      '[空格键] 进行一次胸外按压',
      '目标节奏：100-120 次/分钟',
      'PERFECT：每次间隔 500-600ms',
      'GOOD：460-680ms 都算合格',
    ],
    tip: '保持稳定节奏，连击越高评分越好',
  },
  {
    id: 4,
    icon: '⚡',
    title: 'AED 操作',
    content: [
      'AED 由旁观者取回后变为可用状态',
      '[E] 打开 AED 设备',
      '点击患者身上的 2 个高亮区域完成贴片',
      '[E] 确认无人接触 → 模拟电击',
    ],
    tip: '电击时任何人都不能接触患者！',
  },
  {
    id: 5,
    icon: '🌸',
    title: '评分与小红花',
    content: [
      '流程正确率 40% · 时间效率 20%',
      '按压节奏 20% · 错误控制 10%',
      '公益协作 10%',
      'S级5朵🌸 · A级4朵🌸 · B级3朵🌸',
    ],
    tip: '120秒内完成全程可获得最高评分',
  },
];

const BriefingScreen: React.FC = () => {
  const { setPhase } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      playSuccessSound();
      setPhase('loading');
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* 扫描线背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-10 scanline-bg" />

      <motion.div
        className="relative z-10 w-full max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 标题栏 */}
        <div className="pixel-border bg-card p-3 mb-4 flex items-center justify-between">
          <span className="text-accent hud-text text-xs">急救教学</span>
          <span className="text-muted-foreground hud-text text-xs">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>
        </div>

        {/* 进度条 */}
        <div className="flex gap-1 mb-6">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 border border-border transition-colors ${
                i <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* 内容卡片 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pixel-border bg-card p-6 mb-4"
          >
            {/* 步骤标题 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{step.icon}</span>
              <h2 className="text-primary crt-glow game-title text-xl font-bold">
                {step.title}
              </h2>
            </div>

            {/* 内容列表 */}
            <ul className="space-y-2 mb-4">
              {step.content.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-foreground hud-text text-sm"
                >
                  <span className="text-accent shrink-0">▷</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* 提示 */}
            <div className="pixel-border-yellow bg-accent/10 p-3">
              <p className="text-accent hud-text text-xs">
                💡 提示：{step.tip}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 按钮区 */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="pixel-panel hud-text text-sm px-4 py-3 flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          <motion.button
            onClick={handleNext}
            className="pixel-btn bg-primary text-primary-foreground game-title text-base font-bold px-6 py-3 flex-1 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            {isLast ? (
              <>
                <span>开始急救！</span>
                <span>🚑</span>
              </>
            ) : (
              <>
                <span>下一步</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* 跳过按钮 */}
        {!isLast && (
          <button
            onClick={() => { playSuccessSound(); setPhase('loading'); }}
            className="w-full mt-3 text-muted-foreground hud-text text-xs py-2 hover:text-foreground transition-colors"
          >
            跳过教学，直接开始
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default BriefingScreen;
