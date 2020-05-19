precision highp float;

uniform sampler2D particleTexture;

varying vec2 vPUv;
varying vec2 vUv;

const float border = 0.3;
const float radius = 0.5;

void main() {
  vec4 color = vec4(0.0);
  vec2 uv = vUv;
  vec2 puv = vPUv;

  vec4 texColor = texture2D(particleTexture, puv);

	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);

  color = texColor;
	color.a = t;

  gl_FragColor = color;
}