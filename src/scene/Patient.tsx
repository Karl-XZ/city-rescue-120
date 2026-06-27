// 患者贴片立绘
import React from 'react';
import { useGameStore } from '@/game/state';
import SpriteBillboard, { GroundSpritePlane, SpriteGroundShadow } from './SpriteBillboard';

interface PatientModelProps {
  position: [number, number, number];
}

const PatientModel: React.FC<PatientModelProps> = ({ position }) => {
  const { currentStep, activeInteraction, aedPowered, padLeft, padRight, clickPad } = useGameStore();
  const isCareActive = [
    'cpr_active',
    'aed_ready',
    'pads_attached',
    'clear_confirmed',
    'shock_done',
  ].includes(currentStep);
  const isRescued = currentStep === 'rescued';
  const hasAedPads = [
    'pads_attached',
    'clear_confirmed',
    'shock_done',
  ].includes(currentStep);
  const groundSprite = isCareActive
    ? (hasAedPads ? '/assets/characters/patient_05_aed_pads.png' : '/assets/characters/patient_03_cpr_open.png')
    : '/assets/characters/patient_02_collapsed.png';
  const groundSize: [number, number] = isCareActive ? [2.14, 3.56] : [1.85, 3.55];

  return (
    <group position={position}>
      {isRescued ? (
        <>
          <SpriteGroundShadow radius={0.82} opacity={0.28} />
          <SpriteBillboard
            url="/assets/characters/patient_04_recovery.png"
            position={[0, 1.04, 0]}
            scale={[1.85, 2.35, 1]}
            renderOrder={3}
          />
        </>
      ) : (
        <>
          <SpriteGroundShadow radius={isCareActive ? 1.2 : 1.08} opacity={0.26} />
          <GroundSpritePlane
            url={groundSprite}
            position={[0, 0.055, 0]}
            size={groundSize}
            renderOrder={3}
          />
        </>
      )}

      {/* AED贴片目标（pads_attached步骤前显示） */}
      {currentStep === 'aed_ready' && (
        <group>
          {/* 左侧贴片目标 */}
          <mesh
            position={[-0.03, 0.1, -0.78]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(event) => {
              event.stopPropagation();
              if (aedPowered && activeInteraction === 'aed_pad_drag') clickPad('left');
            }}
          >
            <boxGeometry args={[0.16, 0.1, 0.018]} />
            <meshLambertMaterial
              color={padLeft ? '#2ecc71' : '#f39c12'}
              emissive={padLeft ? '#2ecc71' : '#f39c12'}
              emissiveIntensity={activeInteraction === 'aed_pad_drag' ? 1.8 : 0.5}
              opacity={0.92}
              transparent
            />
          </mesh>
          {/* 右侧贴片目标 */}
          <mesh
            position={[0.42, 0.1, -0.56]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(event) => {
              event.stopPropagation();
              if (aedPowered && activeInteraction === 'aed_pad_drag') clickPad('right');
            }}
          >
            <boxGeometry args={[0.18, 0.11, 0.018]} />
            <meshLambertMaterial
              color={padRight ? '#2ecc71' : '#f39c12'}
              emissive={padRight ? '#2ecc71' : '#f39c12'}
              emissiveIntensity={activeInteraction === 'aed_pad_drag' ? 1.8 : 0.5}
              opacity={0.92}
              transparent
            />
          </mesh>
        </group>
      )}

      {/* 状态指示器 */}
      <pointLight
        position={[0, 1.05, -0.2]}
        color={isRescued ? '#2ecc71' : currentStep === 'cpr_active' ? '#e74c3c' : '#f39c12'}
        intensity={0.5}
        distance={3}
      />
    </group>
  );
};

export default PatientModel;
