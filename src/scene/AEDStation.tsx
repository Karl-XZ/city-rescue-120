// AED 站点模型
import React, { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AEDStationProps {
  position: [number, number, number];
  aedTaken?: boolean;
}

const AEDStation: React.FC<AEDStationProps> = ({ position, aedTaken = false }) => {
  const lightRef = useRef<THREE.PointLight>(null);

  // 指示灯闪烁
  useFrame(() => {
    if (lightRef.current && !aedTaken) {
      lightRef.current.intensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* 底座 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.3]} />
        <meshLambertMaterial color="#c0392b" />
      </mesh>

      {/* AED 设备箱 */}
      {!aedTaken && (
        <mesh position={[0, 0.7, 0.2]}>
          <boxGeometry args={[0.5, 0.5, 0.3]} />
          <meshLambertMaterial color="#e74c3c" />
        </mesh>
      )}

      {/* 绿色指示灯 */}
      {!aedTaken && (
        <>
          <mesh position={[0.2, 1.1, 0.16]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshLambertMaterial color="#2ecc71" emissive="#2ecc71" emissiveIntensity={2} />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[0, 1.2, 0.3]}
            color="#2ecc71"
            intensity={0.6}
            distance={4}
          />
        </>
      )}

      {/* 标牌 */}
      <mesh position={[0, 1.3, 0.16]}>
        <boxGeometry args={[0.7, 0.25, 0.05]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[0, 1.3, 0.2]}
          fontSize={0.12}
          color="#c0392b"
          anchorX="center"
          anchorY="middle"
        >
          {aedTaken ? 'AED 已取用' : 'AED'}
        </Text>
      </Suspense>

      {/* 发光效果 */}
      {!aedTaken && (
        <pointLight position={[0, 0.5, 0]} color="#e74c3c" intensity={0.3} distance={3} />
      )}
    </group>
  );
};

export default AEDStation;
