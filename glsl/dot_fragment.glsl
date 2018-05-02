uniform vec3 color;
uniform sampler2D texture;
varying vec3 vColor;

varying float vKind;
varying float vAlpha;
void main() {
    // gl_FragColor = vec4( color * vColor, 1.0 );
    gl_FragColor = vec4(  color, 1.0 );
    vec2 pos = (vec2(1.0, 1.0) - gl_PointCoord) / 2.0 + vec2(0, vKind/2.0);
    // gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    gl_FragColor = gl_FragColor * texture2D( texture, pos );
    if ( gl_FragColor.a < ALPHATEST ) discard;
  }