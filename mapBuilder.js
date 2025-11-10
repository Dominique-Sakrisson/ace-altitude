import * as THREE from "three";
import * as dat from "lil-gui";
import vertexShader from "./src/shaders/vertexWorldOceanHeightMap.glsl?raw";
import fragmentShader from "./src/shaders/fragmentWorldOceanHeightMap.glsl?raw";
export class MapBuilder {
  constructor(gameState) {
    this.gameState = gameState;
    /*shaders stuff */
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.bumpScale = 10;
    this.disMap = new THREE.TextureLoader()
      // .setPath("./public/")
      // .load("worldHeightMap.png");
      // .load("shirtGrey.png");
      // .load("cityHeightMap.png");
      .load("worldOceanHeightMap.png");
    // .load("usaHeightMap.png");
    // .load("heightMap.png");
    this.vPositions = {
      waterDark: { low: 0.1, top: 0.17 }, // good
      water: { low: 0.1, top: 0.25 },
      sand: { low: 0.21, top: 0.23 },
      grass: { low: 0.35, top: 0.36 },
      rock: { low: 0.62, top: 0.65 },
      snow: { low: 0.7, top: 0.7 },
    };
    this.flatTerrainTexture = this.gameState.TextureLoader.load(
      "grass.jpg",
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1); // Adjust the 10,10 to control the tiling size
      },
    );
    this.uniforms = {
      //global options
      bumpTexture: { value: this.disMap },
      bumpScale: { value: this.bumpScale },
      //layer color options
      waterDeepColorDepth: {
        value: 0,
      },
      waterColorDepth: {
        value: 0,
      },
      sandColorDepth: { value: 0 },
      grassColorDepth: { value: 0 },
      rockColorDepth: { value: 0 },
      snowColorDepth: { value: 0 },
      //layer positions
      waterDeepLow: { value: this.vPositions.waterDark.low },
      waterDeepTop: { value: this.vPositions.waterDark.top },
      waterLow: { value: this.vPositions.water.low },
      waterTop: { value: this.vPositions.water.top },
      sandLow: { value: this.vPositions.sand.low },
      sandTop: { value: this.vPositions.sand.top },
      grassLow: { value: this.vPositions.grass.low },
      grassTop: { value: this.vPositions.grass.top },
      rockLow: { value: this.vPositions.rock.low },
      rockTop: { value: this.vPositions.rock.top },
      snowLow: { value: this.vPositions.snow.low },
      snowTop: { value: this.vPositions.snow.top },
    };
    this.groundMaterialShader = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });
  }
  buildSkybox() {
    const skyboxTexture = this.gameState.CTextureLoader.load(
      Array(6).fill("sky.jpg"),
    );
    return skyboxTexture;
  }

  async buildFlatTerrain(width, height, depth, texture, tileX, tileY) {
    return this.genFlatTerrain(width, height, depth, texture, tileX, tileY);
  }
  //handles all the calling for internal world building
  buildGlobe(radius, heightSegments, widthSegments, category) {
    const options = { radius, heightSegments, widthSegments, category };
    // const groundMaterialShader = await this.generateGlobeShader();
    const heightTerrain = this.genHeightTerrain(
      this.groundMaterialShader,
      options,
    );

    return heightTerrain;
  }

  async genFlatTerrain(
    width,
    height,
    depth,
    texture,
    xTyling = 1,
    yTyling = 1,
  ) {
    let terrainTexture;
    const groundWidth = width;
    const groundHeight = height;
    const groundDepth = depth;

    const groundGeometry = new THREE.BoxGeometry(
      groundWidth,
      groundHeight,
      groundDepth,
    );
    if (texture) {
      terrainTexture = this.gameState.TextureLoader.load(texture, (t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(xTyling, yTyling); // Adjust the 10,10 to control the tiling size
      });
    } else {
      terrainTexture = this.flatTerrainTexture;
    }
    let groundMaterial;
    if (terrainTexture) {
      groundMaterial = new THREE.MeshPhongMaterial({
        map: terrainTexture,
      });
    }
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

    return { groundGeometry, groundMaterial, terrainTexture, groundMesh };
  }

  async loadShader(url) {
    const response = await fetch(url);
    return response.text();
  }

  // async generateGlobeShader() {
  //   const vertexShader = await this.loadShader(
  //     "./src/shaders/vertexWorldOceanHeightMap.glsl",
  //   );
  //   const fragmentShader = await this.loadShader(
  //     "./src/shaders/fragmentWorldOceanHeightMap.glsl",
  //   );
  //   const groundMaterialShader = new THREE.ShaderMaterial({
  //     uniforms: this.uniforms,
  //     vertexShader,
  //     fragmentShader,
  //   });
  //   return groundMaterialShader;
  // }

  genHeightTerrain(groundMaterialShader, options) {
    const gui = new dat.GUI();
    const { radius, heightSegments, widthSegments, category } = options;
    const sphereFolder = gui.addFolder("Sphere Controls");
    this.buildGui(sphereFolder);

    // const sphereGeoOptions = {
    //   radius: options.w,
    //   polyX: 64,
    //   polyY: 64,
    // };

    const groundGeo = new THREE.SphereGeometry(
      radius,
      heightSegments,
      widthSegments,
    );

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      side: THREE.BackSide, // render inside
      roughness: 0.7,
      metalness: 0.2,
    });

    const baseSphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, heightSegments, widthSegments),
      baseMat,
    );

    const groundMesh = new THREE.Mesh(groundGeo, groundMaterialShader); // this is with shaderMaterial
    groundMesh.receiveShadow = true;

    sphereFolder
      .add(groundMesh.geometry.parameters, "radius", 0, 3000, 15)
      .name("radius for earth")
      .onChange((value) => {
        // ensure base is always smaller
        // baseSphere.geometry.dispose();
        if (sphereGeoOptions.radius >= value) {
          let newRadius = value - 100;
          sphereGeoOptions.radius = newRadius;

          baseSphere.geometry = new THREE.SphereGeometry(newRadius, 64, 64);
        }
        if (sphereGeoOptions.radius <= value) {
          let newRadius = value - 100;
          sphereGeoOptions.radius = newRadius;
          baseSphere.geometry = new THREE.SphereGeometry(value - 100, 64, 64);
        }
        // groundMesh.geometry.dispose(); // cleanup old geometry
        groundMesh.geometry = new THREE.SphereGeometry(
          value,
          groundMesh.geometry.parameters.heightSegments,
          groundMesh.geometry.parameters.widthSegments,
        );
      });
    sphereFolder
      .add(groundMesh.geometry.parameters, "heightSegments", 0, 1000, 5)
      .onChange((value) => {
        groundMesh.geometry.dispose(); // cleanup old geometry
        groundMesh.geometry = new THREE.SphereGeometry(
          groundMesh.geometry.parameters.radius,
          value,
          groundMesh.geometry.parameters.widthSegments,
        );
      });
    sphereFolder
      .add(groundMesh.geometry.parameters, "widthSegments", 0, 1000, 5)
      .onChange((value) => {
        groundMesh.geometry.dispose(); // cleanup old geometry
        groundMesh.geometry = new THREE.SphereGeometry(
          groundMesh.geometry.parameters.radius,
          groundMesh.geometry.parameters.widthSegments,
          value,
        );
      });

    const terrainGroup = new THREE.Group();
    terrainGroup.add(groundMesh);
    terrainGroup.add(baseSphere);
    terrainGroup.name = "earthSphere";
    terrainGroup.category = category;
    terrainGroup.interactable = false;
    terrainGroup.markerConfig = {
      materialConfig: {
        type: "earth",
        color: "#804e33",
        specular: "#b2b9bf",
        shininess: 100,
        emissive: "#804e33",
      },
    };

    return { groundGeo, groundMesh, terrainGroup, baseSphere };
  }

  buildGui(sphereFolder) {
    // create a folder

    sphereFolder.add(this, "bumpScale", 0, 1000, 1).onChange((value) => {
      this.uniforms.bumpScale.value = value;
    });

    //deep water layer
    sphereFolder
      .add(this.uniforms.waterDeepLow, "value", 0.001, 1, 0.01)
      .name("deepWaterBottom")
      .onChange((value) => {
        this.uniforms.waterDeepLow.value = value;
      });

    sphereFolder
      .add(this.uniforms.waterDeepTop, "value", -1, 1, 0.01)
      .name("deepWaterTop")
      .onChange((value) => {
        this.uniforms.waterDeepTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.waterDeepColorDepth, "value", -1, 1, 0.1)
      .name("deep water color depth")
      .onChange((value) => {
        this.uniforms.waterDeepColorDepth.value = value;
      });

    // shallow water layer
    sphereFolder
      .add(this.uniforms.waterLow, "value", -1, 1, 0.01)
      .name("Water bottom")
      .onChange((value) => {
        this.uniforms.waterLow.value = value;
      });
    sphereFolder
      .add(this.uniforms.waterTop, "value", -1, 1, 0.01)
      .name("Water Top")
      .onChange((value) => {
        this.uniforms.waterTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.waterColorDepth, "value", -1, 1, 0.1)
      .name(" water color depth")
      .onChange((value) => {
        this.uniforms.waterDeepColorDepth.value = value;
      });

    //sand layer
    sphereFolder
      .add(this.uniforms.sandLow, "value", -1, 1, 0.01)
      .name("sand layer low level")
      .onChange((value) => {
        this.uniforms.sandLow.value = value;
      });
    sphereFolder
      .add(this.uniforms.sandTop, "value", -1, 1, 0.01)
      .name("sand layer top level")
      .onChange((value) => {
        this.uniforms.sandTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.sandColorDepth, "value", -1, 1, 0.1)
      .name("sand layer color dept")
      .onChange((value) => {
        this.uniforms.sandColorDepth.value = value;
      });
    //grass layer
    sphereFolder
      .add(this.uniforms.grassLow, "value", -1, 1, 0.01)
      .name("grass layer low level")
      .onChange((value) => {
        this.uniforms.grassLow.value = value;
      });
    sphereFolder
      .add(this.uniforms.grassTop, "value", -1, 1, 0.01)
      .name("grass layer top level")
      .onChange((value) => {
        this.uniforms.grassTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.grassColorDepth, "value", -1, 1, 0.1)
      .name("grass layer color dept")
      .onChange((value) => {
        this.uniforms.grassColorDepth.value = value;
      });
    //rock layer
    sphereFolder
      .add(this.uniforms.rockLow, "value", -1, 1, 0.01)
      .name("rock layer low level")
      .onChange((value) => {
        this.uniforms.rockLow.value = value;
      });
    sphereFolder
      .add(this.uniforms.rockTop, "value", -1, 1, 0.01)
      .name("rock layer top level")
      .onChange((value) => {
        this.uniforms.rockTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.rockColorDepth, "value", -1, 1, 0.1)
      .name("rock layer color dept")
      .onChange((value) => {
        this.uniforms.rockColorDepth.value = value;
      });
    //snow layer
    sphereFolder
      .add(this.uniforms.snowLow, "value", 0, 1, 0.01)
      .name("snow layer low level")
      .onChange((value) => {
        this.uniforms.snowLow.value = value;
      });
    sphereFolder
      .add(this.uniforms.snowTop, "value", 0, 1, 0.01)
      .name("snow layer top level")
      .onChange((value) => {
        this.uniforms.snowTop.value = value;
      });
    sphereFolder
      .add(this.uniforms.snowColorDepth, "value", 0, 1, 0.1)
      .name("snow layer color dept")
      .onChange((value) => {
        this.uniforms.snowColorDepth.value = value;
      });
    // open the folder by default
    sphereFolder.open();
  }
}
