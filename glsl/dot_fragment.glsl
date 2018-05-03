uniform vec3 color;
uniform sampler2D texture;
varying vec3 vColor;

varying float vKind;
varying float vAlpha;
void main() {
    // gl_FragColor = vec4( color * vColor, 1.0 );
    gl_FragColor = vec4(  color, 1.0 );
    vec2 pos0 = (vec2(1.0, 1.0) - gl_PointCoord) / 2.0 + vec2(0.0, 0.0);
    vec2 pos1 = (vec2(1.0, 1.0) - gl_PointCoord) / 2.0 + vec2(0.0, 1.0/2.0);
    // gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    vec4 color0 = gl_FragColor * texture2D( texture, pos0 );
    vec4 color1 = gl_FragColor * texture2D( texture, pos1 );
    gl_FragColor = (1.0-vKind) * color0 + vKind * color1;
    if ( gl_FragColor.a < ALPHATEST ) discard;
  }