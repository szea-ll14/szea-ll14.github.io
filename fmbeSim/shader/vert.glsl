#version 300 es
in vec3 position;
in vec3 color;
in vec2 uv;
in vec3 normal;
uniform bool texLoaded;
uniform mat4 mvpMat;
uniform mat4 mAdjMat;

out vec3 vColor;
out vec2 vUv;
out float diff;

void main(void) {
  gl_Position = mvpMat * vec4(position, 1.);
  vColor = color;
  if (texLoaded) {
    vUv = uv;
    vec4 normalM = mAdjMat * vec4(normal, 0.);
    float r = length(normalM);
    if (r < .001) {
      diff = 1.;
    } else {
      diff = .713
            + .272 * normalM.y / r
            + .098 * (normalM.z * normalM.z - normalM.x * normalM.x) / r / r;
    }
  }
}