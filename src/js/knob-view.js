class KnobView {
  constructor(config) {
    this.config = config;
    /*this.$element = $("<div></div>")
      .addClass("index-list")
      .append($("<div></div>").addClass("flex"));*/

    this.knobs = [
      this.makeKnob(this.config.winddirection),
      this.makeKnob(this.config.windspeed),
    ];
    this.$element = $("<div></div>")
      .addClass("index-list")
      .append(
        $("<div></div>")
          .addClass("flex")
          .append(this.knobs[0])
          .append(this.knobs[1])
      )
      .append(
        'Windrichtung: <span id="' +
          this.config.winddirection.name +
          '_span">N</span><br />' +
          'Windgeschwindigkeit: <span id="' +
          this.config.windspeed.name +
          '_span">0</span>'
      );

    $(document).ready(() => {
      $(`#${this.config.winddirection.name}`).on("input", (event) => {
        let value = (event.target.value % 1) * event.target.divisions;
        $(`#${event.currentTarget.id}_span`).html(
          this.config.winddirection.labels[value]
        );
      });
      $(`#${this.config.windspeed.name}`).on("input", (event) => {
        let value = Math.round((event.target.value % 1) * 12);
        $(`#${event.currentTarget.id}_span`).html(value);
      });
    });
  }

  makeKnob(config) {
    let element = $("<div id='" + config.name + "'></div>").addClass("windDiv");
    let knob =
      "<x-knob id='" +
      config.name +
      "_knob'" +
      (config.divisions != null ? " divisions='8' " : "") +
      " class = 'windKnob'></x-knob>";

    element.append(knob);

    let label;

    if (config.labels != null) {
      label = this.makeLabeling(config);
    }
    return $("<div></div>").addClass("flex").append(element).append(label);
  }

  makeLabeling(config) {
    let element = $("<ul></ul>").addClass("circle-container");
    config.labels.forEach((item) => {
      element.append($("<li><span>" + item + "</span></li>"));
    });
    return element;
  }
}

module.exports = KnobView;
