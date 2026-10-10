
import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

type Bounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

// The player is treated as a circle on the floor.
const PLAYER_RADIUS = 0.25;
const PLAYER_HEIGHT = 1.65;
const MOVE_SPEED = 2.5;

// Walkable interior boundaries.
const ROOM = {
  minX: -2.7,
  maxX: 2.7,
  minZ: -3.65,
  maxZ: 3.65,
};

// Furniture collision boxes.
// These are deliberately slightly larger than some objects
// to give the player a little breathing room.
const OBSTACLES: Bounds[] = [
  // Bed
  {
    minX: -2.55,
    maxX: -0.7,
    minZ: -2.85,
    maxZ: -0.15,
  },

  // Cabinet
  {
    minX: 0.95,
    maxX: 2.65,
    minZ: -3.3,
    maxZ: -2.3,
  },

  // Plant
  {
    minX: 1.45,
    maxX: 2.15,
    minZ: -1.65,
    maxZ: -0.95,
  },
];

function isBlocked(x: number, z: number) {
  const r = PLAYER_RADIUS;

  // Keep the player's whole body inside the walkable area.
  if (
    x - r < ROOM.minX ||
    x + r > ROOM.maxX ||
    z - r < ROOM.minZ ||
    z + r > ROOM.maxZ
  ) {
    return true;
  }

  // Circle-vs-rectangle collision.
  for (const obstacle of OBSTACLES) {
    const closestX = THREE.MathUtils.clamp(
      x,
      obstacle.minX,
      obstacle.maxX,
    );

    const closestZ = THREE.MathUtils.clamp(
      z,
      obstacle.minZ,
      obstacle.maxZ,
    );

    const dx = x - closestX;
    const dz = z - closestZ;

    if (dx * dx + dz * dz < r * r) {
      return true;
    }
  }

  return false;
}

// ----- Camper environment -----

function Floor() {
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[6, 8]} />
      <meshStandardMaterial color="#E8D9C5" />
    </mesh>
  );
}

function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.5, -4]}>
        <boxGeometry args={[6, 3, 0.15]} />
        <meshStandardMaterial color="#FFF4DF" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-3, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 8]} />
        <meshStandardMaterial color="#F5E6CE" />
      </mesh>

      {/* Right wall */}
      <mesh position={[3, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 8]} />
        <meshStandardMaterial color="#F5E6CE" />
      </mesh>

      {/* Window */}
      <mesh position={[0, 2, -3.91]}>
        <boxGeometry args={[2, 1, 0.04]} />
        <meshStandardMaterial
          color="#A8DCEB"
          emissive="#5FA9C0"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

function Bed() {
  return (
    <group position={[-1.65, 0, -1.5]}>
      {/* Bed frame */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.7, 0.4, 2.5]} />
        <meshStandardMaterial color="#B77B54" />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.49, 0]} castShadow>
        <boxGeometry args={[1.6, 0.15, 2.35]} />
        <meshStandardMaterial color="#FFF9F0" />
      </mesh>

      {/* Blanket */}
      <mesh position={[0, 0.59, 0.4]} castShadow>
        <boxGeometry args={[1.55, 0.08, 1.2]} />
        <meshStandardMaterial color="#FF9B85" />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 0.62, -0.8]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.4]} />
        <meshStandardMaterial color="#FFD65A" />
      </mesh>
    </group>
  );
}

function Cabinet() {
  return (
    <group position={[1.8, 0, -2.8]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[1.5, 1.3, 0.8]} />
        <meshStandardMaterial color="#D5A46B" />
      </mesh>

      <mesh position={[0, 1.34, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 0.9]} />
        <meshStandardMaterial color="#A96F43" />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <group position={[1.8, 0, -1.3]}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.4, 16]} />
        <meshStandardMaterial color="#D98A68" />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.6, 8]} />
        <meshStandardMaterial color="#497B52" />
      </mesh>

      {/* Leaves */}
      {[
        [-0.2, 0.65, 0],
        [0.2, 0.7, 0],
        [0, 0.85, 0.1],
        [0, 0.65, -0.2],
      ].map((position, index) => (
        <mesh
          key={index}
          position={position as [number, number, number]}
          rotation={[0, index * 0.8, index % 2 ? 0.5 : -0.5]}
        >
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#79A96B" />
        </mesh>
      ))}
    </group>
  );
}

// ----- First-person movement -----

function FirstPersonMovement() {
  const { camera } = useThree();

  // Store pressed keys without causing React re-renders.
  const keys = useRef(new Set<string>());

  // Reuse vectors every frame instead of allocating new ones.
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const movement = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown',
          'arrowleft', 'arrowright', ' '].includes(key)
      ) {
        event.preventDefault();
      }

      keys.current.add(key);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    // Prevent movement continuing when the browser loses focus.
    const onBlur = () => {
      keys.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    const pressed = keys.current;

    const forwardInput =
      Number(pressed.has('w') || pressed.has('arrowup')) -
      Number(pressed.has('s') || pressed.has('arrowdown'));

    const rightInput =
      Number(pressed.has('d') || pressed.has('arrowright')) -
      Number(pressed.has('a') || pressed.has('arrowleft'));

    if (forwardInput === 0 && rightInput === 0) {
      return;
    }

    // Get the camera's facing direction, ignoring its vertical angle.
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();

    // Derive the horizontal right direction from forward.
    right.current.crossVectors(forward.current, up.current).normalize();

    movement.current
      .set(0, 0, 0)
      .addScaledVector(forward.current, forwardInput)
      .addScaledVector(right.current, rightInput);

    // Prevent diagonal movement from being faster.
    movement.current.normalize().multiplyScalar(
      MOVE_SPEED * Math.min(delta, 0.05),
    );

    const currentX = camera.position.x;
    const currentZ = camera.position.z;

    const nextX = currentX + movement.current.x;
    const nextZ = currentZ + movement.current.z;

    // Resolve axes separately so the player can slide along walls.
    if (!isBlocked(nextX, currentZ)) {
      camera.position.x = nextX;
    }

    if (!isBlocked(camera.position.x, nextZ)) {
      camera.position.z = nextZ;
    }

    // Keep the camera at eye level: no jumping or falling.
    camera.position.y = PLAYER_HEIGHT;
  });

  return null;
}

// ----- Scene assembly -----

function CamperInterior() {
  return (
    <>
      <color attach="background" args={['#EAF2EF']} />

      <ambientLight intensity={1.5} />

      <directionalLight
        position={[4, 7, 5]}
        intensity={2}
        castShadow
      />

      <Floor />
      <Walls />
      <Bed />
      <Cabinet />
      <Plant />

      <FirstPersonMovement />
      <PointerLockControls />
    </>
  );
}

type CamperSceneProps = {
  onLock?: () => void;
  onUnlock?: () => void;
};

export default function CamperScene({
  onLock,
  onUnlock,
}: CamperSceneProps) {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, PLAYER_HEIGHT, 2.5],
        fov: 75,
        near: 0.1,
        far: 100,
      }}
      gl={{ antialias: true }}
    >
      <CamperInterior />
      <PointerLockEvents onLock={onLock} onUnlock={onUnlock} />
    </Canvas>
  );
}

// Keep pointer-lock events separate from the movement logic.
function PointerLockEvents({
  onLock,
  onUnlock,
}: CamperSceneProps) {
  return (
    <PointerLockControls
      onLock={onLock}
      onUnlock={onUnlock}
    />
  );
}
