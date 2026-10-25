"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, QuadraticBezierLine } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { LocationPoint } from "@/lib/types";

const SCALE = 4.6;
const COAST_X = -1.5; // west of this line is the bay
const toWorld = (p: Pick<LocationPoint, "map_x" | "map_y">): [number, number, number] => [p.map_x * SCALE, 0, -p.map_y * SCALE];

/* ── The bay: a shader plane with slow moving glints ─────────────────────── */
function Bay() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uDeep: { value: new THREE.Color("#0b2230") }, uGlow: { value: new THREE.Color("#8dbcd6") } }),
    [],
  );
  useFrame((_, d) => (uniforms.uTime.value += d));
  return (
    <mesh rotation-x={-Math.PI / 2} position={[COAST_X - 9, -0.02, 0]}>
      <planeGeometry args={[18, 30, 1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        vertexShader={`varying vec2 vUv; varying vec3 vPos; void main(){ vUv=uv; vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `}
        fragmentShader={`
          uniform float uTime; uniform vec3 uDeep; uniform vec3 uGlow; varying vec2 vUv;
          void main(){
            float w = sin(vUv.x*36.0 + uTime*0.6 + sin(vUv.y*9.0)*2.0) * sin(vUv.y*26.0 - uTime*0.45);
            float glint = smoothstep(0.9, 1.0, w);
            float shore = smoothstep(0.7, 1.0, vUv.x);
            vec3 col = mix(uDeep, uGlow, glint*0.3 + shore*0.18);
            gl_FragColor = vec4(col, 0.96);
          }`}
      />
    </mesh>
  );
}

/* ── City blocks: instanced, procedurally laid out on a street grid ─────── */
function City() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const blocks = useMemo(() => {
    const out: { x: number; z: number; h: number; w: number; d: number }[] = [];
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let gx = -1; gx <= 12; gx++) {
      for (let gz = -11; gz <= 11; gz++) {
        if (gx % 3 === 0 || gz % 4 === 0) continue; // streets
        const x = COAST_X + 0.6 + gx * 0.62;
        const z = gz * 0.62;
        if (Math.hypot(x, z) < 0.9) continue; // clearing around SNOOZ
        if (rand() < 0.18) continue;
        const dist = Math.hypot(x, z);
        const h = 0.12 + rand() * (dist < 4 ? 1.1 : 0.55) + (rand() < 0.05 ? 0.9 : 0);
        out.push({ x, z, h, w: 0.32 + rand() * 0.16, d: 0.32 + rand() * 0.16 });
      }
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    blocks.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [blocks]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, blocks.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4a525c" roughness={0.75} metalness={0.05} />
    </instancedMesh>
  );
}

/* ── SNOOZ beacon at Bay View Tower ───────────────────────────────────── */
function Beacon() {
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    [ring.current, ring2.current].forEach((r, i) => {
      if (!r) return;
      const p = ((t * 0.5 + i * 0.5) % 1);
      r.scale.setScalar(0.4 + p * 2.6);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });
  });
  return (
    <group>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.46, 1.5, 0.46]} />
        <meshStandardMaterial color="#f4efe8" emissive="#67231a" emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.012, 0.05, 3.4, 8, 1, true]} />
        <meshBasicMaterial color="#ffd9b0" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.42, 0.48, 64]} />
        <meshBasicMaterial color="#f4efe8" transparent depthWrite={false} />
      </mesh>
      <mesh ref={ring2} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.42, 0.48, 64]} />
        <meshBasicMaterial color="#f4efe8" transparent depthWrite={false} />
      </mesh>
      <Html position={[0, 2.35, 0]} center zIndexRange={[20, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-2xl bg-linen px-3.5 py-2 text-center leading-tight shadow-lg">
          <span className="block text-[14px] font-extrabold text-maroon">SNOOZ</span>
          <span className="block text-[11px] font-medium text-charcoal/70">Bay View Tower, Sector 11</span>
        </div>
      </Html>
    </group>
  );
}

