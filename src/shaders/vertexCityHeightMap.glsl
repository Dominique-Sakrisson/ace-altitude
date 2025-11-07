uniform sampler2D bumpTexture;
uniform float bumpScale;
varying float vAmount;

// Simple pseudo-random function based on UV
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec4 bumpData = texture2D(bumpTexture, uv);
    float height = bumpData.r;

    float steps = 5.0;
    height = floor(height * steps) / steps;

 // Mask to detect "building" areas (bright pixels)
    float buildingMask = step(0.8, height); // tweak threshold to match your buildings

     float variation = rand(uv) * 0.3; // scale variation as needed
    height += buildingMask * variation;
    
    vAmount = height; // pass to fragment if needed

    vec3 newPosition = position + normal * bumpScale * height;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0);
}
