#define Pi 3.1415926535897932384626433832795
#define IMPACT_CYCLES 0.5
#define EARTH_RADIUS 205.0
#define MaxImpacts 1000


uniform float time;
uniform int numImpacts;
uniform vec4 impacts[ MaxImpacts ];
uniform float rise;
uniform float fall;
uniform float radius;
uniform int animType;

attribute vec3 customColor;
attribute float isEnd; // end of the lineSegment

// varying vec3 vColor;

float degToRad( float deg ){
  return deg/180.0 * Pi;
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

  // float dir = 250.0 + 50.0*sin(time);
  // float dir = 300.0 + 5.0 * float(numImpacts);
  float dir = EARTH_RADIUS + coord.z;
  pos.x = dir*cos(lat)*sin(lon);
  pos.y = dir*sin(lat);
  pos.z = dir*cos(lat)*cos(lon);

  return pos;
}

// wavefunction y = sin(w * t - k * x - phase) 
//          = sin(2pi(f * t - x/lambda) - phase)
// w = 2pi * frequency
// k = 2pi / wavelength
// wave speed v = lambda * f = k/w
// lambda = v / f = v * 2pi / w

vec3 calImpact(vec3 pos, vec4 impact){
  float w = 1.0; // how fast we want the wave to oscilate, higher the faster and shorter pitch
  float velocity = 10.0; //how fast we want the wave to propogate
  float magnitude = sqrt(impact[2]); // limit the range

  vec3 center = impact.xyz;
  float r = distance(center, pos) + 0.1;
  vec3 offset = vec3(0,0,0);

  float dTime = time - impact[3];
  float phase =  w*(r / velocity - dTime);

  float fitAngle = IMPACT_CYCLES * Pi;

  if( phase < 0.0 && phase > -2.0* fitAngle){
    float envelop = (fitAngle - abs(phase + fitAngle)) / fitAngle;
    float displacement = envelop * envelop * magnitude * 20.0 * sin(phase)*sin(phase) / (1.0+dTime*dTime*5.0); // let it decay faster
    vec3 direction = pos - center;
    offset += 0.5 * displacement * direction / r;
    offset.z = displacement;
  }
  // offset.x = 300.0*sin(0.1*time);
  return offset;
}

vec3 calImpactStay(vec3 pos, vec4 impact){
  float w = 1.0; // how fast we want the wave to oscilate, higher the faster and shorter pitch
  float velocity = 9.0; //how fast we want the wave to propogate
  float riseSpeed = rise;//0.5;
  float fallSpeed = fall;//0.2;
  float radiusScale = radius;
  int type = animType;
  float scale = 0.0;

  float magnitude = sqrt(impact[2]); // limit the range

  vec3 center = impact.xyz;
  float r = distance(center, pos);
  float height = 0.0;

  float dTime = time - impact[3]; // time since impact
  float vTime = dTime - r/velocity; // time since impact reach the site
  float fTime = vTime - 1.0/riseSpeed; // time since fall starts

  if(vTime > 0.0){
    height = min(vTime * riseSpeed, 1.0);
  }
  if(fTime > 0.0){
    height = max(1.0 - fTime * fallSpeed, 0.0);
  }

  float spreadArea = magnitude*radiusScale; // no animation
  if (type == 1) {
      spreadArea = (magnitude*radiusScale)*(height*1.2); // pulse
  }
  
  if(r< spreadArea){ // spread to distance of 4
    scale = 1.0 - 0.1 * r;
  } else{
     scale = max((scale - 0.2*(r-spreadArea)), 0.0);  // maximum reach 7
  }

  height = height * magnitude * scale; // localize impact

  return vec3(0.0, 0.0, height);
}

float envelope(float phase, float width, float r){
  float x =  r / width/phase * Pi;
  float y = sin(x)/x + 1.0/(x+0.1);
  // if(y < 0.0) y = 0.0;
  if(x > 4.0) y = 0.0;

  return y;
}

float envelopeSquare(float phase, float width, float r){
  float x = r/(phase * width * 4.0);
  if( x > 1.0){
    return 0.0;
  }else{
    return 1.0;
  }
  // if(r>phase * width * 4.0){
  //   return 0.0;
  // }else{
  //   return 1.0;
  // }
}

