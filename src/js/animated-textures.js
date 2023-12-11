class AnimatedTextureLoader {
  constructor(app) {
    this.app = app;
    this.animatedTextures = {};
    // const canvas = document.getElementById("mycanvas");
    this.img;

    console.log(PIXI.utils.TextureCache);
    this.loader = this.app.loader;
    // this.app.loader.add("animatedWT", "./textures/${animatedWT}.json");
    this.loader.onProgress.add(this.handleLoadProgress);
    this.loader.onLoad.add(this.handleLoadAsset);
    this.loader.onError.add(this.handleLoadError);
  }

  //   addAnimatedTexture(animatedSprite) {
  //     this.app.loader.add(animatedSprite, `./textures/${animatedSprite}.json`);
  //   }

  handleLoadProgress(loader, resource) {
    console.log(loader.progress + "% loaded");
  }

  handleLoadAsset(loader, resource) {
    console.log("asset loaded " + resource.name);
  }

  handleLoadError() {
    console.error("load error");
  }

  loadtexture(name) {
    return new Promise((resolve) => {
      this.loader.add(`./textures/${name}.json`, (resource) => {
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

      this.img.anchor.x = 0.5;
      this.img.anchor.y = 0.5;
      this.app.stage.addChild(this.img);

      this.img.animationSpeed = 0.1;
      this.img.play();

      this.img.onLoop = () => {
        console.log("loop");
      };
      this.img.onFrameChange = () => {
        console.log("currentFrame", this.img.currentFrame);
      };
      this.img.onComplete = () => {
        console.log("done");
      };

      this.app.ticker.add(this.animateTexture(this.img, this.app));

      resolve("resolved");
    });
  }

  // animateTexture(img, app) {
  //   img.x = app.renderer.screen.width / 2;
  //   img.y = app.renderer.screen.height / 2;
  // }
  async loadAnimatedTextures(name, frame) {
    const result = await this.addAnimatedTexture(name, frame);
    console.log(result);
    return new Promise((resolve) => {
      this.app.loader.load(() => {
        {
          resolve(this.animatedTextures);
        }
      });
    });
  }
}
module.exports = AnimatedTextureLoader;
