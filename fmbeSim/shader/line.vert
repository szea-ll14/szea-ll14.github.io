#version 300 es

in vec3 position;
in vec3 color;
uniform mat4 mvpMat;

out vec3 vColor;

void main(void) {
  gl_Position = mvpMat * vec4(position, 1.);
  vColor = color;
}
