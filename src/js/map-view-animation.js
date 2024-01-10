class CoordsArray {
  constructor(animatedSprite) {
    this.animatedSprite = animatedSprite;
    this.smallWindturbines = [];
    this.bigWindturbines = [];
  }
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
}

module.exports = CoordsArray;
