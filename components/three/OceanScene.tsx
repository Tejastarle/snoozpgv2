"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** A night bay drawn in light: a rolling field of points plus a far shoreline of city lights. */
function Ocean({ density }: { density: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#8dbcd6") },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1 },
    }),
    [],
  );
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(44, 22, Math.round(180 * density), Math.round(90 * density));
    g.rotateX(-Math.PI / 2);
    return g;
  }, [density]);
  useFrame((_, d) => (uniforms.uTime.value += Math.min(d, 0.05)));
  return (
    <points geometry={geo} position={[0, -1.2, -6]}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          uniform float uTime; uniform float uPixelRatio; varying float vA;
          void main(){
            vec3 p = position;
            float w = sin(p.x*0.35 + uTime*0.6)*0.28 + sin(p.z*0.55 - uTime*0.9)*0.18 + sin((p.x+p.z)*0.9 + uTime*1.3)*0.06;
            p.y += w;
            vec4 mv = modelViewMatrix*vec4(p,1.0);
            gl_Position = projectionMatrix*mv;
            gl_PointSize = (1.4 + w*2.2) * uPixelRatio * (9.0 / -mv.z);
            vA = smoothstep(26.0, 4.0, -mv.z) * (0.35 + w*0.9);
          }`}
        fragmentShader={`
          uniform vec3 uColor; varying float vA;
          void main(){
            float d = length(gl_PointCoord-0.5);
            float a = smoothstep(0.5,0.0,d);
            gl_FragColor = vec4(uColor, a*clamp(vA,0.0,1.0));
          }`}
      />
    </points>
  );
}

function Shoreline() {
  const ref = useRef<THREE.Points>(null);
  const { geo, uniforms } = useMemo(() => {
    const n = 260;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 40;
      pos[i * 3] = x;
      pos[i * 3 + 1] = -0.6 + Math.random() * (Math.abs(x) < 8 ? 1.4 : 0.6);
      pos[i * 3 + 2] = -17 - Math.random() * 2;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return { geo, uniforms: { uTime: { value: 0 } } };
  }, []);
  useFrame((_, d) => (uniforms.uTime.value += d));
  return (
    <points ref={ref} geometry={geo}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aSeed; uniform float uTime; varying float vA; varying float vS;
          void main(){
            vec4 mv = modelViewMatrix*vec4(position,1.0);
            gl_Position = projectionMatrix*mv;
            gl_PointSize = 2.0 + aSeed*3.0;
            vA = 0.5 + 0.5*sin(uTime*(0.5+aSeed) + aSeed*50.0);
            vS = aSeed;
          }`}
        fragmentShader={`
          varying float vA; varying float vS;
          void main(){
            float d = length(gl_PointCoord-0.5);
            float a = smoothstep(0.5,0.0,d);
            vec3 c = mix(vec3(1.0,0.82,0.6), vec3(0.95,0.95,1.0), step(0.7, vS));
            gl_FragColor = vec4(c, a*(0.4+0.6*vA));
          }`}
      />
    </points>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer }, d) => {
    const k = Math.min(1, d * 1.5);
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * k;
    camera.position.y += (1.1 + pointer.y * 0.3 - camera.position.y) * k;
    camera.lookAt(0, 0, -10);
  });
  return null;
}

export default function OceanScene({ active = true, density = 1 }: { active?: boolean; density?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 5], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <Ocean density={density} />
      <Shoreline />
      <CameraRig />
    </Canvas>
  );
}
