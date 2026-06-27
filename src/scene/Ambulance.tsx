// 救护车模型
import React, { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AmbulanceModelProps {
  position: [number, number, number];
}

const AmbulanceModel: React.FC<AmbulanceModelProps> = ({ position }) => {
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);

  // 警报灯闪烁
  useFrame(() => {
    const t = Date.now() * 0.005;
    if (lightRef1.current) lightRef1.current.intensity = Math.sin(t) > 0 ? 2 : 0;
    if (lightRef2.current) lightRef2.current.intensity = Math.sin(t) > 0 ? 0 : 2;
  });

  return (
    <group position={position}>
      {/* 车身 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2, 1.4, 3.5]} />
        <meshLambertMaterial color="#e8e8e8" />
      </mesh>

      {/* 驾驶舱 */}
      <mesh position={[0, 1.15, 1.2]}>
        <boxGeometry args={[1.8, 0.8, 1]} />
        <meshLambertMaterial color="#ddd" />
      </mesh>

      {/* 红十字标志 */}
      <mesh position={[0, 0.9, 1.78]}>
        <boxGeometry args={[0.6, 0.1, 0.05]} />
        <meshLambertMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0, 0.9, 1.78]}>
        <boxGeometry args={[0.1, 0.6, 0.05]} />
        <meshLambertMaterial color="#c0392b" />
      </mesh>

      {/* 警报灯（红） */}
      <mesh position={[-0.4, 1.6, 0.8]}>
        <boxGeometry args={[0.25, 0.15, 0.25]} />
        <meshLambertMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      {/* 警报灯（蓝） */}
      <mesh position={[0.4, 1.6, 0.8]}>
        <boxGeometry args={[0.25, 0.15, 0.25]} />
        <meshLambertMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={1} />
      </mesh>

      {/* 车轮 */}
      {[[-0.8, 0, -1], [0.8, 0, -1], [-0.8, 0, 1], [0.8, 0, 1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshLambertMaterial color="#333" />
        </mesh>
      ))}

      {/* 发光灯 */}
      <pointLight ref={lightRef1} position={[-0.4, 1.8, 0]} color="#ff0000" intensity={2} distance={6} />
      <pointLight ref={lightRef2} position={[0.4, 1.8, 0]} color="#0066ff" intensity={2} distance={6} />

      {/* 标签 */}
      <Suspense fallback={null}>
        <Text
          position={[0, 0.9, -1.8]}
          fontSize={0.25}
          color="#c0392b"
          anchorX="center"
          anchorY="middle"
        >
          {`120 急救`}
        </Text>
      </Suspense>
    </group>
  );
};

export default AmbulanceModel;
