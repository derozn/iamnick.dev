// Thanks to https://github.com/mattdesl/lwjgl-basics/wiki/ShaderLesson3

uniform int byp;
uniform sampler2D u_texture;
uniform float radius;
uniform float softness;
uniform vec3 color;

varying vec2 vUv;

#pragma glslify: vignette = require(glsl-vignette/advanced)

void main() {  
  if (byp < 1) {
    vec4 texColor = texture2D(u_texture, vUv);

    float vignetteValue = vignette(vUv, vec2(0.36, 0.36), radius, softness);

    texColor.rgb = mix(color.rgb, texColor.rgb, vignetteValue);

    gl_FragColor = texColor;
  } else {
    gl_FragColor = texture2D(u_texture, vUv);
  }
}
