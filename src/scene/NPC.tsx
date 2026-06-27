// NPC 旁观者/医护贴片立绘
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/game/state';
import SpriteBillboard, { SpriteGroundShadow } from './SpriteBillboard';

interface NPCModelProps {
  id?: string;
  position: [number, number, number];
  color?: string;
  spriteUrl?: string;
  height?: number;
  marker?: boolean;
}

const NPCModel: React.FC<NPCModelProps> = ({
  id,
  position,
  color = '#ffffff',
  spriteUrl = '/assets/characters/bystander_01_phone.png',
  height = 2.3,
  marker = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { currentStep, nearNPCId } = useGameStore();

  // 旁观者轻微摇摆
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0015 + position[0]) * 0.025;
    }
  });

  const isAssigned = currentStep === 'aed_requested' ||
    STEP_AFTER_AED.includes(currentStep);
  const width = height * 0.56;

  // 在"呼叫120后"步骤，玩家靠近NPC时显示交互提示
  const showInteractHint = id && currentStep === 'emergency_called' && nearNPCId === id;

  return (
    <group ref={groupRef} position={position}>
      <SpriteGroundShadow radius={0.5} opacity={0.22} />
      <SpriteBillboard
        url={spriteUrl}
        position={[0, height / 2, 0]}
        scale={[width, height, 1]}
        color={isAssigned && marker ? '#d9ffdf' : color}
        renderOrder={2}
      />

      {/* 任务标记 */}
      {isAssigned && marker && (
        <mesh position={[0, height + 0.25, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshLambertMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={2} />
        </mesh>
      )}

      {/* 可交互提示 - 玩家靠近时显示 */}
      {showInteractHint && (
        <>
          <mesh position={[0, height + 0.4, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshLambertMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={3} />
          </mesh>
          <Text
            position={[0, height + 0.8, 0]}
            fontSize={0.22}
            color="#f39c12"
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.04}
          >
            [E] 对话
          </Text>
        </>
      )}
    </group>
  );
};

const STEP_AFTER_AED = [
  'response_checked',
  'breath_checked',
  'cpr_active',
  'aed_ready',
  'pads_attached',
  'clear_confirmed',
  'shock_done',
  'rescued',
];

export default NPCModel;
