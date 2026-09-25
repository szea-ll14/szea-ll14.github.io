#version 300 es
precision mediump float;

uniform sampler2D tex;

in vec2 vUv;
in float diff;
out vec4 fragColor;

void main(void) {
  fragColor = texture(tex, vUv) * vec4(vec3(diff) , 1.);
}
