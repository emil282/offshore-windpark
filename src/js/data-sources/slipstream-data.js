const DataSource = require("../data-source");
const { allDistancesToTileType } = require("../lib/distance");
const { getTileTypeId } = require("../lib/config-helpers");
const Array2D = require("../lib/array-2d");

class SlipstreamData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.cells = city.map.cells;
    this.energyLoss = Array2D.create(city.map.width, this.city.map.height, 1);
    this.config = config;
    this.lifeSpan = 0;
    this.lifeSpanIndex = 5;
    this.arrayOfLoss = [];

    // These counters save the number of windturbines standing in the slipstream
    // Group A: no wt standing in slipstream |  |  |  |  |x|
    // maximal energy gain x 1.0
    this.groupA = 0;
    // Group B: 0 tile distance inbetween |  |  |  |x|x|
    // Energy Gain: x 0.5
    this.groupB = 0;
    // Group C: 1 tile distance inbetween |  |  |x|  |x|
    // Energy Gain: x 0.3
    this.groupC = 0;
    // Group D: 2 tile distance inbetween |  |x|  |  |x|
    // Energy Gain: x 0.2
    this.groupD = 0;
    // Group E: 3 tile distance inbetween |x|  |  |  |x|
    // Energy Gain: x 0.1
    this.groupE = 0;

    this.windTurbineSmallId = getTileTypeId(this.config, "windTurbineSmall");
    this.windTurbineBigId = getTileTypeId(this.config, "windTurbineBig");
  }
  getVariables() {
    return {
      "life-span-index": () => this.lifeSpanIndex,
      "energy-losses": () => this.arrayOfLoss,
    };
  }
  /**
   * calculates the energy loss caused by placement and slipstreams for every wind trubine
   * @param {*} windDirection | The by the User selected wind direction as a String
   */
  calculate(windDirection) {
    this.energyLoss = Array2D.create(
      this.city.map.width,
      this.city.map.height,
      1
    );
    this.groupA = 0;
    this.groupB = 0;
    this.groupC = 0;
    this.groupD = 0;
    switch (windDirection) {
      // NORTH
      case "N":
        this.calculateSlipstreamN();
        break;
      // EAST
      case "O":
        this.calculateSlipstreamE();
        break;
      // SOUTH
      case "S":
        this.calculateSlipstreamS();
        break;
      //WEST
      case "W":
        this.calculateSlipstreamW();
        break;
    }
    this.calculateLifeSpan();
    this.saveEngeryLosses();
  }
  /**
   * saves all energy losses and the according wt type in an array for calculating the final energy gain
   */
  saveEngeryLosses() {
    this.arrayOfLoss = [];
    for (let col = 0; col < 16; col++) {
      for (let row = 0; row < 16; row++) {
        if (this.cells[row][col] == this.windTurbineSmallId) {
          let energyLossSmall = [];
          energyLossSmall.push(
            this.energyLoss[row][col],
            this.windTurbineSmallId
          );
          this.arrayOfLoss.push(energyLossSmall);
        }
        if (this.cells[row][col] == this.windTurbineBigId) {
          let energyLossBig = [];
          energyLossBig.push(this.energyLoss[row][col], this.windTurbineBigId);
          this.arrayOfLoss.push(energyLossBig);
        }
      }
    }
  }
  /**
   * calculates the average life span of a windturbine
   *    the life span is reduced by turbulences caused by placement and slipstreams
   */
  calculateLifeSpan() {
    if (this.groupA + this.groupB + this.groupC + this.groupD > 0) {
      this.lifeSpan =
        (0.5 * this.groupA +
          0.3 * this.groupB +
          0.2 * this.groupC +
          0.1 * this.groupD) /
        (this.groupA + this.groupB + this.groupC + this.groupD);

      if (this.lifeSpan <= 0.2) {
        this.lifeSpanIndex = 4;
      } else if (this.lifeSpan <= 0.3) {
        this.lifeSpanIndex = 3;
      } else if (this.lifeSpan <= 0.4) {
        this.lifeSpanIndex = 2;
      } else if (this.lifeSpan <= 0.5) {
        this.lifeSpanIndex = 1;
      }
    } else {
      this.lifeSpan = 0;
      this.lifeSpanIndex = 5;
    }
  }

  /**
   * calculates the energy loss caused by slipstreams from other windturbines when the main wind direction is
   * NORTH
   * for-loops: >  v
   * goes from left to right (west-east) through the city columns
   * and looks at each cell from top to bottom (north-south)
   */
  calculateSlipstreamN() {
    for (let col = 0; col < 16; col++) {
      for (let j = 1; j < 16; j++) {
        let type = this.cells[j][col];
        if (
          j < 4 &&
          (type == this.windTurbineSmallId || type == this.windTurbineBigId)
        ) {
          this.checkFirstFourN(j, col, j, type, j - 1, j - 2, j - 3);
        } else {
          if (
            type == this.windTurbineSmallId ||
            type == this.windTurbineBigId
          ) {
            switch (type) {
              case this.cells[j - 1][col]:
                this.groupA++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.5,
                  this.energyLoss[j - 1][col]
                );
                break;
              case this.cells[j - 2][col]:
                this.groupB++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.3,
                  this.energyLoss[j - 2][col]
                );
                break;
              case this.cells[j - 3][col]:
                this.groupC++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.2,
                  this.energyLoss[j - 3][col]
                );
                break;
              case this.cells[j - 4][col]:
                this.groupD++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.1,
                  this.energyLoss[j - 4][col]
                );
                break;
            }
          }
        }
      }
    }
  }
  /**
   * calculates the energy loss matrix (this.energyloss) caused by slipstreams from other windturbines when the main wind direction is
   * EAST
   * for-loops: v <
   * goes from top to bottom (north-soth) through the city rows
   * and looks at each cell from left to right (east-west)
   */
  calculateSlipstreamE() {
    for (let row = 0; row < 16; row++) {
      for (let j = 14; j >= 0; j--) {
        let type = this.cells[row][j];
        if (
          j > 11 &&
          (type == this.windTurbineSmallId || type == this.windTurbineBigId)
        ) {
          this.checkFirstFourE(j, j, row, type, j + 1, j + 2, j + 3);
        } else {
          if (
            type == this.windTurbineSmallId ||
            type == this.windTurbineBigId
          ) {
            switch (type) {
              case this.cells[row][j + 1]:
                this.groupA++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.5,
                  this.energyLoss[row][j + 1]
                );
                break;
              case this.cells[row][j + 2]:
                this.groupB++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.3,
                  this.energyLoss[row][j + 2]
                );
                break;
              case this.cells[row][j + 3]:
                this.groupC++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.2,
                  this.energyLoss[row][j + 3]
                );
                break;
              case this.cells[row][j + 4]:
                this.groupD++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.1,
                  this.energyLoss[row][j + 4]
                );
                break;
            }
          }
        }
      }
    }
  }

  /**
   * calculates the energy loss matrix (this.energyloss) caused by slipstreams from other windturbines when the main wind direction is
   * SOUTH
   * for-loops: > ^
   * goes from left to right (west-east) through the city columns
   * and looks at each cell from bottom to top (south-north)
   */
  calculateSlipstreamS() {
    for (let col = 0; col < 16; col++) {
      for (let j = 14; j >= 0; j--) {
        let type = this.cells[j][col];
        if (
          j > 11 &&
          (type == this.windTurbineSmallId || type == this.windTurbineBigId)
        ) {
          this.checkFirstFourS(j, col, j, type, j + 1, j + 2, j + 3);
        } else {
          if (
            type == this.windTurbineSmallId ||
            type == this.windTurbineBigId
          ) {
            switch (type) {
              case this.cells[j + 1][col]:
                this.groupA++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.5,
                  this.energyLoss[j + 1][col]
                );
                break;
              case this.cells[j + 2][col]:
                this.groupB++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.3,
                  this.energyLoss[j + 2][col]
                );
                break;
              case this.cells[j + 3][col]:
                this.groupC++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.2,
                  this.energyLoss[j + 3][col]
                );
                break;
              case this.cells[j + 4][col]:
                this.groupD++;
                this.calculateEnergyLoss(
                  col,
                  j,
                  0.1,
                  this.energyLoss[j + 4][col]
                );
                break;
            }
          }
        }
      }
    }
  }

  /**
   * calculates the energy loss matrix (this.energyloss) caused by slipstreams from other windturbines when the main wind direction is
   * EAST
   * for-loops: v <
   * goes from top to bottom (north-soth) through the city rows
   * and looks at each cell from right to left (west-east)
   */
  calculateSlipstreamW() {
    for (let row = 0; row < 16; row++) {
      for (let j = 1; j < 16; j++) {
        let type = this.cells[row][j];
        if (
          j < 4 &&
          (type == this.windTurbineSmallId || type == this.windTurbineBigId)
        ) {
          this.checkFirstFourW(j, j, row, type, j - 1, j - 2, j - 3);
        } else {
          if (
            type == this.windTurbineSmallId ||
            type == this.windTurbineBigId
          ) {
            switch (type) {
              case this.cells[row][j - 1]:
                this.groupA++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.5,
                  this.energyLoss[row][j - 1]
                );
                break;
              case this.cells[row][j - 2]:
                this.groupB++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.3,
                  this.energyLoss[row][j - 2]
                );
                break;
              case this.cells[row][j - 3]:
                this.groupC++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.2,
                  this.energyLoss[row][j - 3]
                );
                break;
              case this.cells[row][j - 4]:
                this.groupD++;
                this.calculateEnergyLoss(
                  j,
                  row,
                  0.1,
                  this.energyLoss[row][j - 4]
                );
                break;
            }
          }
        }
      }
    }
  }
  /**
   * calculates the energy loss of the first four cells in wind direction
   * NORTH
   * this might be a bit complicated - maybe there is a solution with a simple if statemnt which checks if j is out of bounds
   * @param {*} j | either the col (east-, west wind) or row (north-, south wind)
   * @param {*} col | the column the looked at cell is in
   * @param {*} row | the row the looked at cell is in
   * @param {*} type | the type of the looked at cell
   * @param {*} firstNeighbour | the col or row number of the first neighbour
   * @param {*} secondNeighbour | the col or row number of the second neighbour
   * @param {*} thirdNeighbour | the col or row number of the third neighbour
   */
  checkFirstFourN(
    j,
    col,
    row,
    type,
    firstNeighbour,
    secondNeighbour,
    thirdNeighbour
  ) {
    switch (j) {
      case 1:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
        }
        break;
      case 2:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
          case this.cells[secondNeighbour][col]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[secondNeighbour][col]
            );
            break;
        }
        break;
      case 3:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
          case this.cells[secondNeighbour][col]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[secondNeighbour][col]
            );
            break;
          case this.cells[thirdNeighbour][col]:
            this.groupC++;
            this.calculateEnergyLoss(
              col,
              row,
              0.2,
              this.energyLoss[thirdNeighbour][col]
            );
            break;
        }
        break;
    }
  }

  /**
   * calculates the energy loss of the first four cells in wind direction
   * EAST
   * this might be a bit complicated - maybe there is a solution with a simple if statemnt which checks if j is out of bounds
   * @param {*} j | either the col (east-, west wind) or row (north-, south wind)
   * @param {*} col | the column the looked at cell is in
   * @param {*} row | the row the looked at cell is in
   * @param {*} type | the type of the looked at cell
   * @param {*} firstNeighbour | the col or row number of the first neighbour
   * @param {*} secondNeighbour | the col or row number of the second neighbour
   * @param {*} thirdNeighbour | the col or row number of the third neighbour
   */
  checkFirstFourE(
    j,
    col,
    row,
    type,
    firstNeighbour,
    secondNeighbour,
    thirdNeighbour
  ) {
    switch (j) {
      case 14:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
        }
        break;
      case 13:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
          case this.cells[row][secondNeighbour]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[row][secondNeighbour]
            );
            break;
        }
        break;
      case 12:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
          case this.cells[row][secondNeighbour]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[row][secondNeighbour]
            );
            break;
          case this.cells[row][thirdNeighbour]:
            this.groupC++;
            this.calculateEnergyLoss(
              col,
              row,
              0.2,
              this.energyLoss[row][thirdNeighbour]
            );
            break;
        }
        break;
    }
  }

  /**
   * calculates the energy loss of the first four cells in wind direction
   * SOUTH
   * this might be a bit complicated - maybe there is a solution with a simple if statemnt which checks if j is out of bounds
   * @param {*} j | either the col (east-, west wind) or row (north-, south wind)
   * @param {*} col | the column the looked at cell is in
   * @param {*} row | the row the looked at cell is in
   * @param {*} type | the type of the looked at cell
   * @param {*} firstNeighbour | the col or row number of the first neighbour
   * @param {*} secondNeighbour | the col or row number of the second neighbour
   * @param {*} thirdNeighbour | the col or row number of the third neighbour
   */
  checkFirstFourS(
    j,
    col,
    row,
    type,
    firstNeighbour,
    secondNeighbour,
    thirdNeighbour
  ) {
    switch (j) {
      case 14:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
        }
        break;
      case 13:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
          case this.cells[secondNeighbour][col]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[secondNeighbour][col]
            );
            break;
        }
        break;
      case 12:
        switch (type) {
          case this.cells[firstNeighbour][col]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[firstNeighbour][col]
            );
            break;
          case this.cells[secondNeighbour][col]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[secondNeighbour][col]
            );
            break;
          case this.cells[thirdNeighbour][col]:
            this.groupC++;
            this.calculateEnergyLoss(
              col,
              row,
              0.2,
              this.energyLoss[thirdNeighbour][col]
            );
            break;
        }
        break;
    }
  }
  /**
   * calculates the energy loss of the first four cells in wind direction
   * WEST
   * this might be a bit complicated - maybe there is a solution with a simple if statemnt which checks if j is out of bounds
   * @param {*} j | either the col (east-, west wind) or row (north-, south wind)
   * @param {*} col | the column the looked at cell is in
   * @param {*} row | the row the looked at cell is in
   * @param {*} type | the type of the looked at cell
   * @param {*} firstNeighbour | the col or row number of the first neighbour
   * @param {*} secondNeighbour | the col or row number of the second neighbour
   * @param {*} thirdNeighbour | the col or row number of the third neighbour
   */

  checkFirstFourW(
    j,
    col,
    row,
    type,
    firstNeighbour,
    secondNeighbour,
    thirdNeighbour
  ) {
    switch (j) {
      case 1:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
        }
        break;
      case 2:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
          case this.cells[row][secondNeighbour]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[row][secondNeighbour]
            );
            break;
        }
        break;
      case 3:
        switch (type) {
          case this.cells[row][firstNeighbour]:
            this.groupA++;
            this.calculateEnergyLoss(
              col,
              row,
              0.5,
              this.energyLoss[row][firstNeighbour]
            );
            break;
          case this.cells[row][secondNeighbour]:
            this.groupB++;
            this.calculateEnergyLoss(
              col,
              row,
              0.3,
              this.energyLoss[row][secondNeighbour]
            );
            break;
          case this.cells[row][thirdNeighbour]:
            this.groupC++;
            this.calculateEnergyLoss(
              col,
              row,
              0.2,
              this.energyLoss[row][thirdNeighbour]
            );
            break;
        }
        break;
    }
  }

  /**
   *
   * @param {*} col | the column the looked at cell is in
   * @param {*} row | the row the looked at cell is in
   * @param {*} factor | the factor by which the energy gain is reduced
   * @param {*} neighbour | the first second third or fourth nieghbour which is looked at
   */
  calculateEnergyLoss(col, row, factor, neighbour) {
    //if (this.energyLoss[row][col] == 1) {
    this.energyLoss[row][col] = factor * neighbour;
    //} else {
    //    this.energyLoss[row][col] *= neighbour;
    //}
  }
}

module.exports = SlipstreamData;
