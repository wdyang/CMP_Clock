uniform vec3 color;
uniform sampler2D texture;
varying vec3 vColor;
void main() {
    // gl_FragColor = vec4( color * vColor, 1.0 );
    // gl_FragColor = vec4(gl_PointCoord.s, gl_PointCoord.t, 0, 1.0);
    // gl_FragColor = vec4(vColor, 1.0);
    //#FF8800 255,136, 0
    gl_FragColor = vec4(1, 0.53333333, 0, 1); //max should be 1.0 for each channel
}