import React, { useMemo } from "react";
import * as THREE from "three";
import type { BuildProgress } from "./PoolScene3D";
import { FlowArrows, grassMaterial, soilMaterial } from "./PoolScene3D";

type BackyardCrossSectionProps = {
  progress: BuildProgress;
  frame: number;
};

const POOL_WIDTH = 2.4;
const POOL_DEPTH = 1.05;
const POOL_LENGTH = 3.2;

const DirtChunk: React.FC<{
  index: number;
  excavate: number;
  frame: number;
}> = ({ index, excavate, frame }) => {
  const seed = index * 17.13;
  const baseX = (Math.sin(seed) * 0.9 * POOL_WIDTH) / 2;
  const baseZ = (Math.cos(seed * 1.7) * 0.85 * POOL_LENGTH) / 2;
  const baseY = -0.15 - (index % 5) * 0.08;

  const lift = excavate * (1.4 + (index % 3) * 0.25);
  const wobble = Math.sin(frame * 0.35 + seed) * 0.04 * excavate;
  const opacity = excavate > 0 ? 1 - Math.min(1, excavate * 1.05) : 0;

  if (opacity <= 0.01) {
    return null;
  }

  return (
    <mesh
      position={[baseX + wobble, baseY + lift, baseZ]}
      rotation={[seed, seed * 0.5, seed * 0.3]}
    >
      <boxGeometry args={[0.22, 0.14, 0.18]} />
      <meshStandardMaterial color="#5a3a1f" transparent opacity={opacity} />
    </mesh>
  );
};

const RebarLines: React.FC<{ progress: number }> = ({ progress }) => {
  const opacity = Math.min(1, progress * 1.15);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const w = POOL_WIDTH * 0.92;
    const l = POOL_LENGTH * 0.92;
    const y0 = -0.55;
    const y1 = -0.15;
    const step = 0.35;
    for (let x = -w / 2; x <= w / 2; x += step) {
      pts.push(new THREE.Vector3(x, y0, -l / 2), new THREE.Vector3(x, y1, -l / 2));
      pts.push(new THREE.Vector3(x, y0, l / 2), new THREE.Vector3(x, y1, l / 2));
    }
    for (let z = -l / 2; z <= l / 2; z += step) {
      pts.push(new THREE.Vector3(-w / 2, y0, z), new THREE.Vector3(-w / 2, y1, z));
      pts.push(new THREE.Vector3(w / 2, y0, z), new THREE.Vector3(w / 2, y1, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  if (opacity <= 0.01) {
    return null;
  }

  return (
    <lineSegments geometry={lines}>
      <lineBasicMaterial color="#b87333" transparent opacity={opacity} linewidth={2} />
    </lineSegments>
  );
};

const PoolShell: React.FC<{ progress: number }> = ({ progress }) => {
  const scale = Math.min(1, progress * 1.05);
  const opacity = Math.min(1, progress * 1.2);
  if (opacity <= 0.01) {
    return null;
  }

  return (
    <mesh position={[0, -0.35, 0]} scale={[1, scale, 1]}>
      <boxGeometry args={[POOL_WIDTH, POOL_DEPTH, POOL_LENGTH]} />
      <meshStandardMaterial
        color="#9aa3ad"
        roughness={0.85}
        metalness={0.05}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

const PoolWater: React.FC<{ progress: number }> = ({ progress }) => {
  const level = Math.min(1, progress);
  if (level <= 0.01) {
    return null;
  }
  const h = (POOL_DEPTH - 0.18) * level;
  return (
    <mesh position={[0, -0.35 + h / 2 - POOL_DEPTH / 2 + 0.08, 0]}>
      <boxGeometry args={[POOL_WIDTH - 0.18, h, POOL_LENGTH - 0.18]} />
      <meshStandardMaterial
        color="#2cb8ff"
        transparent
        opacity={0.78}
        roughness={0.15}
        metalness={0.05}
      />
    </mesh>
  );
};

const PipeRun: React.FC<{
  from: [number, number, number];
  to: [number, number, number];
  progress: number;
}> = ({ from, to, progress }) => {
  const { mid, length, quat, visible } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const m = start.clone().add(dir.clone().multiplyScalar(0.5));
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return {
      mid: m,
      length: len,
      quat: q,
      visible: Math.max(0.001, len * progress),
    };
  }, [from, progress, to]);

  if (progress <= 0.01) {
    return null;
  }

  return (
    <mesh position={mid.toArray()} quaternion={quat} scale={[1, visible / length, 1]}>
      <cylinderGeometry args={[0.06, 0.06, length, 10]} />
      <meshStandardMaterial color="#ff6b35" roughness={0.55} />
    </mesh>
  );
};

export const BackyardCrossSection: React.FC<BackyardCrossSectionProps> = ({
  progress,
  frame,
}) => {
  const holeDepth = progress.excavate * 0.55;

  return (
    <group>
      {/* Ground block with cavity */}
      <mesh position={[0, -0.05, 0]} material={grassMaterial}>
        <boxGeometry args={[8, 0.22, 7]} />
      </mesh>
      <mesh position={[0, -0.55, 0]} material={soilMaterial}>
        <boxGeometry args={[8, 0.9, 7]} />
      </mesh>

      {/* Excavation void */}
      <mesh position={[0, -0.35 - holeDepth * 0.5, 0]}>
        <boxGeometry
          args={[
            POOL_WIDTH + 0.25,
            Math.max(0.05, POOL_DEPTH * progress.excavate + 0.12),
            POOL_LENGTH + 0.25,
          ]}
        />
        <meshStandardMaterial color="#3d2817" roughness={1} />
      </mesh>

      {Array.from({ length: 14 }).map((_, i) => (
        <DirtChunk key={i} index={i} excavate={progress.excavate} frame={frame} />
      ))}

      <RebarLines progress={progress.rebar} />
      <PoolShell progress={progress.concrete} />
      <PoolWater progress={progress.water} />

      <PipeRun
        from={[1.8, -0.55, 0]}
        to={[0.9, -0.55, 0]}
        progress={progress.pipes}
      />
      <PipeRun
        from={[0.9, -0.55, 0]}
        to={[0.9, -0.15, 0.6]}
        progress={Math.max(0, progress.pipes - 0.15)}
      />
      <PipeRun
        from={[0.9, -0.55, 0]}
        to={[-1.4, -0.55, -0.4]}
        progress={Math.max(0, progress.pipes - 0.35)}
      />

      {/* Simple house mass */}
      <mesh position={[-3.2, 0.55, -1.2]}>
        <boxGeometry args={[1.8, 1.2, 1.6]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
      </mesh>
      <mesh position={[-3.2, 1.35, -1.2]}>
        <boxGeometry args={[2.0, 0.35, 1.8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.95} />
      </mesh>

      {/* Fence */}
      {[-2.5, -1.2, 0.2, 1.6, 2.9].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 3.1]}>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
      ))}

      <FlowArrows progress={progress.flow} frame={frame} />
    </group>
  );
};
