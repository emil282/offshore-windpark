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

          return (
            ((turbinesSmall + turbinesBig * 2) * wind.windspeed) /
            100
          ).toFixed(2);
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
      this.fields[id].text(`${calculate(wind)} kWh`);
    });
  }
}

module.exports = TileCounterViewDashboard;
