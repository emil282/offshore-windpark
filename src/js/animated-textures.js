class AnimatedTextureLoader {
  constructor(app) {
    this.AnimationApp = app;
    this.animatedTextures = {};
    this.img;
    this.AnimationApp.loader.onProgress.add(this.handleLoadProgress);
    this.AnimationApp.loader.onLoad.add(this.handleLoadAsset);
    this.AnimationApp.loader.onError.add(this.handleLoadError);
  }

  handleLoadProgress(loader, resource) {
    // console.log(loader.progress + "% loaded");
  }

  handleLoadAsset(loader, resource) {
    // console.log("asset loaded " + resource.name);
  }

  handleLoadError() {
    console.error("load error");
  }

  /**
   * loads the texture which will be animated
   * @param {*} name name of the JSON File
   * @returns returns the JSOn file
   */
  loadtexture(name) {
    return new Promise((resolve) => {
      this.AnimationApp.loader.add(`./textures/${name}.json`, (resource) => {
        resolve(resource);
      });
    });
  }
  /**
   * loads the textures and turns them into animated sprites
   * @param {*} name name of the JSON File
   * @param {*} frame name of the frames in the spritesheet (e.g. wt01, wt02,..)
   * @returns animated sprite with the animation frames
   */
  async addAnimatedTexture(name, frame) {
    const resource = await this.loadtexture(name);
    this.animatedTextures[name] = resource.spritesheet;
    return new Promise((resolve) => {
      this.img = new PIXI.AnimatedSprite(
        this.animatedTextures[name].animations[frame]
      );
      resolve("resolved");
    });
  }
  /**
   * adds the animated textures to the app object
   * @param {*} name name of the JSON File
   * @param {*} frame name of the frames in the spritesheet (e.g. wt01, wt02,..)
   * @returns the animated sprite as a texture array with the animation frames
   */
  async loadAnimatedTextures(name, frame) {
    const result = await this.addAnimatedTexture(name, frame);
    return new Promise((resolve) => {
      this.AnimationApp.loader.load(() => {
        {
          let result = [this.animatedTextures, this.AnimationApp];
          resolve(result);
        }
      });
    });
  }
}

module.exports = AnimatedTextureLoader;
