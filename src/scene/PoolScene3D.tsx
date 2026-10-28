import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import type { SceneEvent } from "../director/types";
import { eventProgress, findEvent } from "../director/timeline-utils";
import { BackyardCrossSection } from "./BackyardCrossSection";

type SceneProps = {
  frame: number;
  events: SceneEvent[];
};

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(11, 9, 11);
    camera.lookAt(0, 0.2, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

export const PoolScene3D: React.FC<SceneProps> = ({ frame, events }) => {
  const excavate = findEvent(events, "excavate");
  const rebar = findEvent(events, "rebar");
  const concrete = findEvent(events, "concrete");
  const pipes = findEvent(events, "pipes");
  const water = findEvent(events, "water");
  const flow = findEvent(events, "flow");

  const progress = useMemo(
    () => ({
      excavate: excavate ? eventProgress(frame, excavate) : 0,
      rebar: rebar ? eventProgress(frame, rebar) : 0,
      concrete: concrete ? eventProgress(frame, concrete) : 0,
      pipes: pipes ? eventProgress(frame, pipes) : 0,
      water: water ? eventProgress(frame, water) : 0,
      flow: flow ? eventProgress(frame, flow) : 0,
    }),
    [concrete, excavate, flow, frame, pipes, rebar, water],
  );

  return (
    <>
      <color attach="background" args={["#87b7ff"]} />
      <fog attach="fog" args={["#87b7ff", 18, 42]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 14, 6]} intensity={1.15} castShadow />
      <directionalLight position={[-6, 8, -4]} intensity={0.35} />
      <CameraRig />
      <BackyardCrossSection progress={progress} frame={frame} />
    </>
  );
};

export const PoolThreeCanvas: React.FC<{
  width: number;
  height: number;
  frame: number;
  events: SceneEvent[];
}> = ({ width, height, frame, events }) => {
  return (
    <ThreeCanvas width={width} height={height} orthographic={false}>
      <PoolScene3D frame={frame} events={events} />
    </ThreeCanvas>
  );
};

export type BuildProgress = {
  excavate: number;
  rebar: number;
  concrete: number;
  pipes: number;
  water: number;
  flow: number;
};

export const FlowArrows: React.FC<{ progress: number; frame: number }> = ({
  progress,
  frame,
}) => {
  if (progress <= 0) {
    return null;
  }

  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.22);
  const opacity = Math.min(1, progress * 1.2) * pulse;

  const positions: [number, number, number][] = [
    [-0.55, 0.35, 0.15],
    [0.0, 0.35, 0.55],
    [0.55, 0.35, 0.15],
    [0.0, 0.35, -0.45],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, i * (Math.PI / 2), 0]}>
          <coneGeometry args={[0.08, 0.22, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={opacity}
            emissive="#ffffff"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
};

export const soilMaterial = new THREE.MeshStandardMaterial({
  color: "#6b4423",
  roughness: 1,
});

export const grassMaterial = new THREE.MeshStandardMaterial({
  color: "#4caf50",
  roughness: 0.95,
});
