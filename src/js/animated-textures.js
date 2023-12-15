class AnimatedTextureLoader {
  constructor(app) {
    this.app = app;
    this.textures = {};
    // const canvas = document.getElementById("mycanvas");
    this.img;

    console.log(PIXI.utils.TextureCache);

    // this.app.loader.add("animatedWT", "./textures/${animatedWT}.json");
    this.app.loader.onProgress.add(this.handleLoadProgress);
    this.app.loader.onLoad.add(this.handleLoadAsset);
    this.app.loader.onError.add(this.handleLoadError);
    this.app.loader.load(this.handleLoadComplete);
  }

  addAnimatedTexture(animatedSprite) {
    this.app.loader.add(animatedSprite, `./textures/${animatedSprite}.json`);
  }

  handleLoadProgress(loader, resource) {
    console.log(loader.progress + "% loaded");
  }

  handleLoadAsset(loader, resource) {
    console.log("asset loaded " + resource.name);
  }

  handleLoadError() {
    console.error("load error");
  }

  handleLoadComplete(name) {
    this.textures[name] = this.app.loader.resources[name].spritesheet;
    this.img = new PIXI.AnimatedSprite(this.texture.animations.wt);
    this.img.anchor.x = 0.5;
    this.img.anchor.y = 0.5;
    this.app.stage.addChild(img);

    this.img.animationSpeed = 0.1;
    this.img.play();

    this.img.onLoop = () => {
      console.log("loop");
    };
    this.img.onFrameChange = () => {
      console.log("currentFrame", img.currentFrame);
    };
    this.img.onComplete = () => {
      console.log("done");
    };

    this.app.ticker.add(animate);
  }

  animate() {
    this.img.x = this.app.renderer.screen.width / 2;
    this.img.y = this.app.renderer.screen.height / 2;
  }
  loadAnimatedTextures() {
    return new Promise((resolve, reject) => {
      this.app.loader.load(() => {
        {
          resolve(this.textures);
        }
      });
    });
  }
}
module.exports = AnimatedTextureLoader;
