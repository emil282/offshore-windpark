const MapView = require("./map-view-animation");
class TextureLoader {
  constructor(app) {
    this.app = app;
    this.errors = [];
    this.textures = {};

    // Add a pre-load middleware that does cache-busting
    app.loader.pre((resource, next) => {
      resource.url += `?t=${Date.now()}`;
      next();
    });

    // Add a post-load middleware that sets the scale mode
    app.loader.use((resource, next) => {
      if (resource.texture !== undefined) {
        resource.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      }
      if (resource.textures !== undefined) {
        Object.keys(resource.textures).forEach((id) => {
          resource.textures[id].baseTexture.scaleMode =
            PIXI.SCALE_MODES.NEAREST;
        });
      }
      next();
    });

    app.loader.onError.add((err, loader, resource) => {
      this.errors.push(`${err.message} (${resource.url})`);
    });
  }

  addSpritesheet(name) {
    this.app.loader.add(`./textures/${name}.json`, (resource) => {
      this.textures[name] = resource.textures;
    });
  }
  addGIF(animatedWT, app) {
    this.app.loader.add(`./textures/${animatedWT}.json`, (resource) => {
      this.textures[animatedWT] = new PIXI.AnimatedSprite(
        resource.spritesheet.animations.wt
      );
      // console.log(this.textures.animatedWT);
      // this.textures.animatedWT["baseTexture"] =
      //   this.textures.animatedWT._texture.baseTexture;
      // this.textures.animatedWT["orig"] = this.textures.animatedWT._texture.orig;
      // this.textures.animatedWT["_uvs"] = this.textures.animatedWT._texture._uvs;
      app.stage.addChild(this.textures.animatedWT);
      app.ticker.add(this.animate(this.textures.animatedWT, app));
    });
  }
  animate(animatedWT, app) {
    animatedWT.x = app.renderer.screen.width / 2;
    animatedWT.y = app.renderer.screen.height / 2;
  }

  addFolder(name, keys) {
    keys.forEach((key) => {
      this.app.loader.add(key, `./textures/${name}/${key}.png`, (resource) => {
        if (this.textures[name] === undefined) {
          this.textures[name] = {};
        }
        this.textures[name][key] = resource.texture;
      });
    });
  }

  load() {
    this.errors = [];
    return new Promise((resolve, reject) => {
      this.app.loader.load(() => {
        if (this.errors.length > 0) {
          reject(new Error(this.errors.join("<br>")));
        } else {
          resolve(this.textures);
        }
      });
    });
  }
}

module.exports = TextureLoader;
