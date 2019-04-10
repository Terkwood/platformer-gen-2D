#version 300 es
precision highp float;

uniform mat4 u_ViewProj;
uniform mat4 u_Model;

in vec2 vs_Pos;
in vec2 vs_Offset;
in vec2 vs_UV;

out vec2 fs_Pos;
out vec2 fs_UV;

void main() {
    fs_Pos = vs_Pos.xy;
    fs_UV = vs_UV;

    vec2 actualPos = vs_Pos + vs_Offset;
    gl_Position = u_ViewProj * u_Model * vec4(actualPos, 0, 1);
}