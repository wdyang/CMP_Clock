#define M_PI 3.1415926535897932384626433832795
#define MaxImpacts 100
#define IMPACT_CYCLES 4.0
#define EARTH_RADIUS 205.0

uniform float time;

attribute float size;
attribute float alpha;
attribute float kind;
attribute vec3 customColor;

varying vec3 vColor;

varying float vAlpha;
varying float vKind; // is this tree or human

float degToRad( float deg ){
  return deg/180.0 * M_PI;
}

// from [lat, lon, mag] in degree to [lat, lon, mag] in radiant
vec3 getRadCoord(vec3 pos){
  return vec3( degToRad(pos.x), degToRad(pos.y - 90.0), pos.z);
}

// from radiant coordinate to 3D model coordinate
vec3 project(vec3 coord){
  vec3 pos;

  float lat = coord.x;
  float lon = coord.y;

  pos.x = lon*60.0; // too slow to adjust js code, adjust here
  pos.y = lat*60.0;
  pos.z = 0.0;

  return pos;
}

void main() {
  vColor = customColor;

  vAlpha = alpha;
  vKind = kind;

  vec3 pos;
  
  vec3 posLatLon = vec3(position.xy, 0); //can't reassign attibute

  vec3 radCoord = getRadCoord(posLatLon);

  vec3 pos3d = project(radCoord);      

  vec4 mvPosition = modelViewMatrix * vec4( pos3d, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z ) *5.0;
  gl_Position = projectionMatrix * mvPosition;
}
