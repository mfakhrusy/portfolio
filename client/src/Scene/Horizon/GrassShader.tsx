/**
 * Three.js Grass Shader
 *
 * Adapted from: https://github.com/James-Smyth/three-grass-demo
 * Original author: James Smyth
 * License: MIT
 *
 * Modified for SolidJS integration and simplified for 2D scene overlay.
 */

import { onMount, onCleanup } from "solid-js";
import * as THREE from "three";
import "./GrassShader.css";

// Vertex shader - handles wind animation
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  uniform float iTime;

  void main() {
    vUv = uv;
    vColor = color;
    vec3 cpos = position;

    float waveSize = 10.0;
    float tipDistance = 0.3;
    float centerDistance = 0.1;

    // Apply wind animation based on vertex color (height indicator)
    if (color.x > 0.6) {
      cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * tipDistance;
    } else if (color.x > 0.0) {
      cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * centerDistance;
    }

    vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(cpos, 1.0);
    gl_Position = mvPosition;
  }
`;

// Fragment shader - grass coloring
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;

  void main() {
    // Base grass colors
    vec3 baseColor = vec3(0.2, 0.5, 0.15);
    vec3 tipColor = vec3(0.4, 0.7, 0.25);

    // Mix colors based on height (vColor.x indicates height)
    vec3 color = mix(baseColor, tipColor, vColor.x);

    // Add subtle variation
    color += (vColor.x - 0.5) * 0.1;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Parameters
const PLANE_SIZE = 100;
const BLADE_COUNT = 200000;
const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 0.8;
const BLADE_HEIGHT_VARIATION = 0.6;

function convertRange(
  val: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): number {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

interface BladeVertex {
  pos: number[];
  uv: number[];
  color: number[];
}

interface BladeData {
  verts: BladeVertex[];
  indices: number[];
}

function generateBlade(
  center: THREE.Vector3,
  vArrOffset: number,
  uv: number[],
): BladeData {
  const MID_WIDTH = BLADE_WIDTH * 0.5;
  const TIP_OFFSET = 0.1;
  const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;

  const yaw = Math.random() * Math.PI * 2;
  const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const tipBend = Math.random() * Math.PI * 2;
  const tipBendUnitVec = new THREE.Vector3(
    Math.sin(tipBend),
    0,
    -Math.cos(tipBend),
  );

  // Vertex positions
  const bl = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1),
  );
  const br = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1),
  );
  const tl = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1),
  );
  const tr = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1),
  );
  const tc = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET),
  );

  tl.y += height / 2;
  tr.y += height / 2;
  tc.y += height;

  // Vertex colors indicate height for shader
  const black = [0, 0, 0];
  const gray = [0.5, 0.5, 0.5];
  const white = [1.0, 1.0, 1.0];

  const verts: BladeVertex[] = [
    { pos: bl.toArray(), uv: uv, color: black },
    { pos: br.toArray(), uv: uv, color: black },
    { pos: tr.toArray(), uv: uv, color: gray },
    { pos: tl.toArray(), uv: uv, color: gray },
    { pos: tc.toArray(), uv: uv, color: white },
  ];

  const indices = [
    vArrOffset,
    vArrOffset + 1,
    vArrOffset + 2,
    vArrOffset + 2,
    vArrOffset + 4,
    vArrOffset + 3,
    vArrOffset + 3,
    vArrOffset,
    vArrOffset + 2,
  ];

  return { verts, indices };
}

function generateField(scene: THREE.Scene, timeUniform: { value: number }) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  const surfaceMin = (PLANE_SIZE / 2) * -1;
  const surfaceMax = PLANE_SIZE / 2;
  // Removed radius for rectangular distribution

  for (let i = 0; i < BLADE_COUNT; i++) {
    const VERTEX_COUNT = 5;

    // Rectangular distribution
    const x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;
    const y = Math.random() * PLANE_SIZE - PLANE_SIZE / 2;

    const pos = new THREE.Vector3(x, 0, y);

    const uv = [
      convertRange(pos.x, surfaceMin, surfaceMax, 0, 1),
      convertRange(pos.z, surfaceMin, surfaceMax, 0, 1),
    ];

    const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
    blade.verts.forEach((vert) => {
      positions.push(...vert.pos);
      uvs.push(...vert.uv);
      colors.push(...vert.color);
    });
    blade.indices.forEach((indice) => indices.push(indice));
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geom.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geom.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3),
  );
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const grassMaterial = new THREE.ShaderMaterial({
    uniforms: {
      iTime: timeUniform,
    },
    vertexShader,
    fragmentShader,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geom, grassMaterial);
  scene.add(mesh);
}

export function GrassShader() {
  let containerRef: HTMLDivElement | undefined;
  let animationId: number;
  let renderer: THREE.WebGLRenderer | null = null;

  onMount(() => {
    if (!containerRef) return;

    const scene = new THREE.Scene();
    // Transparent background to show CSS gradient
    // scene.background = new THREE.Color(0x3d6b34);

    // Camera setup - looking down at the grass from an angle
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.clientWidth / containerRef.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent clear color
    renderer.setSize(containerRef.clientWidth, containerRef.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.appendChild(renderer.domElement);

    // Time uniform for animation
    const startTime = Date.now();
    const timeUniform = { value: 0 };

    // Generate grass field
    generateField(scene, timeUniform);

    // Animation loop
    const animate = () => {
      timeUniform.value = Date.now() - startTime;
      renderer?.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef || !renderer) return;
      const width = containerRef.clientWidth;
      const height = containerRef.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer?.dispose();
      if (renderer?.domElement && containerRef) {
        containerRef.removeChild(renderer.domElement);
      }
    });
  });

  return <div ref={containerRef} class="grass-shader-container" />;
}
