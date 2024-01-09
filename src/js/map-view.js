/* globals PIXI */
const EventEmitter = require("events");
const Array2D = require("./lib/array-2d");
const { getTileTypeId } = require("./lib/config-helpers");
const PencilCursor = require("../../static/fa/pencil-alt-solid.svg");

class MapView {
  constructor(
    city,
    config,
    textures,
    dataManager,
    animatedTextures,
    animatedApp
  ) {
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.animatedTextures = animatedTextures;

    this.animatedApp = animatedApp;
    this.events = new EventEmitter();
    this.roadTileId = getTileTypeId(config, "road");
    this.parkTileId = getTileTypeId(config, "park");
    this.waterTileId = getTileTypeId(config, "water");
    this.windTurbineSmallId = getTileTypeId(config, "windTurbineSmall");
    this.windTurbineBigId = getTileTypeId(config, "windTurbineBig");
    this.roadTextureKey = "roads";
    this.roadTexturePrefix = "road";
    this.basicTileRenderers = {};
    this.dataManager = dataManager;
    this.randomizedTerrain = Array2D.create(
      this.city.map.width,
      this.city.map.height
    );
    Array2D.fill(this.randomizedTerrain, () => Math.random());

    this.displayObject = new PIXI.Container();

    // map layer with background Tiles
    this.bgTiles = Array2D.create(
      this.city.map.width,
      this.city.map.height,
      null
    );
    // map layer with Texture Tiles
    this.textureTiles = Array2D.create(
      this.city.map.width,
      this.city.map.height,
      null
    );
    // TODO:
    // array for saving the coords of big windturbines
    this.bigWindturbines = [];
    // array for saving the coords of small windturbines
    this.smallWindturbines = [];
    // animated sprite
    this.animatedSprite = new PIXI.AnimatedSprite(
      this.animatedTextures.wt_small_texture.animations.wt
    );

    // creates backround tiles with PIXI Graphics for each cell in the map
    this.city.map.allCells().forEach(([x, y]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = x * MapView.TILE_SIZE;
      bgTile.y = y * MapView.TILE_SIZE;
      this.bgTiles[y][x] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = x * MapView.TILE_SIZE;
      textureTile.y = y * MapView.TILE_SIZE;
      textureTile.width = MapView.TILE_SIZE;
      textureTile.height = MapView.TILE_SIZE;
      textureTile.roundPixels = true;
      this.textureTiles[y][x] = textureTile;
      this.renderTile(x, y);
    });

    this.zoningLayer = new PIXI.Container();
    this.zoningLayer.addChild(...Array2D.flatten(this.bgTiles));
    this.displayObject.addChild(this.zoningLayer);
    this.tileTextureLayer = new PIXI.Container();
    this.tileTextureLayer.addChild(...Array2D.flatten(this.textureTiles));
    this.displayObject.addChild(this.tileTextureLayer);
    this.overlayContainer = new PIXI.Container();
    this.displayObject.addChild(this.overlayContainer);
    this.gridOverlay = this.createGridOverlay();
    this.displayObject.addChild(this.gridOverlay);
    if (this.config.mapView && this.config.mapView.gridOverlay) {
      this.renderGrid(this.config.mapView.gridOverlay);
    }

    this.city.map.events.on("update", this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  addOverlay(displayObject) {
    this.overlayContainer.addChild(displayObject);
    this.overlayContainer.sortChildren();
  }

  createGridOverlay() {
    const overlay = new PIXI.Graphics();
    overlay.x = 0;
    overlay.y = 0;
    overlay.width = this.city.map.width * MapView.TILE_SIZE;
    overlay.height = this.city.map.height * MapView.TILE_SIZE;

    return overlay;
  }

  setEditCursor() {
    Array2D.items(this.bgTiles).forEach(([, , bgTile]) => {
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
    });
  }

  setInspectCursor() {
    Array2D.items(this.bgTiles).forEach(([, , bgTile]) => {
      bgTile.cursor = "crosshair";
    });
  }

  getCoordsAtPosition(globalPoint) {
    if (this.origin === undefined) {
      this.origin = new PIXI.Point();
    }
    this.origin = this.displayObject.getGlobalPosition(this.origin, false);

    const x = Math.floor(
      (globalPoint.x - this.origin.x) /
        this.displayObject.scale.x /
        MapView.TILE_SIZE
    );
    const y = Math.floor(
      (globalPoint.y - this.origin.y) /
        this.displayObject.scale.y /
        MapView.TILE_SIZE
    );

    return x >= 0 &&
      x < this.city.map.width &&
      y >= 0 &&
      y < this.city.map.height
      ? { x, y }
      : null;
  }

  enableTileInteractivity() {
    const pointers = {};

    Array2D.items(this.bgTiles).forEach(([x, y, bgTile]) => {
      bgTile.interactive = true;
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      bgTile.on("pointerdown", (ev) => {
        // this.pointerActive = true;
        pointers[ev.data.pointerId] = { lastTile: { x, y } };
        this.events.emit("action", [x, y], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
    });

    this.zoningLayer.interactive = true;
    this.zoningLayer.on("pointermove", (ev) => {
      if (pointers[ev.data.pointerId] !== undefined) {
        const tileCoords = this.getCoordsAtPosition(ev.data.global);
        if (pointers[ev.data.pointerId].lastTile !== tileCoords) {
          if (tileCoords) {
            this.events.emit("action", [tileCoords.x, tileCoords.y], {
              shiftKey: ev.data.originalEvent.shiftKey,
            });
          }
          pointers[ev.data.pointerId].lastTile = tileCoords;
        }
      }
    });

    const onEndPointer = (ev) => {
      delete pointers[ev.data.pointerId];
    };

    this.zoningLayer.on("pointerup", onEndPointer);
    this.zoningLayer.on("pointerupoutside", onEndPointer);
    this.zoningLayer.on("pointercancel", onEndPointer);
  }

  /**
   *
   * @param {*} x the x coordinate. measured in tiles.
   * @param {*} y the y coordinate. measured in tiles.
   * @returns the background Tile
   */
  getBgTile(x, y) {
    return this.bgTiles[y][x];
  }
  /**
   *
   * @param {*} x the x coordinate. measured in tiles.
   * @param {*} y the y coordinate. measured in tiles.
   * @returns the Texture Tile
   */
  getTextureTile(x, y) {
    return this.textureTiles[y][x];
  }

  /**
   * renders the new Tile after an Update on the map
   * @param {*} x the x coordinate. measured in tiles.
   * @param {*} y the y coordinate. measured in tiles.
   */
  renderTile(x, y) {
    this.renderBasicTile(x, y);
    switch (this.city.map.get(x, y)) {
      case this.windTurbineSmallId:
        // if the type of the tily is small Windturbine and the WT has a location error
        if (1 == this.dataManager.sources[3].locationsGoalsError[y][x]) {
          this.deleteFromArray(x, y, this.smallWindturbines);
          // renders texture with attention symbol
          this.renderRedBorderWindTurbineSmallTile(x, y);
        } else {
          // else: renders animation for small WT and deletes the coordinates from the array, which saves the big WTs
          this.renderWindTurbineSmallTile(x, y);
          this.deleteFromArray(x, y, this.bigWindturbines);
          // if they array which saves the small WTs is empty or the the coords aren't in it
          // they will be added to the array
          {
            this.storeCoordinate(x, y, this.smallWindturbines);
          }
        }
        break;
      case this.windTurbineBigId:
        this.deleteFromArray(x, y, this.bigWindturbines);
        // if the type of the tily is big Windturbine and the WT has a location error
        if (1 == this.dataManager.sources[3].locationsGoalsError[y][x]) {
          this.deleteFromArray(x, y, this.bigWindturbines);
          // renders texture with attention symbol
          this.renderRedBorderWindTurbineBigTile(x, y);
        } else {
          // else: renders animation for big WT and deletes the coordinates from the array, which saves the small WTs
          this.renderWindTurbineBigTile(x, y);
          this.deleteFromArray(x, y, this.smallWindturbines);
          // if they array which saves the big WTs is empty or the the coords aren't in it
          // they will be added to the array
          {
            this.storeCoordinate(x, y, this.bigWindturbines);
          }
        }
        break;
      case this.parkTileId:
        this.deleteFromArray(x, y, this.smallWindturbines);
        this.renderParkTile(x, y);
        break;
      case this.waterTileId:
        this.deleteFromArray(x, y, this.smallWindturbines);
        this.renderWaterTile(x, y);
        break;
      case this.roadTileId:
        this.deleteFromArray(x, y, this.smallWindturbines);
        this.renderRoadTile(x, y);
        break;
    }
  }

  renderParkTile(x, y) {
    this.deleteFromArray(x, y, this.smallWindturbines);
    this.deleteFromArray(x, y, this.bigWindturbines);
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture =
      this.textures.parks[`park-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderWaterTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture =
      this.textures.water[`water-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }
  // TODO:
  /**
   * searches if given coords are already in the array
   * @param {*} xVal the x coordinate. measured in tiles.
   * @param {*} yVal the y coordinate. measured in tiles.
   * @param {*} array an array. containing coordinates for either small or big WTs
   * @returns true: xVal and yVal are in the array. false: xVal and yVal are already in the array
   */
  filterCoordinates(xVal, yVal, array) {
    let duplicates = array.filter(
      (coords) => coords.x == xVal && coords.y == yVal
    );
    if (duplicates.length == 0) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * stores new coordinates as an pbject with x- and y-Value
   * @param {*} xVal the x coordinate. measured in tiles.
   * @param {*} yVal the y coordinate. measured in tiles.
   * @param {*} array an array. containing coordinates for either small or big WTs
   */
  storeCoordinate(xVal, yVal, array) {
    if (
      array.length == 0 ||
      this.filterCoordinates(xVal, yVal, array) == true
    ) {
      array.push({ x: xVal, y: yVal });
    }
  }
  /**
   * deletes the coordinates of a WT from the array and stops the animation if there are
   * no WTs on the map (both array for small and big Wts are empty)
   * @param {*} xVal the x coordinate. measured in tiles.
   * @param {*} yVal the y coordinate. measured in tiles.
   * @param {*} array an array. containing coordinates for either small or big WTs
   */
  deleteFromArray(xVal, yVal, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].x === xVal && array[i].y === yVal) array.splice(i, 1); // 2nd parameter means remove one item only
    }
    if (
      this.smallWindturbines.length <= 0 &&
      this.bigWindturbines.length <= 0
    ) {
      this.animatedSprite.stop();
    }
  }

  /**
   * animates the spritesheet and changes frames of the WT Textures
   * @param {*} x the x coordinate. measured in tiles.
   * @param {*} y the y coordinate. measured in tiles.
   */
  renderWindTurbineSmallTile(x, y) {
    this.animate(this.animatedSprite, x, y);
  }
  /**
   * animates the spritesheet and changes frames of the WT Textures
   * @param {*} img spritesheet for the PIXI animated Sprite
   * @param {*} x the x coordinate. measured in tiles.
   * @param {*} y the y coordinate. measured in tiles.
   */
  animate(img, x, y) {
    // sets animation spees
    img.animationSpeed = 0.1;
    // starts the animated sprite
    img.play();
    // sets the animated spprite on loop
    img.onLoop = () => {};
    img.onFrameChange = () => {
      //every small WT texture on the map changes to the next frame when the animated sprite does
      for (var i = 0; i < this.smallWindturbines.length; i++) {
        var x = this.smallWindturbines[i].x;
        var y = this.smallWindturbines[i].y;
        this.getTextureTile(x, y).texture =
          this.animatedTextures.wt_small_texture.textures[
            `wt${img.currentFrame + 1}`
          ];
      }
      //every big WT texture on the map changes to the next frame when the animated sprite does
      for (var i = 0; i < this.bigWindturbines.length; i++) {
        var x = this.bigWindturbines[i].x;
        var y = this.bigWindturbines[i].y;
        this.getTextureTile(x, y).texture =
          this.textures.wt_big_texture[`wt${img.currentFrame + 1}`];
      }
    };
    this.getTextureTile(x, y).visible = true;
  }

  renderRedBorderWindTurbineSmallTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 3);
    this.getTextureTile(x, y).texture =
      this.textures.marked_small_wt[`marked_small_wt${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderWindTurbineBigTile(x, y) {
    this.animate(this.animatedSprite, x, y);
    // const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    // this.getTextureTile(x, y).texture =
    //   this.textures.windturbines_big[`turbine-big-0${textureNumber}`];
    // this.getTextureTile(x, y).visible = true;
  }

  renderRedBorderWindTurbineBigTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 3);
    this.getTextureTile(x, y).texture =
      this.textures.marked_big_wt[`marked_big_wt${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderRoadTile(i, j) {
    const connMask = [
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
      [i - 1, j],
    ]
      .map(([x, y]) =>
        !this.city.map.isValidCoords(x, y) ||
        this.city.map.get(x, y) === this.roadTileId
          ? "1"
          : "0"
      )
      .join("");
    this.getTextureTile(i, j).texture =
      this.textures[this.roadTextureKey][
        `${this.roadTexturePrefix}${connMask}`
      ];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    if (this.basicTileRenderers[tileType.type]) {
      this.basicTileRenderers[tileType.type](i, j);
    } else {
      this.getBgTile(i, j)
        .clear()
        .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
        .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
        .endFill();
    }
    this.getTextureTile(i, j).visible = false;
  }

  renderGrid(strokeWidth) {
    const viewWidth = this.city.map.width * MapView.TILE_SIZE;
    const viewHeight = this.city.map.height * MapView.TILE_SIZE;
    this.gridOverlay.clear();
    this.gridOverlay
      .lineStyle(strokeWidth / 2, 0, 1, 1)
      .moveTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth);

    this.gridOverlay.lineStyle(strokeWidth, 0, 1);
    for (let i = 1; i < this.city.map.width; i += 1) {
      this.gridOverlay
        .moveTo(i * MapView.TILE_SIZE, strokeWidth / 2)
        .lineTo(i * MapView.TILE_SIZE, viewHeight - strokeWidth / 2);
    }
    for (let i = 1; i < this.city.map.height; i += 1) {
      this.gridOverlay
        .moveTo(strokeWidth / 2, i * MapView.TILE_SIZE)
        .lineTo(viewWidth - strokeWidth / 2, i * MapView.TILE_SIZE);
    }
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map
        .adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === this.roadTileId)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
    this.updateRedBorders();
  }
  // updates the exclamation marks according to the locationsGoalError 2DArray
  // which is defined in the wind-turbines-data_WT.js
  // everytime a new tile is set
  updateRedBorders() {
    this.city.map.allCells().forEach(([x, y]) => {
      if (this.city.map.cells[y][x] == 5) {
        if (1 == this.dataManager.sources[3].locationsGoalsError[y][x]) {
          this.deleteFromArray(x, y, this.bigWindturbines);
          this.renderRedBorderWindTurbineBigTile(x, y);
        } else {
          this.renderWindTurbineBigTile(x, y);
          {
            this.storeCoordinate(x, y, this.bigWindturbines);
          }
        }
      }
      if (this.city.map.cells[y][x] == 4) {
        if (1 == this.dataManager.sources[3].locationsGoalsError[y][x]) {
          this.deleteFromArray(x, y, this.smallWindturbines);
          this.renderRedBorderWindTurbineSmallTile(x, y);
        } else {
          this.renderWindTurbineSmallTile(x, y);
          {
            this.storeCoordinate(x, y, this.smallWindturbines);
          }
        }
      }
    });
  }

  showGrid() {
    this.gridOverlay.visible = true;
  }

  hideGrid() {
    this.gridOverlay.visible = false;
  }
}

MapView.TILE_SIZE = 72;

module.exports = MapView;
