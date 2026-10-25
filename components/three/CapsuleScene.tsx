"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Html, Lightformer, RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type HotspotKey = "comfort" | "privacy" | "ac" | "space";

export const HOTSPOT_POS: Record<HotspotKey, [number, number, number]> = {
  comfort: [0.25, -0.22, 0.45],
  privacy: [-0.42, 0.1, 1.32],
  ac: [0, 0.86, -0.25],
  space: [0.32, 0.12, -0.75],
};

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const LEN = 2.6;

function Shell() {
  const { tube, back } = useMemo(() => {
    const outer = roundedRect(1.56, 1.16, 0.46);
    const inner = roundedRect(1.38, 0.98, 0.38);
    const ring = outer.clone();
    ring.holes.push(new THREE.Path(inner.getPoints(48)));
    const tube = new THREE.ExtrudeGeometry(ring, {
      depth: LEN,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 4,
      curveSegments: 32,
    });
    tube.translate(0, 0, -LEN / 2);
    tube.computeVertexNormals();

    const cap = roundedRect(1.4, 1.0, 0.38);
    const porthole = new THREE.Path();
    porthole.absarc(0, 0.06, 0.27, 0, Math.PI * 2, true);
    cap.holes.push(porthole);
    const back = new THREE.ShapeGeometry(cap, 48);
    return { tube, back };
  }, []);

  return (
    <group>
      <mesh geometry={tube} castShadow>
        <meshPhysicalMaterial color="#efe9e1" roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh geometry={back} position={[0, 0, -LEN / 2 + 0.06]}>
        <meshStandardMaterial color="#e7ddd0" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <SeaPorthole />
    </group>
  );
}

/** The porthole at the back of the pod shows a slow sunrise over the bay. */
function SeaPorthole() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, d) => (uniforms.uTime.value += d));
  return (
    <mesh position={[0, 0.06, -LEN / 2 + 0.03]}>
      <circleGeometry args={[0.3, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `}
        fragmentShader={`
          uniform float uTime; varying vec2 vUv;
          void main(){
            float horizon = 0.46;
            vec3 sky = mix(vec3(1.0,0.78,0.55), vec3(0.55,0.75,0.88), smoothstep(horizon, 1.0, vUv.y));
            vec3 sea = mix(vec3(0.05,0.17,0.24), vec3(0.22,0.42,0.55), smoothstep(0.0, horizon, vUv.y));
            float sun = smoothstep(0.11, 0.0, length(vUv - vec2(0.58, horizon + 0.06)));
            float glint = smoothstep(0.75, 1.0, sin(vUv.y*120.0 - uTime*1.5) * sin(vUv.x*40.0 + uTime)) * step(vUv.y, horizon) * smoothstep(0.3, 0.0, abs(vUv.x-0.58));
            vec3 col = vUv.y > horizon ? sky : sea;
            col += vec3(1.0,0.9,0.7) * (sun + glint*0.6);
            gl_FragColor = vec4(col, 1.0);
          }`}
      />
    </mesh>
  );
}

function Curtain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.5, 0.94, 40, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin((x + 0.25) * 38) * 0.025);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={[-0.42, 0, LEN / 2 - 0.04]}>
      <meshStandardMaterial color="#e7c89c" roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Interior() {
  return (
    <group>
      {/* mattress, pillow and the mustard blanket from the real dorm */}
      <RoundedBox args={[1.26, 0.16, 2.34]} radius={0.05} smoothness={4} position={[0, -0.39, 0]}>
        <meshStandardMaterial color="#f7f4ef" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.64, 0.11, 0.34]} radius={0.05} smoothness={4} position={[0.05, -0.26, -0.92]}>
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.08, 0.44]} radius={0.03} smoothness={3} position={[0.12, -0.27, 0.62]}>
        <meshStandardMaterial color="#c8902f" roughness={0.9} />
      </RoundedBox>
      {/* warm LED strips along the ceiling */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.43, 0]}>
          <boxGeometry args={[0.04, 0.012, 2.3]} />
          <meshStandardMaterial color="#ffd8a8" emissive="#ffc27a" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
      {/* reading light + socket panel */}
      <mesh position={[-0.62, 0.05, -0.75]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
        <meshStandardMaterial color="#fff2dc" emissive="#ffd29a" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <RoundedBox args={[0.02, 0.1, 0.22]} radius={0.008} position={[-0.68, -0.12, -0.4]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </RoundedBox>
      <pointLight position={[0, 0.2, 0.2]} intensity={2.2} distance={3} decay={1.6} color="#ffc68a" />
      <pointLight position={[-0.5, 0.05, -0.75]} intensity={0.8} distance={1.4} color="#ffd29a" />
    </group>
  );
}

function AcUnit() {
  return (
    <group position={[0, 0.7, -0.25]}>
      <RoundedBox args={[1.02, 0.2, 0.34]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial color="#f8f8f6" roughness={0.3} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[0, -0.05, 0.171]}>
        <boxGeometry args={[0.86, 0.025, 0.004]} />
        <meshStandardMaterial color="#2a2f35" />
      </mesh>
      <mesh position={[0.4, 0.04, 0.171]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color="#8dbcd6" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Hotspot({
  k,
  label,
  active,
  onSelect,
}: {
  k: HotspotKey;
  label: string;
  active: boolean;
  onSelect: (k: HotspotKey) => void;
}) {
  return (
    <Html position={HOTSPOT_POS[k]} center zIndexRange={[30, 0]}>
      <button
        type="button"
        onClick={() => onSelect(k)}
        aria-pressed={active}
        className="group/hs relative flex items-center gap-2 whitespace-nowrap"
      >
        <span className="relative grid h-8 w-8 place-items-center">
          <span className={`ping-soft absolute inset-0 rounded-full ${active ? "bg-linen/50" : "bg-linen/30"}`} />
          <span className={`relative grid h-8 w-8 place-items-center rounded-full border text-sm font-bold transition-colors ${active ? "border-linen bg-linen text-maroon" : "border-linen/70 bg-charcoal/60 text-linen backdrop-blur"}`}>
            {active ? "–" : "+"}
          </span>
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${active ? "bg-linen text-charcoal opacity-100" : "bg-charcoal/70 text-linen opacity-90 backdrop-blur group-hover/hs:opacity-100"}`}>
          {label}
        </span>
      </button>
    </Html>
  );
}

