// 主游戏入口组件 - 根据游戏阶段渲染对应界面
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGameStore } from '@/game/state';
import StartScreen from '@/components/StartScreen';
import BriefingScreen from '@/components/BriefingScreen';
import LoadingScreen from '@/components/LoadingScreen';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import CreditsScreen from '@/components/CreditsScreen';
import CompressionPracticeScreen from '@/components/CompressionPracticeScreen';
import PracticeResultScreen from '@/components/PracticeResultScreen';

const GameApp: React.FC = () => {
  const { phase } = useGameStore();

  return (
    <div className="w-full min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <StartScreen />
          </motion.div>
        )}

        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <BriefingScreen />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full min-h-screen"
          >
            <LoadingScreen />
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full h-screen"
          >
            <GameScreen />
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <ResultScreen />
          </motion.div>
        )}

        {phase === 'credits' && (
          <motion.div
            key="credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <CreditsScreen />
          </motion.div>
        )}

        {phase === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full min-h-screen"
          >
            <CompressionPracticeScreen />
          </motion.div>
        )}

        {phase === 'practice_result' && (
          <motion.div
            key="practice_result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <PracticeResultScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameApp;