float envelopeSharp(float phase, float width, float r){
  float x = r / (phase * width * 1.0);
  float offset = 0.5;
  if(x>1.0){
    return 0.0;
  }else if(x>0.75){
    return 0.1+offset;
  }else if(x>0.5){
    return 0.2+offset;
  }else if(x > 0.25){
    return 0.4+offset;
  }else if(x > 0.0){
    return 0.8+offset;
  }
}

// return phase of impact
// 0: start, => 1, full, => 0: finish
float getPhase(float riseTime, float pauseTime, float fallTime, float t){
  float phase = 0.0;

  // rising
  if(t< riseTime){
    phase = t / riseTime;
  }else if(t < (riseTime + pauseTime)){
    phase = 1.0;
  }else if( t< (riseTime + pauseTime + fallTime)){
    phase = 1.0 - (t - riseTime - pauseTime) / fallTime;
  }

  // phase = phase > 0.1 ? 1.0 : 0.0;
  return phase;
}

vec3 calImpactPulse(vec3 pos, vec4 impact){
  float w = 1.0; // how fast we want the wave to oscilate, higher the faster and shorter pitch
  float riseTime = 3.0;
  float pauseTime = 0.4;
  float fallTime = 6.0;//0.6;
  float riseDuration = 2.0 ; //let it rise for 2 second

  // float magnitude = sqrt(impact[2]); // limit the range
  // magnitude:
  // 2.0 is the minimum for impact to show, we need to show a small circle
  // 10 makes it significant
  // incoming data is: count ^ 1/3 mapped to 1-100
  float magnitude =  2.0 +impact[2]/10.0; // We did power of 1/3 in main.js, so keep this linear for now
  // magnitude = 2.0; // testing lower end
  // if(mod(impact.x,10.0) > 6.0){
  //   magnitude = 11.0;  // testing high end
  // }
  
  float dTime = time - impact[3]; // time since impact

  float phase = getPhase(riseTime, pauseTime, fallTime, dTime);

  vec3 center = impact.xyz;
  float r = distance(center, pos) + 0.1;

  // float height = envelope(scale * magnitude, r) * magnitude *2.0;

  // float envelopeWidth = magnitude / 4.0 + 5.5; // map (2, 12) = (6, 8.5)
  float envelopeWidth = magnitude / 8.0 + 5.5; // map (2, 12) = (6, 8.5)
  
  float height = envelopeSquare(phase, envelopeWidth, r);

  height = height * (magnitude + 0.0) / 1.0;

  return vec3(0.0, 0.0, height);
}

void main() {
  // vColor = customColor;
  vec3 pos;
  vec3 center = vec3(0.0,0.0, 0.0); //ripple
  vec3 posLatLon = vec3(position.xy, 0); //can't reassign attibute
  // vec3 posLatLon = vec3(0.0, 0.0, 0.0); //can't reassign attibute

  for( int i = 0; i< MaxImpacts; i++){
    if(i<numImpacts){
      // posLatLon += calImpact(position, vec4(0,0,0, 0));
      vec3 offset = calImpactPulse(position, impacts[i]); 
      posLatLon += vec3(offset.xy, offset.z * offset.z * (0.0 + isEnd));

      // posLatLon += calImpact(position, impacts[i]);
      // vec3 offset = calImpactStay(position, impacts[i]); 
      // posLatLon += vec3(offset.xy, offset.z * (0.0 + 10.0 * isEnd));
    }
  }
  posLatLon.z = sqrt(posLatLon.z) * 30.0;

  vec3 radCoord = getRadCoord(posLatLon);
  radCoord.z += 0.0 + 1.0 * isEnd;// + 2.0 * float(numImpacts);

  vec3 pos3d = project(radCoord);      
  // pos3d.x = 0.;
  // pos3d.y = 0.;
  // pos3d.z = 100.0*isEnd;
  vec4 mvPosition = modelViewMatrix * vec4( pos3d, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  // gl_PointSize = 100.0;
}