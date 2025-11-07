import * as THREE from "three";

// BloodParticleSystem manages a burst of blood
export class BloodParticleSystem {
  constructor(scene, position, normal) {
    this.scene = scene;
    this.particles = [];
    this.lifetime = 1.5; // seconds
    this.age = 0;

    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const sizes = [];


    //for each particle generate a new vector (velocity) with an x,y,z direction
    for (let i = 0; i < particleCount; i++) {
      // start at hit point
      positions.push(position.x, position.y, position.z);

      // random spray direction biased by surface normal
      const dir = normal.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 0.9
      )).normalize();

      velocities.push(dir.x * (Math.random() * 100), 
                      dir.y * (Math.random() * 100), 
                      dir.z * (Math.random() * 100));

      sizes.push(3 + Math.random() * 3); // pixel size
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      // color: 0x8b0000, // dark red
      color: 0xc0c0c0, // base silver
      size: 0.05 + Math.random() * 5,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  update(delta) {
    this.age += delta;
    const positions = this.points.geometry.attributes.position;
    const velocities = this.points.geometry.attributes.velocity;

    for (let i = 0; i < positions.count; i++) {
      positions.array[i * 3]     += velocities.array[i * 3] * delta;
      positions.array[i * 3 + 1] += velocities.array[i * 3 + 1] * delta - 0.98 * delta; // gravity
      positions.array[i * 3 + 2] += velocities.array[i * 3 + 2] * delta;
    }

    // Fade out over time
    this.points.material.opacity = Math.max(0, 1 - this.age / this.lifetime);

    positions.needsUpdate = true;

    // Remove when done
    if (this.age > this.lifetime) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
      this.points.material.dispose();
      return false; // signal to remove from manager
    }
    return true;
  }
}