function Pod({
  progress,
  activeKey,
  onSelect,
  labels,
  travel,
}: {
  progress: MotionValue<number> | null;
  activeKey: HotspotKey | null;
  onSelect: (k: HotspotKey) => void;
  labels: Record<HotspotKey, string>;
  travel: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, d) => {
    const g = group.current;
    if (!g) return;
    const p = progress?.get() ?? 0.5;
    const t = state.clock.elapsedTime;
    const tx = THREE.MathUtils.lerp(travel, -travel, p);
    const ry = THREE.MathUtils.lerp(-0.95, 0.75, p) + Math.sin(t * 0.25) * 0.08 + pointer.x * 0.25;
    const rx = 0.12 - pointer.y * 0.1;
    const k = Math.min(1, d * 3);
    g.position.x += (tx - g.position.x) * k;
    g.rotation.y += (ry - g.rotation.y) * k;
    g.rotation.x += (rx - g.rotation.x) * k;
  });
  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.35} floatingRange={[-0.04, 0.06]}>
        <Shell />
        <Interior />
        <Curtain />
        <AcUnit />
        {(Object.keys(HOTSPOT_POS) as HotspotKey[]).map((k) => (
          <Hotspot key={k} k={k} label={labels[k]} active={activeKey === k} onSelect={onSelect} />
        ))}
      </Float>
    </group>
  );
}

export default function CapsuleScene({
  progress,
  activeKey,
  onSelect,
  labels,
  active = true,
  travel = 1.3,
}: {
  progress: MotionValue<number> | null;
  activeKey: HotspotKey | null;
  onSelect: (k: HotspotKey) => void;
  labels: Record<HotspotKey, string>;
  active?: boolean;
  travel?: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 6.4], fov: 36 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff1df" />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#8dbcd6" />
      <directionalLight position={[0, 1.5, 7]} intensity={0.7} color="#fff6ea" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} color="#fff1e0" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#8dbcd6" />
        <Lightformer form="ring" intensity={1.5} position={[4, 2, 2]} scale={2} color="#ffd5a8" />
      </Environment>
      <Pod progress={progress} activeKey={activeKey} onSelect={onSelect} labels={labels} travel={travel} />
      <ContactShadows position={[0, -0.85, 0]} opacity={0.5} scale={9} blur={2.6} far={2.2} resolution={512} color="#000000" />
    </Canvas>
  );
}
