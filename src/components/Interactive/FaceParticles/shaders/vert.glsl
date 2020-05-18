precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 offset;
attribute float pindex;
attribute float angle;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D faceTexture;
uniform vec2 faceTextureSize;

uniform float random;
uniform float time;
uniform float depth;
uniform float size;

varying vec3 vPosition;
varying vec2 vUv;
varying vec2 vPUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float randomFloat(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main(void) {
  vPosition = position;
  vUv = uv;

  // Particle UV
  vec2 puv = offset.xy / faceTextureSize;
  vPUv = puv;

  // Color of pixel
  vec4 color = texture2D(faceTexture, puv);
  float grey = color.r * 0.21 * color.g * 0.71 * color.b * 0.07;

  // Displacement
  vec3 displaced = offset;

  // Randomise
  displaced.xy += vec2(randomFloat(pindex) - 0.5, randomFloat(offset.x + pindex) - 0.5) * random;
	float rndz = (randomFloat(pindex) + snoise2(vec2(pindex * 0.1, time * 0.01)));
	displaced.z += rndz * (randomFloat(pindex) * 2.0 * depth);

	// center
	displaced.xy -= faceTextureSize * 0.5;

  // Particle Size
  float psize = (snoise2(vec2(time, pindex) * 0.5) + 2.0);
  psize *= max(grey, 0.2);
  psize *= size;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  mvPosition.xyz += position * psize;

  gl_Position = projectionMatrix * mvPosition;
}