/**
 * Describes the energy gain of the wind turbine "Enercon E-70 E4 2.300"
 * Source: https://www.wind-turbine-models.com/turbines/69-enercon-e-70-e4-2.300
 * Starting speed: 2.5 m/s
 * Nennleistung: 2300 kW at 15 m/s
 * @param {*} x Windspeed in m/s
 * @returns
 */

function small_turbine_function(x) {
  if (x < 2.5) {
    return 0;
  } else if (x >= 15) {
    return 2300;
  } else {
    let function_koeff = [
      -2.2570403e-5, 1.72850455e-3, -5.69300328e-2, 1.05680842, -1.21766486e1,
      9.03787641e1, -4.340438e2, 1.32003111e3, -2.39686287e3, 2.30853417e3,
      -8.76933333e2,
    ];

    let y = 0;

    //Calculate the y value of the function
    for (let i = 0; i < function_koeff.length; i++) {
      y += function_koeff[i] * Math.pow(x, function_koeff.length - i - 1);
    }

    if (y > 2300) {
      y = 2300;
    }

    return y;
  }
}
/**
 * Describes the energy gain of the wind turbine "Enercon E-141 EP4"
 * Source: https://www.wind-turbine-models.com/turbines/1297-enercon-e-141-ep4
 * Starting speed: 3 m/s
 * Nennleistung: 4200 kW at 14 m/s
 * @param {*} x Windspeed in m/s
 * @returns
 */
function big_turbine_function(x) {
  if (x < 3) {
    return 0;
  } else if (x >= 14) {
    return 4200;
  } else {
    let function_koeff = [
      -2.03924163e-5, 1.88820128e-3, -7.7057351e-2, 1.81572488, -2.72127936e1,
      2.69858211e2, -1.7890036e3, 7.82779325e3, -2.15978494e4, 3.39834211e4,
      -2.31445422e4,
    ];

    let y = 0;

    //Calculate the y value of the function
    for (let i = 0; i < function_koeff.length; i++) {
      y += function_koeff[i] * Math.pow(x, function_koeff.length - i - 1);
    }

    if (y > 4200) {
      y = 4200;
    }
    return y;
  }
}

/**
 * Describes the loss of velocity in a wake from Jensen "A simple model for the cluster efficiency".
 * Here the diameter of the small wind turbine "Enercon E-141 EP4" is used (71m).
 * The function is scaled with the factor 0.001064.
 * Source: https://api.semanticscholar.org/CorpusID:107856223
 * @param {*} x distance from wind turbine
 * @returns the loss of velocity
 */
function small_wake_effect(x) {
  return (1 + (0.15 * x) / 0.0026 / 71) ** -2;
}

/**
 * Describes the loss of velocity in a wake from Jensen "A simple model for the cluster efficiency".
 * Here the diameter of the small wind turbine "Enercon E-70 E4 2.300" is used (71m).
 * The function is scaled with the factor 0.001064.
 * Source: https://api.semanticscholar.org/CorpusID:107856223
 * @param {*} x distance from wind turbine
 * @returns the loss of velocity
 */
function big_wake_effect(x) {
  return (1 + (0.15 * x) / 0.0026 / 141) ** -2;
}

module.exports = {
  small_turbine_function,
  big_turbine_function,
  small_wake_effect,
  big_wake_effect,
};
