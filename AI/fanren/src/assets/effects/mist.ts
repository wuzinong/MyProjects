/**
 * 移植自获批动效参考（盘点记录中的原创雾气 shader，见 asset-inventory.json reference 分组）。
 * 本地 typed effect module：无 iframe、无 CDN、无第三方请求。
 */
export interface ShaderEffect {
  readonly vertexSource: string;
  readonly fragmentSource: string;
  readonly uniforms: readonly string[];
}

/** 青蓝雾气（毒雾/灵雾表现基础）。 */
export const mistEffect: ShaderEffect = {
  vertexSource: `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,
  fragmentSource: `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color;
void main() {
  vec2 uv = v_texCoord - 0.5;
  float r = length(uv);
  float mist = sin(uv.x * 10.0 + u_time) * sin(uv.y * 10.0 - u_time * 0.5);
  mist = smoothstep(0.2, -0.2, mist) * exp(-r * 3.0);
  vec3 color = u_color * mist;
  float alpha = mist * smoothstep(0.5, 0.1, r);
  gl_FragColor = vec4(color, alpha);
}`,
  uniforms: ['u_time', 'u_resolution', 'u_color'],
};

/** 闪电描边（辟邪神雷表现基础，移植自动效参考中的 SVG 折线思路）。 */
export const lightningPolyline: readonly [number, number][] = [
  [50, 10], [45, 40], [60, 35], [40, 70], [55, 65], [45, 90],
];
