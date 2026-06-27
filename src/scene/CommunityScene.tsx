// 城市社区广场 3D 场景
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/game/state';
import { gameAssetUrl } from '@/game/assets';
import { POSITIONS, INTERACTION_DISTANCE } from '@/game/constants';
import PatientModel from './Patient';
import AEDStation from './AEDStation';
import AmbulanceModel from './Ambulance';
import NPCModel from './NPC';

// 地面
const Ground: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[28, 28]} />
    <meshLambertMaterial color="#1a2035" />
  </mesh>
);

const SceneLoadingFallback: React.FC = () => (
  <group>
    <ambientLight intensity={0.8} color="#c8d8f0" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[28, 28]} />
      <meshLambertMaterial color="#1a2035" />
    </mesh>
    <mesh position={[0, 1.2, -4]}>
      <boxGeometry args={[2.4, 0.8, 0.1]} />
      <meshBasicMaterial color="#0f1b33" />
    </mesh>
    <Suspense fallback={null}>
      <Text
        position={[0, 1.22, -3.94]}
        fontSize={0.18}
        color="#f8c537"
        anchorX="center"
        anchorY="middle"
      >
        正在载入急救现场
      </Text>
    </Suspense>
  </group>
);

// 道路十字
const Roads: React.FC = () => (
  <group>
    {/* 主路横向 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[28, 3]} />
      <meshLambertMaterial color="#252d40" />
    </mesh>
    {/* 主路纵向 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[3, 28]} />
      <meshLambertMaterial color="#252d40" />
    </mesh>
    {/* 篮球场地面 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.02, -2]}>
      <planeGeometry args={[6, 5]} />
      <meshLambertMaterial color="#1e3a5f" />
    </mesh>
    {/* 篮球场标线 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.03, -2]}>
      <planeGeometry args={[5.8, 4.8]} />
      <meshLambertMaterial color="#1e3a5f" wireframe />
    </mesh>
  </group>
);

// 建筑物（便利店）
const ConvenienceStore: React.FC = () => (
  <group position={[9, 0, 7]}>
    <mesh position={[0, 1.5, 0]} castShadow>
      <boxGeometry args={[3, 3, 3]} />
      <meshLambertMaterial color="#2a3a5c" />
    </mesh>
    {/* 招牌 */}
    <mesh position={[0, 2.8, 1.6]}>
      <boxGeometry args={[2.5, 0.6, 0.1]} />
      <meshLambertMaterial color="#c0392b" />
    </mesh>
    {/* 门 */}
    <mesh position={[0, 0.9, 1.55]}>
      <boxGeometry args={[0.8, 1.8, 0.05]} />
      <meshLambertMaterial color="#4a90d9" />
    </mesh>
    {/* 文字标牌 - 独立 Suspense 边界 */}
    <Suspense fallback={null}>
      <Text
        position={[0, 2.8, 1.7]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`便利店`}
      </Text>
    </Suspense>
  </group>
);

// 长椅
const Bench: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[1.5, 0.1, 0.4]} />
      <meshLambertMaterial color="#5d3a1a" />
    </mesh>
    <mesh position={[-0.6, 0.2, 0]}>
      <boxGeometry args={[0.1, 0.4, 0.4]} />
      <meshLambertMaterial color="#5d3a1a" />
    </mesh>
    <mesh position={[0.6, 0.2, 0]}>
      <boxGeometry args={[0.1, 0.4, 0.4]} />
      <meshLambertMaterial color="#5d3a1a" />
    </mesh>
  </group>
);

// 路灯
const StreetLight: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 4, 6]} />
      <meshLambertMaterial color="#888" />
    </mesh>
    <mesh position={[0.5, 3.8, 0]}>
      <boxGeometry args={[1, 0.1, 0.1]} />
      <meshLambertMaterial color="#888" />
    </mesh>
    <mesh position={[0.5, 3.75, 0]}>
      <boxGeometry args={[0.3, 0.2, 0.2]} />
      <meshLambertMaterial color="#ffffaa" />
    </mesh>
    <pointLight position={[0.5, 3.75, 0]} color="#ffffaa" intensity={0.8} distance={6} />
  </group>
);

// 小红花墙（用小球代替 emoji，避免 troika 渲染问题）
const FlowerWall: React.FC = () => (
  <group position={POSITIONS.flowerWall}>
    <mesh position={[0, 1, -0.5]}>
      <boxGeometry args={[4, 2, 0.2]} />
      <meshLambertMaterial color="#1e2a3a" />
    </mesh>
    {[...Array(12)].map((_, i) => (
      <mesh
        key={i}
        position={[
          -1.5 + (i % 4) * 1.0,
          0.6 + Math.floor(i / 4) * 0.7,
          -0.28,
        ]}
      >
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
      </mesh>
    ))}
    <Suspense fallback={null}>
      <Text
        position={[0, 1.9, -0.3]}
        fontSize={0.22}
        color="#f39c12"
        anchorX="center"
        anchorY="middle"
      >
        {`人人学急救 急救为人人`}
      </Text>
    </Suspense>
  </group>
);

