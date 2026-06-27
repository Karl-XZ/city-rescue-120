// 开发说明页 - 项目制作介绍
import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import { playSuccessSound } from '@/audio/sound';

const CreditsScreen: React.FC = () => {
  const { resetGame } = useGameStore();

  const handleBack = () => {
    playSuccessSound();
    resetGame();
  };

  const sections = [
    {
      icon: '🎮',
      title: '游戏设计',
      items: [
        '核心玩法：单局120秒急救模拟',
        '12步完整心搏骤停急救流程',
        '按压节奏小游戏（100-120 BPM判定）',
        'AED操作流程简化教学',
        '5维评分体系 + 小红花激励机制',
      ],
    },
    {
      icon: '💻',
      title: '技术实现',
      items: [
        'React + TypeScript + Vite 前端框架',
        'Three.js / React Three Fiber 3D渲染',
        'Zustand 全局状态管理',
        'Web Audio API 程序化音效生成',
        'Framer Motion 动画效果',
        'Tailwind CSS 像素风格UI',
      ],
    },
    {
      icon: '🏥',
      title: '医学内容参考',
      items: [
        'American Heart Association Hands-Only CPR',
        '中国红十字会 CPR+AED 标准',
        'Mayo Clinic 急救 CPR 说明',
        '所有内容限定为科普模拟用途',
        '实际急救以专业培训和现场指导为准',
      ],
    },
    {
      icon: '🌸',
      title: '公益主题',
      items: [
        '"人人学急救，急救为人人"',
        '小红花象征正确行动与社区互助',
        '降低公众接触急救知识的心理门槛',
        '后续可扩展：老人跌倒、气道异物等场景',
        '长期目标：城市急救科普小游戏合集',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-y-auto py-8 px-4 relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 scanline-bg" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* 标题 */}
        <div className="pixel-border bg-card p-4 mb-6 text-center">
          <h1 className="game-title text-2xl font-bold text-primary crt-glow mb-1">
            城市急救 120 秒
          </h1>
          <p className="text-accent hud-text text-sm">开发说明 · Credits</p>
        </div>

        {/* 内容区 */}
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="pixel-panel p-4 mb-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h2 className="text-accent hud-text text-sm font-bold">{section.title}</h2>
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary hud-text text-xs shrink-0">▷</span>
                  <span className="text-foreground hud-text text-xs">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* 声明 */}
        <div className="bg-muted/30 border border-border p-4 mb-4">
          <p className="text-muted-foreground hud-text text-xs text-center leading-relaxed">
            本游戏所有急救步骤仅用于公益科普和情景模拟，
            不构成医疗建议，不能替代专业机构的线下培训。
            如需学习正式急救技能，请联系当地红十字会或急救中心。
          </p>
        </div>

        {/* 返回按钮 */}
        <motion.button
          onClick={handleBack}
          className="pixel-btn bg-primary text-primary-foreground game-title text-base font-bold px-6 py-3 w-full"
          whileTap={{ scale: 0.97 }}
        >
          ← 返回首页
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CreditsScreen;
