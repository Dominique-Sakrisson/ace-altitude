varying float vAmount;


uniform float waterDeepColorDepth;
uniform float waterDeepLow;
uniform float waterDeepTop;

uniform float waterColorDepth;
uniform float waterLow;
uniform float waterTop;

uniform float sandColorDepth;
uniform float sandLow;
uniform float sandTop;

uniform float grassColorDepth;
uniform float grassLow;
uniform float grassTop;

uniform float rockColorDepth;
uniform float rockLow;
uniform float rockTop;

uniform float snowColorDepth;
uniform float snowLow;
uniform float snowTop;

void main(){
    vec3 waterDeep = (smoothstep(0.01, 0.15, vAmount  ) - smoothstep(waterDeepLow,waterDeepTop, vAmount))  * vec3(0.0,0.0,1.0);
    vec3 water = (smoothstep(0.15, .16, vAmount ) - smoothstep(waterLow, waterTop, vAmount))  * vec3(0.0,0.0,1);
    vec3 sand = (smoothstep(.20, .23, vAmount  ) - smoothstep(sandLow, sandTop, vAmount))  * vec3(0.76,0.7,0.5);
    vec3 grass = (smoothstep(.20, .50, vAmount ) - smoothstep(grassLow, grassTop, vAmount))  * vec3(0.0,0.6,0.01);
    vec3 rock = (smoothstep(.40, .50, vAmount ) - smoothstep(rockLow, rockTop, vAmount))  * vec3(0.28,0.25,0.23);
    vec3 snow = (smoothstep(.60, .8, vAmount ))  * vec3(1.0,1.0,1.0);

    gl_FragColor = vec4( waterDeep + water  + sand + grass + rock + snow, 1.0);
    
}