// 公益海报
const PublicPoster: React.FC = () => (
  <group position={POSITIONS.poster}>
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.1, 2.5, 0.05]} />
      <meshLambertMaterial color="#555" />
    </mesh>
    <mesh position={[0, 2, 0.1]}>
      <boxGeometry args={[1.6, 1, 0.05]} />
      <meshLambertMaterial color="#c0392b" />
    </mesh>
    <Suspense fallback={null}>
      <Text
        position={[0, 2.15, 0.16]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`AED 就在附近`}
      </Text>
      <Text
        position={[0, 1.85, 0.16]}
        fontSize={0.14}
        color="#ffffaa"
        anchorX="center"
        anchorY="middle"
      >
        {`发现->呼救->按压->AED`}
      </Text>
    </Suspense>
  </group>
);

// 围栏/边界
const Fence: React.FC = () => {
  const posts: [number, number][] = [];
  for (let i = -13; i <= 13; i += 2) {
    posts.push([i, -13]);
    posts.push([i, 13]);
    posts.push([-13, i]);
    posts.push([13, i]);
  }
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshLambertMaterial color="#3a4a6a" />
        </mesh>
      ))}
    </group>
  );
};

// 玩家控制器
interface PlayerControllerProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
}
const PlayerController: React.FC<PlayerControllerProps> = ({ joystickRef }) => {
  const { setNearPatient, setNearNPC, nearPatient, activeInteraction, cancelInteraction, phase } = useGameStore();
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const playerPos = useRef(new THREE.Vector3(POSITIONS.player[0], 0, POSITIONS.player[2]));
  const facingAngle = useRef(
    Math.atan2(
      POSITIONS.patient[0] - POSITIONS.player[0],
      POSITIONS.player[2] - POSITIONS.patient[2],
    ),
  );
  const verticalAngle = useRef(-0.15); // 略微俯视
  const isPointerLocked = useRef(false);

  // WASD 移动按键 + Shift
  useEffect(() => {
    const moveCodes = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'ShiftLeft', 'ShiftRight',
    ]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (moveCodes.has(e.code)) e.preventDefault();
      keys.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // 鼠标视角 + PointerLock + ESC
  useEffect(() => {
    const element = gl.domElement;

    const lockPointer = () => {
      element.requestPointerLock?.();
    };

    const unlockPointer = () => {
      if (document.pointerLockElement === element) {
        document.exitPointerLock();
      }
      isPointerLocked.current = false;
      element.style.cursor = '';
      // ESC 时取消当前交互
      const state = useGameStore.getState();
      if (state.activeInteraction) {
        state.cancelInteraction();
      }
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement === element) {
        isPointerLocked.current = true;
        element.style.cursor = 'none';
      } else {
        isPointerLocked.current = false;
        element.style.cursor = '';
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!isPointerLocked.current) return;
      // 左右视角
      facingAngle.current += e.movementX * 0.0038;
      // 上下视角（pitch），限制在 -60° ~ 60°（约 -1.05 ~ 1.05 弧度）
      verticalAngle.current -= e.movementY * 0.003;
      verticalAngle.current = Math.max(-1.05, Math.min(1.05, verticalAngle.current));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (document.pointerLockElement === element) {
          unlockPointer();
        }
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('click', lockPointer);
    window.addEventListener('keydown', onKeyDown);

    // 初始自动锁定
    setTimeout(() => lockPointer(), 100);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('click', lockPointer);
      window.removeEventListener('keydown', onKeyDown);
      element.style.cursor = '';
    };
  }, [gl]);

  // 游戏阶段变化时重新锁定
  useEffect(() => {
    if (phase === 'playing') {
      const element = gl.domElement;
      setTimeout(() => {
        if (!isPointerLocked.current) {
          element.requestPointerLock?.();
        }
      }, 200);
    }
  }, [phase, gl]);

  useFrame((_, delta) => {
    // Shift 疾走：速度翻倍
    const isSprinting = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight');
    const baseSpeed = isSprinting ? 10 : 5;
    const pos = playerPos.current.clone();

    if (keys.current.has('ArrowLeft')) facingAngle.current -= delta * 2.4;
    if (keys.current.has('ArrowRight')) facingAngle.current += delta * 2.4;

    let forwardAmount = 0;
    let strafeAmount = 0;
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) forwardAmount += 1;
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) forwardAmount -= 1;
    if (keys.current.has('KeyA')) strafeAmount -= 1;
    if (keys.current.has('KeyD')) strafeAmount += 1;

    strafeAmount += joystickRef.current.x;
    forwardAmount += -joystickRef.current.y;

    const moveLen = Math.sqrt(forwardAmount * forwardAmount + strafeAmount * strafeAmount);
    if (moveLen > 1) {
      forwardAmount /= moveLen;
      strafeAmount /= moveLen;
    }

    const forward = new THREE.Vector3(
      Math.sin(facingAngle.current),
      0,
      -Math.cos(facingAngle.current),
    );
    const right = new THREE.Vector3(
      Math.cos(facingAngle.current),
      0,
      Math.sin(facingAngle.current),
    );

    pos.addScaledVector(forward, forwardAmount * baseSpeed * delta);
    pos.addScaledVector(right, strafeAmount * baseSpeed * delta);

    // 边界限制
    pos.x = Math.max(-12, Math.min(12, pos.x));
    pos.z = Math.max(-12, Math.min(12, pos.z));

    // 不允许第一人称玩家直接踩到患者身上，保持合理观察/操作距离。
    const patientFlatPos = new THREE.Vector3(POSITIONS.patient[0], 0, POSITIONS.patient[2]);
    const awayFromPatient = pos.clone().sub(patientFlatPos);
    awayFromPatient.y = 0;
    const patientDist = awayFromPatient.length();
    const patientCollisionRadius = 1.35;
    if (patientDist > 0.001 && patientDist < patientCollisionRadius) {
      awayFromPatient.normalize().multiplyScalar(patientCollisionRadius);
      pos.copy(patientFlatPos).add(awayFromPatient);
    }

    playerPos.current.copy(pos);

    // 第一人称相机
    const eyeY = 1.62;
    const patientBase = new THREE.Vector3(POSITIONS.patient[0], 0, POSITIONS.patient[2]);
    const setCameraFov = (fov: number) => {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      if (perspectiveCamera.isPerspectiveCamera && Math.abs(perspectiveCamera.fov - fov) > 0.1) {
        perspectiveCamera.fov = fov;
        perspectiveCamera.updateProjectionMatrix();
      }
    };
    if (activeInteraction === 'response_check') {
      const closePos = new THREE.Vector3(patientBase.x, 0.96, patientBase.z - 1.46);
      const closeTarget = new THREE.Vector3(patientBase.x, 0.055, patientBase.z - 1.28);
      setCameraFov(44);
      camera.up.set(0, 0, -1);
      camera.position.lerp(closePos, 0.18);
      camera.lookAt(closeTarget);
    } else if (activeInteraction === 'breath_check') {
      const closePos = new THREE.Vector3(patientBase.x, 1.12, patientBase.z - 1.24);
      const closeTarget = new THREE.Vector3(patientBase.x, 0.055, patientBase.z - 1.02);
      setCameraFov(50);
      camera.up.set(0, 0, -1);
      camera.position.lerp(closePos, 0.18);
      camera.lookAt(closeTarget);
    } else if (activeInteraction === 'aed_pad_drag' || activeInteraction === 'shock_confirm') {
      const closePos = new THREE.Vector3(patientBase.x + 0.18, 1.02, patientBase.z + 0.95);
      const closeTarget = new THREE.Vector3(patientBase.x + 0.05, 0.06, patientBase.z - 0.65);
      setCameraFov(68);
      camera.up.set(0, 1, 0);
      camera.position.lerp(closePos, 0.14);
      camera.lookAt(closeTarget);
    } else {
      setCameraFov(68);
      camera.up.set(0, 1, 0);
      camera.position.set(pos.x, eyeY, pos.z);
      // 结合水平和垂直角度计算视线方向
      const vAngle = verticalAngle.current;
      const hAngle = facingAngle.current;
      const lookX = pos.x + Math.sin(hAngle) * Math.cos(vAngle);
      const lookY = eyeY + Math.sin(vAngle);
      const lookZ = pos.z - Math.cos(hAngle) * Math.cos(vAngle);
      camera.lookAt(lookX, lookY, lookZ);
    }

    // 检测是否靠近患者
    const patientPos = new THREE.Vector3(...POSITIONS.patient);
    const dist = Math.hypot(pos.x - patientPos.x, pos.z - patientPos.z);
    const isNear = dist < INTERACTION_DISTANCE;
    if (isNear !== nearPatient) {
      setNearPatient(isNear);
    }

    // 检测是否靠近 NPC
    const NPC_INTERACT_DIST = 6.0;
    const npcPositions = [
      { id: 'npc1', pos: new THREE.Vector3(...POSITIONS.npc1) },
      { id: 'npc2', pos: new THREE.Vector3(...POSITIONS.npc2) },
      { id: 'npc3', pos: new THREE.Vector3(...POSITIONS.npc3) },
    ];
    let closestNpcId: string | null = null;
    let closestNpcDist = Infinity;
    for (const npc of npcPositions) {
      const d = Math.hypot(pos.x - npc.pos.x, pos.z - npc.pos.z);
      if (d < NPC_INTERACT_DIST && d < closestNpcDist) {
        closestNpcDist = d;
        closestNpcId = npc.id;
      }
    }
    const isNearNpc = closestNpcId !== null;
    setNearNPC(isNearNpc, closestNpcId);
  });

  return null;
};

