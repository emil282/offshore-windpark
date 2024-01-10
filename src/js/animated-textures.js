class AnimatedTextureLoader {
  constructor(app) {
    this.AnimationApp = app;
    this.animatedTextures = {};
    // const canvas = document.getElementById("mycanvas");
    this.img;

    // this.loader = this.AnimationApp.loader;
    // this.app.loader.add("animatedWT", "./textures/${animatedWT}.json");
    this.AnimationApp.loader.onProgress.add(this.handleLoadProgress);
    this.AnimationApp.loader.onLoad.add(this.handleLoadAsset);
    this.AnimationApp.loader.onError.add(this.handleLoadError);
  }

  //   addAnimatedTexture(animatedSprite) {
  //     this.app.loader.add(animatedSprite, `./textures/${animatedSprite}.json`);
  //   }

  handleLoadProgress(loader, resource) {
    // console.log(loader.progress + "% loaded");
  }

  handleLoadAsset(loader, resource) {
    // console.log("asset loaded " + resource.name);
  }

  handleLoadError() {
    console.error("load error");
  }

  loadtexture(name) {
    return new Promise((resolve) => {
      this.AnimationApp.loader.add(`./textures/${name}.json`, (resource) => {
        resolve(resource);
      });
    });
  }
  async addAnimatedTexture(name, frame) {
    const resource = await this.loadtexture(name);
    console.log(resource);
    this.animatedTextures[name] = resource.spritesheet;
    return new Promise((resolve) => {
      this.img = new PIXI.AnimatedSprite(
        this.animatedTextures[name].animations[frame]
      );
      // this.img.anchor.x = 0.5;
      // this.img.anchor.y = 0.5;
      // this.AnimationApp.stage.addChild(this.img);

      // this.img.animationSpeed = 0.1;
      // this.img.play();

      // this.img.onLoop = () => {
      //   console.log("loop");
      // };
      // this.img.onFrameChange = () => {
      //   console.log("currentFrame", this.img.currentFrame);
      // };
      // this.img.onComplete = () => {
      //   console.log("done");
      // };
      // this.img.stop();
      // this.app.ticker.add(this.animateTexture(this.img, this.app));

      resolve("resolved");
    });
  }

  // animateTexture(img, app) {
  //   img.x = app.renderer.screen.width / 2;
  //   img.y = app.renderer.screen.height / 2;
  // }
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
