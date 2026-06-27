import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GAME_IMAGE_ASSETS, gameImageAssetUrls, preloadGameImages } from '@/game/assets';
import { useGameStore } from '@/game/state';

const MIN_VISIBLE_MS = 600;

const TextureWarmup: React.FC<{ urls: string[]; onReady: () => void }> = ({ urls, onReady }) => {
  const textures = useTexture(urls);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.needsUpdate = true;
    });
    onReady();
  }, [textures, onReady]);

  return null;
};

const LoadingScreen: React.FC = () => {
  const { startGame, setPhase } = useGameStore();
  const [loaded, setLoaded] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('初始化急救现场');
  const [error, setError] = useState<string | null>(null);
  const [imagesReady, setImagesReady] = useState(false);
  const [texturesReady, setTexturesReady] = useState(false);
  const total = GAME_IMAGE_ASSETS.length;
  const progress = useMemo(() => Math.round((loaded / total) * 100), [loaded, total]);
  const textureUrls = useMemo(() => gameImageAssetUrls(), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);
      setLoaded(0);
      setImagesReady(false);
      setTexturesReady(false);
      setCurrentAsset('准备加载 3D 场景资源');

      try {
        await preloadGameImages((nextLoaded, nextTotal, url) => {
          if (cancelled) return;
          setLoaded(nextLoaded);
          setCurrentAsset(url.split('/').slice(-2).join('/'));
          if (nextLoaded === nextTotal) {
            setCurrentAsset('全部资源已就绪');
          }
        });
        if (!cancelled) {
          setImagesReady(true);
          setCurrentAsset('正在预热 3D 纹理缓存');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '资源加载失败');
        }
      }
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!texturesReady) return;
    const timer = window.setTimeout(() => startGame(), MIN_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [texturesReady, startGame]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 pointer-events-none opacity-10 scanline-bg" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pixel-border bg-card p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-accent hud-text text-xs">【 资源加载 】</span>
          <span className="text-primary game-title text-xl font-bold tabular-nums">{progress}%</span>
        </div>

        <div className="h-4 bg-muted border border-border mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <p className="text-foreground hud-text text-sm mb-2">
          正在载入 3D 急救现场，请稍等
        </p>
        <p className="text-muted-foreground hud-text text-xs min-h-5 break-all">
          {loaded}/{total} · {texturesReady ? '3D 纹理已就绪' : currentAsset}
        </p>

        {error && (
          <div className="mt-4 pixel-border border-primary bg-primary/10 p-3">
            <p className="text-primary hud-text text-xs mb-3">{error}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="pixel-btn bg-primary text-primary-foreground hud-text text-xs px-3 py-2"
              >
                重新加载
              </button>
              <button
                type="button"
                onClick={() => setPhase('briefing')}
                className="pixel-panel hud-text text-xs px-3 py-2"
              >
                返回教学
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {imagesReady && !error && (
        <div className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
          <Canvas gl={{ antialias: false }}>
            <Suspense fallback={null}>
              <TextureWarmup urls={textureUrls} onReady={() => setTexturesReady(true)} />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
