class KnobView {
  constructor(config, tileCounterView) {
    this.config = config;
    this.tileCounterView = tileCounterView;
    /*this.$element = $("<div></div>")
      .addClass("index-list")
      .append($("<div></div>").addClass("flex"));*/

    // Creates two knobs
    this.knobs = [
      this.makeKnob(this.config.winddirection),
      this.makeKnob(this.config.windspeed),
    ];
    this.$element = $("<div></div>")
      .addClass("index-list")
      .append("<h3>Wind</h3>")
      .append(this.knobs[0])
      .append(this.knobs[1]);

    // Event Listeners for when the knobs change
    $(document).ready(() => {
      $(`#${this.config.winddirection.id}`).on("input", (event) => {
        // Sets the current winddirection
        let value = (event.target.value % 1) * event.target.divisions;
        $(`#${event.currentTarget.id}_span`).html(
          this.config.winddirection.labels[value]
        );
        // Calculate the energy gain
        this.tileCounterView.handleUpdate();
      });
      $(`#${this.config.windspeed.id}`).on("input", (event) => {
        // Sets the current windspeed
        let value = Math.round((event.target.value % 1) * 100);
        $(`#${event.currentTarget.id}_span`).html(value + " km/h");
        // Calculate the energy gain
        this.tileCounterView.handleUpdate();
      });
    });
  }

  /**
   * Creates the html tags for a x-knob.
   * @param {*} config
   * @returns
   */
  makeKnob(config) {
    let knob = `<x-knob id='${config.id}_knob'${
      config.divisions != null ? " divisions='8' " : ""
    } class = 'windKnob'></x-knob>`;

    let label;

    if (config.labels != null) {
      label = this.makeLabeling(config);
    }

    let element = $("<div id='" + config.id + "'></div>")
      .addClass("windDiv")
      .append($("<div></div>").addClass("flex").append(knob).append(label))
      .append(
        $("<div></div>")
          .append(
            $("<span></span>")
              .addClass("beschr")
              .html(config.name_de)
              .append("<br>")
          )
          .append(
            $("<span></span>")
              .addClass("beschr-en")
              .html(config.name_en)
              .append("<br>")
          )
          .append(
            $("<span></span>")
              .attr("id", `${config.id}_span`)
              .html(config.default)
          )
      );

    return element;
  }

  /**
   * Creates a circular labeling around the knob
   * @param {*} config
   * @returns
   */
  makeLabeling(config) {
    let element = $("<ul></ul>").addClass("circle-container");
    // Get labeling from config
    config.labels.forEach((item) => {
      element.append($("<li><span>" + item + "</span></li>"));
    });
    return element;
  }
}

module.exports = KnobView;
