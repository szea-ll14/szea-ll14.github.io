#version 300 es
precision mediump float;
uniform bool texLoaded;
uniform sampler2D tex;
in vec3 vColor;
in vec2 vUv;
in float diff;
out vec4 fragColor;

void main(void) {
  if (!texLoaded) {
    fragColor = vec4(vColor, 1.);
  } else {
    fragColor = texture(tex, vUv) * vec4(vec3(diff) , 1.);
  }
}
