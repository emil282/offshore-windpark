const {
  small_turbine_function,
  big_turbine_function,
} = require("./lib/energy-calculation");
const { getTileTypeId } = require("./lib/config-helpers");

class TileCounterViewDashboard {
  constructor(config) {
    this.counters = {};
    this.config = config;
    this.energyLosses = [];

    this.$element = $("<div></div>").addClass("tile-counter");

    this.computedFieldDefs = [
      {
        id: "energy-gain",
        label: "Energy gain",
        labelDE: "Energiegewinn",
        calculate: (wind) => {
          const windTurbineSmallId = getTileTypeId(
            this.config,
            "windTurbineSmall"
          );
          const windTurbineBigId = getTileTypeId(this.config, "windTurbineBig");
          //const turbinesSmall = this.counters[windTurbineSmallId].count;
          //const turbinesBig = this.counters[windTurbineBigId].count;

          let speed_km_h = wind.windspeed ?? 0;
          let speed_m_s = speed_km_h / 3.6;
          // Calculate the energy gain based on the wind speed and the number of turbines
          let energy_small = small_turbine_function(speed_m_s);
          let energy_big = big_turbine_function(speed_m_s);

          let energy = 0;

          this.energyLosses.forEach((item) => {
            if (item[1] == windTurbineSmallId) {
              energy += energy_small * item[0];
            } else if (item[1] == windTurbineBigId) {
              energy += energy_big * item[0];
            }
          });

          return Math.round(energy) + " kW";
        },
      },
      {
        id: "winddirection",
        label: this.config.wind.winddirection.name_en,
        labelDE: this.config.wind.winddirection.name_de,
        calculate: (wind) => {
          return wind.winddirection;
        },
      },
      {
        id: "windspeed",
        label: this.config.wind.windspeed.name_en,
        labelDE: this.config.wind.windspeed.name_de,
        calculate: (wind) => {
          return wind.windspeed.toFixed(2) + " km/h";
        },
      },
    ];

    this.fields = Object.assign(
      Object.fromEntries(
        Object.keys(config.tileTypes).map((id) => [
          id,
          $("<span></span>").addClass("field"),
        ])
      ),

      Object.fromEntries(
        this.computedFieldDefs.map((field) => [
          field.id,
          $("<span></span>").addClass("field"),
        ])
      )
    );

    //Here gets the Counters View created
    this.$element.append(
      $("<div></div>")
        .addClass("tile-counter-counts")
        /*.append(
          Object.keys(config.tileTypes)
            .filter((id) => id < 6)
            .map((id) =>
              $("<li></li>")
                .append(
                  $("<span></span>")
                    .addClass("label")
                    .html(
                      `${config.tileTypes[id].nameDE} 
                      (${
                        config.tileTypes[id].name ||
                        config.tileTypes[id].type ||
                        id
                      }): `
                    )
                )
                .append(this.fields[id])
            )
        )*/
        .append(
          this.computedFieldDefs.map((field) =>
            $("<div></div>")
              .addClass(
                "d-flex justify-content-between align-items-center pr-4"
              )
              .append(
                $("<div></div>")
                  .append(
                    $("<span></span>").addClass("name").html(`${field.labelDE}`)
                  )
                  .append("<br>")
                  .append(
                    $("<span></span>")
                      .addClass("name-tr")
                      .html(`${field.label}`)
                  )
              )
              .append(
                $("<div style='font-size: 30px'></div>").append(
                  this.fields[field.id]
                )
              )
          )
        )
    );
  }

  /**
   * Updates the counters in the dashboard.
   * @param {*} counters
   */
  updateCounters(counters, wind) {
    this.counters = counters;

    Object.keys(this.counters).forEach((id) => {
      this.fields[id].text(
        `${this.counters[id].count} (${this.counters[id].percentage}%)`
      );
    });

    this.computedFieldDefs.forEach(({ id, calculate }) => {
      this.fields[id].text(`${calculate(wind)}`);
    });
  }

  /**
   * Updates the energy losses
   * @param {*} energyLosses
   */
  setEnergyLosses(energyLosses) {
    this.energyLosses = energyLosses;
  }
}

module.exports = TileCounterViewDashboard;
