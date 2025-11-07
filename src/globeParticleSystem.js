import * as THREE from "three";
export class GlobeParticleSystem {
  constructor(scene, baseGroup, mapBuilder, category, count = 20) {
    this.scene = scene;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const heightTerrain = mapBuilder.buildGlobe(
        100 +
          (Math.random() * baseGroup.children[0].geometry.parameters.radius) /
            20,
        Math.random() * 3,
        Math.random() * 3,
        category,
      );

      // random offset from origin
      heightTerrain.terrainGroup.position.x = (Math.random() - 0.5) * 3000;
      heightTerrain.terrainGroup.position.y = (Math.random() - 0.5) * 1600;
      heightTerrain.terrainGroup.position.z = (Math.random() - 0.5) * 1600;

      heightTerrain.terrainGroup.remove(heightTerrain.baseSphere);
      heightTerrain.terrainGroup.particle = true;
      heightTerrain.terrainGroup.particleId = i;
      heightTerrain.terrainGroup.interactable = true;
       heightTerrain.terrainGroup.markerConfig = {
        materialConfig: {
          color: "#175fa3",
          specular: "#b2b9bf",
          shininess: 100,
          emissive: "#b6d0db",
        },
      };
      

      // Add to scene
      this.scene.add(heightTerrain.terrainGroup);

      this.particles.push({
        terrainGroup: heightTerrain.terrainGroup,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000,
        ),
      });
    }
  }

  update(delta) {
    // move each “globe particle” over time
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.terrainGroup.position.addScaledVector(p.velocity, delta);

      // optionally, fade out or remove after a certain condition
      if (p.terrainGroup.position.length() > 1000) {
        this.scene.remove(p.terrainGroup);
        p.terrainGroup.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        this.particles.splice(i, 1);
      }
    }

    // return false if all particles are gone
    return this.particles.length > 0;
  }

  removeParticle(id) {
    const updatedParticles = this.particles.filter(
      (item) => item.terrainGroup.particleId !== id,
    );
    this.particles = updatedParticles;
  }
}
