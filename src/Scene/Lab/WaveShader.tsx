import { onMount, onCleanup } from "solid-js";
import "./WaveShader.css";
import type { WaveShaderConfig } from "./types";

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform float u_intensity;
  uniform float u_speed;
  uniform float u_waveCount;
  uniform float u_frequency;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    float combinedWave = 0.0;
    float baseAmplitude = 0.1 * u_intensity;
    
    // Wave 1 - always on
    if (u_waveCount >= 1.0) {
      combinedWave += sin(uv.x * 10.0 * u_frequency + u_time * 2.0 * u_speed) * baseAmplitude;
    }
    
    // Wave 2
    if (u_waveCount >= 2.0) {
      combinedWave += sin(uv.x * 15.0 * u_frequency - u_time * 1.5 * u_speed + 1.0) * baseAmplitude * 0.5;
    }
    
    // Wave 3
    if (u_waveCount >= 3.0) {
      combinedWave += sin(uv.x * 8.0 * u_frequency + u_time * 0.8 * u_speed + 2.0) * baseAmplitude * 0.8;
    }
    
    // Wave 4
    if (u_waveCount >= 4.0) {
      combinedWave += sin(uv.x * 20.0 * u_frequency + u_time * 2.5 * u_speed + 3.0) * baseAmplitude * 0.3;
    }
    
    // Wave 5
    if (u_waveCount >= 5.0) {
      combinedWave += sin(uv.x * 6.0 * u_frequency - u_time * 1.2 * u_speed + 4.0) * baseAmplitude * 0.6;
    }
    
    float distFromWave = abs(uv.y - 0.5 - combinedWave);
    
    // Glow effect around the wave
    float glowSize = 0.02 * u_intensity;
    float glow = glowSize / distFromWave;
    glow = clamp(glow, 0.0, 1.0);
    
    // Additional horizontal waves for ambient effect
    float ambient = sin(uv.y * 20.0 + u_time * u_speed) * 0.02 * u_intensity;
    ambient += sin(uv.x * 25.0 + uv.y * 10.0 - u_time * 0.5 * u_speed) * 0.015 * u_intensity;
    
    // Combine colors
    vec3 baseColor = u_color * 0.01 * u_intensity;
    vec3 waveColor = u_color * glow;
    vec3 ambientColor = u_color * ambient;
    
    vec3 finalColor = baseColor + waveColor + ambientColor;
    
    gl_FragColor = vec4(finalColor, 0.6);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type WaveShaderProps = {
  config: WaveShaderConfig;
};

export const defaultWaveShaderConfig: WaveShaderConfig = {
  color: [0.22, 0.74, 0.97],
  intensity: 1.0,
  speed: 1.0,
  waveCount: 3,
  frequency: 1.0,
};

export function WaveShader(props: WaveShaderProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let animationId: number;
  let gl: WebGLRenderingContext | null = null;

  const config = () => props.config;

  onMount(() => {
    if (!canvasRef) return;

    gl = canvasRef.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Create full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const intensityLocation = gl.getUniformLocation(program, "u_intensity");
    const speedLocation = gl.getUniformLocation(program, "u_speed");
    const waveCountLocation = gl.getUniformLocation(program, "u_waveCount");
    const frequencyLocation = gl.getUniformLocation(program, "u_frequency");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      if (!canvasRef || !gl) return;
      canvasRef.width = canvasRef.clientWidth;
      canvasRef.height = canvasRef.clientHeight;
      gl.viewport(0, 0, canvasRef.width, canvasRef.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const render = () => {
      if (!gl || !canvasRef) return;

      const time = (performance.now() - startTime) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvasRef.width, canvasRef.height);
      gl.uniform3fv(colorLocation, config().color);
      gl.uniform1f(intensityLocation, config().intensity);
      gl.uniform1f(speedLocation, config().speed);
      gl.uniform1f(waveCountLocation, config().waveCount);
      gl.uniform1f(frequencyLocation, config().frequency);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    onCleanup(() => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    });
  });

  return <canvas ref={canvasRef} class="wave-shader-canvas" />;
}