/* ── Destination with animated arc ────────────────────────────────────── */
function Destination({ point, active }: { point: LocationPoint; active: boolean }) {
  const line = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const end = toWorld(point);
  const dist = Math.hypot(end[0], end[2]);
  const mid: [number, number, number] = [end[0] / 2, 1.6 + dist * 0.28, end[2] / 2];
  useFrame((_, d) => {
    const mat = line.current?.material;
    if (mat) {
      mat.dashOffset -= d * (active ? 1.2 : 0.5);
      mat.opacity += ((active ? 1 : 0.55) - mat.opacity) * 0.1;
      mat.linewidth += ((active ? 2.6 : 1.4) - mat.linewidth) * 0.1;
    }
  });
  return (
    <group>
      <QuadraticBezierLine
        ref={line}
        start={[0, 1.5, 0]}
        end={[end[0], 0.05, end[2]]}
        mid={mid}
        color="#8dbcd6"
        lineWidth={1.4}
        dashed
        dashScale={8}
        dashSize={0.6}
        gapSize={0.4}
        transparent
        opacity={0.55}
      />
      <mesh position={[end[0], 0.04, end[2]]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[active ? 0.2 : 0.14, 32]} />
        <meshBasicMaterial color={active ? "#f4efe8" : "#8dbcd6"} />
      </mesh>
      <Html position={[end[0], 0.45, end[2]]} center zIndexRange={[10, 0]}>
        <div
          className={`pointer-events-none whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold backdrop-blur transition-colors ${
            active ? "border-linen bg-linen text-charcoal" : "border-linen/25 bg-charcoal/70 text-linen"
          }`}
        >
          <span className="font-extrabold">{String(point.minutes).padStart(2, "0")} min</span>
          <span className="ml-1.5 font-medium opacity-80">{point.label}</span>
        </div>
      </Html>
    </group>
  );
}

function Labels() {
  return (
    <>
      <Html position={[COAST_X - 2.2, 0.1, 0.8]} center>
        <div className="pointer-events-none whitespace-nowrap font-serif text-[24px] italic text-bay/90">the bay</div>
      </Html>
      <Html position={[3.6, 1.4, -3.4]} center>
        <div className="pointer-events-none whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-linen/45">Business district</div>
      </Html>
      <Html position={[1.4, 0.1, 2.4]} center>
        <div className="pointer-events-none whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-linen/45">CBD Belapur</div>
      </Html>
    </>
  );
}

function Scene({ points, activeIndex }: { points: LocationPoint[]; activeIndex: number | null }) {
  const world = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }, d) => {
    const g = world.current;
    if (!g) return;
    const targetY = Math.sin(clock.elapsedTime * 0.12) * 0.1 + pointer.x * 0.16;
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, d * 2);
  });
  return (
    <>
      <color attach="background" args={["#16181b"]} />
      <fog attach="fog" args={["#16181b", 13, 30]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#bcd9ea", "#16181b", 0.6]} />
      <directionalLight position={[6, 10, 5]} intensity={1.9} color="#ffe2c2" />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#8dbcd6" />
      <group ref={world}>
        <mesh rotation-x={-Math.PI / 2} position={[COAST_X + 9, -0.01, 0]}>
          <planeGeometry args={[18, 30]} />
          <meshStandardMaterial color="#1c1f23" roughness={1} />
        </mesh>
        <Bay />
        <City />
        <Beacon />
        {points.map((p, i) => (
          <Destination key={p.id} point={p} active={activeIndex === i} />
        ))}
        <Labels />
      </group>
    </>
  );
}

export default function LocationScene({
  points,
  activeIndex,
  active = true,
}: {
  points: LocationPoint[];
  activeIndex: number | null;
  active?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0.6, 11.5, 10.5], fov: 38 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={({ camera }) => camera.lookAt(0.7, 0, -0.4)}
    >
      <Scene points={points} activeIndex={activeIndex} />
    </Canvas>
  );
}
