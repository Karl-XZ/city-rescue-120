import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface SpriteBillboardProps {
  url: string;
  position?: [number, number, number];
  scale: [number, number, number];
  opacity?: number;
  color?: string;
  renderOrder?: number;
}

const SpriteBillboard: React.FC<SpriteBillboardProps> = ({
  url,
  position = [0, 0, 0],
  scale,
  opacity = 1,
  color = '#ffffff',
  renderOrder = 0,
}) => {
  const texture = useTexture(url);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <sprite position={position} scale={scale} renderOrder={renderOrder}>
      <spriteMaterial
        map={texture}
        color={color}
        opacity={opacity}
        transparent
        alphaTest={0.05}
        depthWrite={false}
      />
    </sprite>
  );
};

export const SpriteGroundShadow: React.FC<{
  position?: [number, number, number];
  radius?: number;
  opacity?: number;
}> = ({ position = [0, 0.025, 0], radius = 0.8, opacity = 0.25 }) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[radius, 32]} />
    <meshBasicMaterial color="#000000" transparent opacity={opacity} depthWrite={false} />
  </mesh>
);

export const GroundSpritePlane: React.FC<{
  url: string;
  position?: [number, number, number];
  size: [number, number];
  opacity?: number;
  renderOrder?: number;
}> = ({
  url,
  position = [0, 0.04, 0],
  size,
  opacity = 1,
  renderOrder = 3,
}) => {
  const texture = useTexture(url);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={renderOrder}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        alphaTest={0.05}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default SpriteBillboard;
