import React, { useEffect, useRef } from 'react';

export type ShaderType = 
  | 'five_element'     // 五色神光 (ANIMATION_579)
  | 'spatial_crack'    // 空间裂缝 (ANIMATION_581)
  | 'falling_swords'   // 青竹蜂云剑阵 (ANIMATION_577)
  | 'blood_shadow'     // 血影瞬杀 / 啼魂巨猿 (ANIMATION_578)
  | 'spirit_ripple'    // 灵泉脉动 / 碧水涟漪 (ANIMATION_580)
  | 'golden_core'      // 金丹灵光 / 极品灵丹 (ANIMATION_557)
  | 'emerald_spiral'   // 青竹剑意 (ANIMATION_555)
  | 'dark_smoke'       // 阴风黑风煞 (ANIMATION_556)
  | 'golden_lightning' // 辟邪金雷 (ANIMATION_558)
  | 'fire_burst'       // 三昧真火 (ANIMATION_597)
  | 'time_wheel'       // 真言化轮 (ANIMATION_595)
  | 'blue_shield';     // 玄甲护罩 (ANIMATION_604)

interface WebGLShaderCanvasProps {
  type: ShaderType;
  className?: string;
  style?: React.CSSProperties;
}

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADERS: Record<ShaderType, string> = {
  five_element: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    vec3 c1 = vec3(1.0, 0.9, 0.2); // Gold
    vec3 c2 = vec3(0.2, 1.0, 0.4); // Wood
    vec3 c3 = vec3(0.2, 0.6, 1.0); // Water
    vec3 c4 = vec3(1.0, 0.3, 0.2); // Fire
    vec3 c5 = vec3(0.7, 0.5, 0.2); // Earth
    
    float t = u_time * 2.0;
    float s1 = smoothstep(0.1, 0.0, abs(sin(a + t) - 0.8));
    float s2 = smoothstep(0.1, 0.0, abs(sin(a + t + 1.25) - 0.8));
    float s3 = smoothstep(0.1, 0.0, abs(sin(a + t + 2.5) - 0.8));
    float s4 = smoothstep(0.1, 0.0, abs(sin(a + t + 3.75) - 0.8));
    float s5 = smoothstep(0.1, 0.0, abs(sin(a + t + 5.0) - 0.8));
    
    vec3 color = c1 * s1 + c2 * s2 + c3 * s3 + c4 * s4 + c5 * s5;
    color *= exp(-r * 4.0) * 2.0;
    color += vec3(1.0) * exp(-r * 20.0); // White core
    
    float alpha = smoothstep(0.5, 0.3, r) * length(color);
    gl_FragColor = vec4(color, alpha);
}
`,

  spatial_crack: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord - 0.5;
    
    // Vertical crack line
    float x_off = 0.05 * sin(uv.y * 10.0 + u_time * 2.0);
    float line = smoothstep(0.02, 0.0, abs(uv.x + x_off));
    
    // Internal void
    float crack = smoothstep(0.1, 0.0, abs(uv.x + x_off)) * smoothstep(0.5, 0.4, abs(uv.y));
    
    vec3 color = vec3(0.1, 0.0, 0.2); // Dark void
    color += vec3(0.5, 0.7, 1.0) * line; // Edge glow
    
    // Sparkles
    float n = noise(uv * 100.0 + u_time);
    if(crack > 0.5 && n > 0.98) color += vec3(1.0);
    
    float alpha = crack + line;
    gl_FragColor = vec4(color, alpha);
}
`,

  falling_swords: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
    vec2 uv = v_texCoord;
    float time = u_time * 2.0;
    
    // Background glow
    vec3 color = vec3(0.05, 0.15, 0.1) * (1.0 - length(uv - 0.5));
    
    // Falling swords
    for(float i=0.0; i<20.0; i++) {
        float h = hash(i * 123.456);
        float x = fract(h + uv.x);
        float speed = 1.0 + h * 2.0;
        float y = fract(uv.y + time * speed + h);
        
        // Blade shape
        float sword = smoothstep(0.01, 0.0, abs(x - 0.5)) * smoothstep(0.4, 0.0, abs(y - 0.5));
        float glow = 0.002 / abs(x - 0.5) * smoothstep(1.0, 0.0, abs(y - 0.5));
        
        color += vec3(0.3, 1.0, 0.6) * (sword + glow * 0.5) * (1.0 - y);
    }
    
    gl_FragColor = vec4(color, length(color) * 1.5);
}
`,

  blood_shadow: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    // Pulsing core
    float pulse = 0.5 + 0.5 * sin(u_time * 5.0);
    float core = exp(-r * 15.0) * pulse;
    
    // Swirling streaks
    float streaks = sin(a * 3.0 + r * 10.0 - u_time * 8.0);
    streaks = smoothstep(0.8, 1.0, streaks) * exp(-r * 5.0);
    
    vec3 color = vec3(0.8, 0.0, 0.1) * (core + streaks * 2.0);
    color += vec3(1.0, 0.2, 0.2) * core * 0.5;
    
    float alpha = smoothstep(0.5, 0.2, r) * (core + streaks);
    gl_FragColor = vec4(color, alpha * 2.0);
}
`,

  spirit_ripple: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    
    float ripple = sin(r * 30.0 - u_time * 4.0);
    ripple = smoothstep(0.1, 0.0, abs(ripple)) * exp(-r * 4.0);
    
    float core = exp(-r * 10.0);
    
    vec3 color = vec3(0.2, 0.8, 0.9) * (ripple + core);
    color += vec3(1.0) * core * 0.5;
    
    float alpha = smoothstep(0.5, 0.1, r) * (ripple + core);
    gl_FragColor = vec4(color, alpha);
}
`,

  golden_core: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float dist = length(uv);
    
    // Core Glow
    float glow = exp(-dist * 6.0);
    float pulse = 0.8 + 0.2 * sin(u_time * 3.0);
    
    vec3 color = vec3(1.0, 0.85, 0.35) * glow * pulse;
    color += vec3(1.0, 1.0, 0.9) * exp(-dist * 18.0);
    
    float alpha = smoothstep(0.5, 0.1, dist) * glow;
    gl_FragColor = vec4(color, alpha);
}
`,

  emerald_spiral: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    // Spiral motion
    float spiral = sin(a * 5.0 - r * 20.0 + u_time * 10.0);
    float streaks = smoothstep(0.1, 0.0, abs(spiral)) * (1.0 - r * 2.0);
    
    // Blade glow
    float innerGlow = exp(-r * 15.0);
    
    vec3 emerald = vec3(0.31, 0.78, 0.47);
    vec3 cyan = vec3(0.0, 1.0, 1.0);
    
    vec3 color = mix(emerald, cyan, streaks) * (streaks + innerGlow);
    color *= 1.5;
    
    float alpha = smoothstep(0.45, 0.3, r) * (streaks + innerGlow);
    gl_FragColor = vec4(color, alpha);
}
`,

  dark_smoke: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = fract(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = v_texCoord;
    float dist = length(uv - 0.5);
    
    float n = fbm(uv * 4.0 + u_time * 0.5);
    float n2 = fbm(uv * 8.0 - u_time * 0.8);
    
    float mist = n * n2;
    
    vec3 baseColor = vec3(0.2, 0.0, 0.4);
    vec3 accentColor = vec3(0.5, 0.1, 0.8);
    
    vec3 color = mix(baseColor, accentColor, n);
    color *= mist * 2.0;
    
    float alpha = smoothstep(0.5, 0.2, dist) * mist;
    gl_FragColor = vec4(color, alpha * 1.5);
}
`,

  golden_lightning: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
    vec2 uv = v_texCoord - 0.5;
    float time = u_time * 5.0;
    
    float bolt = 0.0;
    for(float i=0.0; i<4.0; i++){
        float off = hash(i * 123.4) * 6.28;
        float x = uv.x + 0.1 * sin(uv.y * 15.0 + time + off);
        bolt += 0.002 / abs(x);
    }
    
    vec3 color = vec3(1.0, 0.9, 0.3) * bolt;
    color += vec3(1.0, 1.0, 1.0) * exp(-abs(uv.x) * 50.0) * 0.5;
    
    float alpha = bolt * smoothstep(0.5, 0.4, length(uv));
    gl_FragColor = vec4(color, alpha);
}
`,

  fire_burst: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float f1 = smoothstep(0.3, 0.0, r + sin(atan(uv.y, uv.x)*5.0 + u_time*10.0)*0.03);
    float core = smoothstep(0.1, 0.0, r);
    vec3 color = vec3(1.0, 0.4, 0.1) * f1 + vec3(1.0, 0.9, 0.5) * core;
    float alpha = f1 * 1.5;
    gl_FragColor = vec4(color, alpha);
}
`,

  time_wheel: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float rays = smoothstep(0.25, 0.0, abs(sin(a * 8.0 + u_time * 2.0))) * exp(-r * 4.0);
    float core = exp(-r * 10.0) * (0.7 + 0.3 * sin(u_time * 5.0));
    vec3 color = vec3(1.0, 0.85, 0.3) * (rays + core);
    color += vec3(1.0, 1.0, 0.8) * core;
    float alpha = (rays + core) * smoothstep(0.5, 0.15, r);
    gl_FragColor = vec4(color, alpha);
}
`,

  blue_shield: `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
    vec2 uv = v_texCoord - 0.5;
    float r = length(uv);
    float forcefield = exp(-r * 6.0) * (0.8 + 0.2 * sin(r * 20.0 - u_time * 6.0));
    float scan = abs(sin(uv.y * 30.0 - u_time * 8.0)) * 0.3;
    vec3 color = vec3(0.2, 0.6, 1.0) * (forcefield + scan);
    color += vec3(0.8, 0.95, 1.0) * exp(-r * 12.0);
    float alpha = forcefield * smoothstep(0.48, 0.15, r);
    gl_FragColor = vec4(color, alpha);
}
`
};

export const WebGLShaderCanvas: React.FC<WebGLShaderCanvasProps> = ({ type, className = '', style }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return;

    let animFrameId: number;
    let isRunning = true;

    // Compile helper
    const compileShader = (shaderType: number, source: string) => {
      const shader = gl.createShader(shaderType);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShaderSrc = FRAGMENT_SHADERS[type] || FRAGMENT_SHADERS.five_element;
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fragShaderSrc);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Buffer setup
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');

    // Resize handling
    const resize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth || 300;
      const height = canvas.clientHeight || 300;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const startTime = Date.now();

    const render = () => {
      if (!isRunning) return;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const elapsed = (Date.now() - startTime) / 1000;
      if (uTime) gl.uniform1f(uTime, elapsed);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      if (program) gl.deleteProgram(program);
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={style}
    />
  );
};
