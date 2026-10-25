"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 p = position;
    float speed = 0.06 + aSeed * 0.12;
    // rise slowly and wrap — like air bubbles in water / dust in a sunbeam
    p.y = mod(position.y + 4.5 + uTime * speed + uScroll * (1.5 + aSeed * 2.0), 9.0) - 4.5;
    float t = uTime * (0.25 + aSeed * 0.3) + aSeed * 40.0;
    p.x += sin(t + p.y * 0.7) * (0.18 + aSeed * 0.25);
    p.z += cos(t * 0.8) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z);

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.7 + aSeed * 1.6) + aSeed * 90.0);
    float edge = smoothstep(-4.5, -3.2, p.y) * (1.0 - smoothstep(3.2, 4.5, p.y));
    vAlpha = twinkle * edge * (1.0 - clamp(uScroll, 0.0, 1.0) * 0.75);
    vSeed = aSeed;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uWarm;
  uniform vec3 uCool;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.8);
    vec3 col = mix(uWarm, uCool, smoothstep(0.45, 0.75, vSeed));
    gl_FragColor = vec4(col, a * vAlpha * 0.9);
  }
`;

function Field({ count, scroll }: { count: number; scroll: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
      seed[i] = Math.random();
      // mostly fine motes, a few soft bokeh lights
      size[i] = Math.random() < 0.06 ? 7 + Math.random() * 7 : 1 + Math.random() * 2.6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1 },
      uWarm: { value: new THREE.Color("#ffe6c4") },
      uCool: { value: new THREE.Color("#a8d4ea") },
    }),
    [],
  );

  useFrame((state, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uScroll.value += (scroll.current - uniforms.uScroll.value) * 0.08;
    if (group.current) {
      // the field leans gently towards the cursor
      group.current.rotation.y += (state.pointer.x * 0.12 - group.current.rotation.y) * 0.04;
      group.current.rotation.x += (-state.pointer.y * 0.06 - group.current.rotation.x) * 0.04;
      group.current.position.x += (state.pointer.x * 0.35 - group.current.position.x) * 0.03;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroParticles({
  count = 1400,
  scroll,
  active = true,
}: {
  count?: number;
  scroll: MutableRefObject<number>;
  active?: boolean;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <Field count={count} scroll={scroll} />
    </Canvas>
  );
}
