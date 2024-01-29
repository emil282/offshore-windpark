class TileCounterView {
  constructor(stats, config, mapEditor) {
    this.stats = stats;
    this.config = config;
    this.mapView = mapEditor.mapView;

    this.stats.events.on("update", this.handleUpdate.bind(this));

    this.$element = $("<div></div>").addClass("tile-counter");

    this.computedFieldDefs = [
      {
        id: "energy-gain",
        label: "Energy gain",
        calculate: () => {
          const turbinesSmall = this.stats.get("zones-windTurbineSmall-count");
          const turbinesBig = this.stats.get("zones-windTurbineBig-count");

          //Calculate the energy gain based on the wind speed and the number of turbines
          /*
          let speed =
            (($(`#${this.config.wind.windspeed.id}_knob`).val() ?? 0) % 1) * 2;
          return (
            (turbinesSmall + turbinesBig * 2) *
            (speed / 1) *
            (speed / 1) ** 3
          ).toFixed(2);
          */
          let speed_km_h =
            (((($(`#${this.config.wind.windspeed.id}_knob`).val() ?? 0) % 1) +
              1) %
              1) *
            this.config.wind.windspeed.max_speed;
          let speed_m_s = speed_km_h / 3.6;
          // Calculate the energy gain based on the wind speed and the number of turbines
          let energy_small;
          let energy_big;
          if (speed_m_s < 2.5) {
            energy_small = 0;
            energy_big = 0;
          } else if (speed_m_s < 3) {
            //Starting speed for small turbines
            energy_small = this.small_turbine_function(speed_m_s);
            energy_big = 0;
          } else if (speed_m_s < 13) {
            //Starting speed for big turbines
            energy_small = this.small_turbine_function(speed_m_s);
            energy_big = this.big_turbine_function(speed_m_s);
          } else if (speed_m_s < 14) {
            //"Nennleistung" for big turbines
            energy_small = this.small_turbine_function(speed_m_s);
            energy_big = 4200;
          } else {
            //"Nennleistung" for small turbines
            energy_small = 2300;
            energy_big = 4200;
          }
          return Math.round(
            energy_small * turbinesSmall + energy_big * turbinesBig
          );
        },
      },
      /*{
        id: "road-density",
        label: "Road:Zone ratio",
        calculate: () => {
          const zones = this.stats.get("zones-residential-count"); // +
          //+ this.stats.get('zones-commercial-count')
          //this.stats.get("zones-industrial-count");

          return (this.stats.get("zones-road-count") / zones).toFixed(2);
        },
      },
      {
        id: "road-intersection-type",
        label: "Intersections (3x/4x)",
        calculate: () => {
          const tri = this.stats.get("road-triple-intersections-count");
          const quad = this.stats.get("road-quad-intersections-count");
          const total = this.stats.get("zones-road-count");
          return `${tri}(${((tri / total) * 100).toFixed(1)}%) / ${quad}(${(
            (quad / total) *
            100
          ).toFixed(1)}%)`;
        },
      },*/
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

    this.total = this.stats.get("zones-total");

    this.handleUpdate();
  }

  handleUpdate() {
    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      const count = this.stats.get(`zones-${type}-count`);
      this.fields[id].text(
        `${count} (${((count / this.total) * 100).toFixed(1)}%)`
      );
    });

    this.computedFieldDefs.forEach(({ id, calculate }) => {
      this.fields[id].text(`${calculate()} kWh`);
    });

    this.stats.sources[3].calculateWind();

    // update the speed of the animation
    this.mapView.updateSpeed();
  }

  /**
   * Updates the counters in the dashboard.
   * @param {*} counters
   */
  updateCounters(counters) {
    Object.keys(counters).forEach((id) => {
      this.fields[id].text(
        `${counters[id].count} (${(
          (counters[id].count / this.total) *
          100
        ).toFixed(1)}%)`
      );
    });

    this.computedFieldDefs.forEach(({ id, calculate }) => {
      this.fields[id].text(`${calculate()} kWh`);
    });
  }

  /*extraFieldDefs() {
    return [
      {
        id: "road-density",
        label: "Road density",
        calculate: () => {
          const zones = this.stats.get("zones-residential-count"); //+
          //+ this.stats.get('zones-commercial-count')
          //this.stats.get("zones-industrial-count");

          return this.stats.get("zones-road-count") / zones;
        },
      },
    ];
  }*/

  /**
   * Describes the energy gain of the wind turbine "Enercon E-70 E4 2.300"
   * Source: https://www.wind-turbine-models.com/turbines/69-enercon-e-70-e4-2.300
   * @param {*} x
   * @returns
   */

  small_turbine_function(x) {
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

    return y;
  }
  /**
   * Describes the energy gain of the wind turbine "Enercon E-141 EP4"
   * Source: https://www.wind-turbine-models.com/turbines/1297-enercon-e-141-ep4
   * @param {*} x
   * @returns
   */
  big_turbine_function(x) {
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

    return y;
  }
}

module.exports = TileCounterView;
