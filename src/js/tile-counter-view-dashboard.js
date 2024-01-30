const {
  small_turbine_function,
  big_turbine_function,
} = require("./lib/energy-calculation");

class TileCounterViewDashboard {
  constructor(config) {
    this.counters = {};
    this.config = config;

    this.$element = $("<div></div>").addClass("tile-counter");

    this.computedFieldDefs = [
      {
        id: "energy-gain",
        label: "Energy gain",
        calculate: (wind) => {
          const turbinesSmall = this.counters[4].count;
          const turbinesBig = this.counters[5].count;

          let speed_km_h = wind.windspeed ?? 0;
          let speed_m_s = speed_km_h / 3.6;
          // Calculate the energy gain based on the wind speed and the number of turbines
          let energy_small = small_turbine_function(speed_m_s);
          let energy_big = big_turbine_function(speed_m_s);

          return (
            Math.round(
              energy_small * turbinesSmall + energy_big * turbinesBig
            ) + " kWh"
          );
        },
      },
      {
        id: "winddirection",
        label: "Winddirection",
        calculate: (wind) => {
          return wind.winddirection;
        },
      },
      {
        id: "windspeed",
        label: "Windspeed",
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
      $("<ul></ul>")
        .addClass("tile-counter-counts")
        .append(
          Object.keys(config.tileTypes)
            .filter((id) => id < 6)
            .map((id) =>
              $("<li></li>")
                .append(
                  $("<span></span>")
                    .addClass("label")
                    .html(
                      `${
                        config.tileTypes[id].name ||
                        config.tileTypes[id].type ||
                        id
                      }: `
                    )
                )
                .append(this.fields[id])
            )
        )
        .append(
          this.computedFieldDefs.map((field) =>
            $("<li></li>")
              .append(
                $("<span></span>").addClass("label").html(`${field.label}: `)
              )
              .append(this.fields[field.id])
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
}

module.exports = TileCounterViewDashboard;