// 救护车驶入动画
interface AmbulanceWrapperProps {
  targetPos: [number, number, number];
  spawnPos: [number, number, number];
}
const AmbulanceWrapper: React.FC<AmbulanceWrapperProps> = ({ targetPos, spawnPos }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current = Math.min(1, tRef.current + delta * 0.4); // ~2.5s 驶入
    if (!groupRef.current) return;
    const t = tRef.current;
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    groupRef.current.position.x = spawnPos[0] + (targetPos[0] - spawnPos[0]) * ease;
    groupRef.current.position.y = 0;
    groupRef.current.position.z = spawnPos[2] + (targetPos[2] - spawnPos[2]) * ease;
  });

  return (
    <group ref={groupRef} position={spawnPos}>
      <AmbulanceModel position={[0, 0, 0]} />
    </group>
  );
};

// 主场景组件
const CommunityScene: React.FC = () => {
  const { aedArrived, ambulanceArrived } = useGameStore();
  // 虚拟摇杆共享引用（React DOM → R3F useFrame）
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 将 joystickRef 挂载到 window 以便 MobileControls 写入
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__joystickRef = joystickRef;
    return () => { delete (window as unknown as Record<string, unknown>).__joystickRef; };
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: POSITIONS.player, fov: 68 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: false }}
    >
      {/* 光照 */}
      <ambientLight intensity={0.8} color="#c8d8f0" />
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.6}
        color="#ddeeff"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-8, 4, -5]} color="#f39c12" intensity={1.5} distance={12} />
      <pointLight position={[5, 3, 5]} color="#6699cc" intensity={0.8} distance={10} />

      {/* 玩家控制器（含可见模型） */}
      <PlayerController joystickRef={joystickRef} />

      {/* 场景元素 */}
      <Suspense fallback={<SceneLoadingFallback />}>
        <Ground />
        <Roads />
        <Fence />
        <ConvenienceStore />
        <Bench position={[-5, 0, 3]} />
        <Bench position={[7, 0, -1]} />
        <StreetLight position={[-6, 0, -6]} />
        <StreetLight position={[6, 0, 6]} />
        <StreetLight position={[-6, 0, 6]} />
        <FlowerWall />
        <PublicPoster />

        {/* 游戏角色 */}
        <PatientModel position={POSITIONS.patient} />
        <AEDStation position={POSITIONS.aedStation} aedTaken={aedArrived} />
        <NPCModel
          id="npc1"
          position={POSITIONS.npc1}
          spriteUrl={gameAssetUrl('assets/characters/bystander_01_phone.png')}
          height={2.25}
        />
        <NPCModel
          id="npc2"
          position={POSITIONS.npc2}
          spriteUrl={gameAssetUrl('assets/characters/bystander_02_aed_pointer.png')}
          height={2.25}
        />
        <NPCModel
          id="npc3"
          position={POSITIONS.npc3}
          spriteUrl={gameAssetUrl('assets/characters/bystander_03_elder.png')}
          height={2.15}
        />

        {/* 救护车：到达后从场外驶入 */}
        {ambulanceArrived && (
          <>
            <AmbulanceWrapper
              targetPos={POSITIONS.ambulanceTarget}
              spawnPos={POSITIONS.ambulanceSpawn}
            />
            <NPCModel
              position={[POSITIONS.patient[0] - 1.7, 0, POSITIONS.patient[2] - 0.7]}
              spriteUrl={gameAssetUrl('assets/characters/medic_01_bag.png')}
              height={2.4}
              marker={false}
            />
            <NPCModel
              position={[POSITIONS.patient[0] + 1.55, 0, POSITIONS.patient[2] - 0.55]}
              spriteUrl={gameAssetUrl('assets/characters/medic_02_aed_assist.png')}
              height={2.25}
              marker={false}
            />
          </>
        )}
      </Suspense>

      {/* 雾气 */}
      <fog attach="fog" args={['#0a1025', 30, 55]} />
    </Canvas>
  );
};

export default CommunityScene;
