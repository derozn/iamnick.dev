precision highp float;

uniform sampler2D cloudTexture;
uniform float time;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vColor;
varying float vBlink;
varying float vDelay;

void main() {
  vec2 p = vUv * 2.0 - 1.0; // Make between 0-1
  vec3 color = vec3(0.0);
  vec4 texColor = texture2D(cloudTexture, vUv);

  float pct = abs(sin(time * 0.2 + vDelay * 0.2));
  
  vec3 rdzColor = mix(vec3(0.8, 0.28, 0.28), vec3(0.8, 0.49, 0.28), pct);

  color = (texColor.rgb - vBlink * length(p) * 0.8) * rdzColor;

  float opacity = texColor.a * 0.1;

  gl_FragColor = vec4(color, opacity);
}