class KnobView {
  constructor(config, tileCounterView, stats, mapView) {
    this.config = config;
    this.tileCounterView = tileCounterView; //is only defined, when called from the main.js
    this.stats = stats; //is only defined, when called from the main-editor.js
    this.mapView = mapView; //is only defined, when called from the main-editor.js
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
        this.updateCalculation();
      });
      $(`#${this.config.windspeed.id}`).on("input", (event) => {
        // Sets the current windspeed
        let value = Math.round((event.target.value % 1) * 90);
        $(`#${event.currentTarget.id}_span`)
          .html(value + " km/h")
          .append("<br>");
        this.updateCalculation();

        // hide starting speed info if the speeed is above 10 km/h
        if (value >= 10) {
          $(`#${event.currentTarget.id}_startingSpeed`).hide();
        } else {
          $(`#${event.currentTarget.id}_startingSpeed`).show();
        }
      });
    });
  }

  /**
   * Creates the html tags for a x-knob.
   * @param {*} config
   * @returns
   */
  makeKnob(config) {
    //Create the x-knob element
    let knob = `<x-knob id='${config.id}_knob'${
      config.divisions != null ? ` divisions='${config.divisions}' ` : ""
    } class = 'windKnob'></x-knob>`;

    //Create the circular labeling
    let label;
    if (config.labels != null) {
      label = this.makeLabeling(config);
    }

    //Append everything to the element
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
              .append("<br>")
          )
          .append(
            config.starting_speed
              ? $("<span></span>")
                  .attr("id", `${config.id}_startingSpeed`)
                  .addClass("beschr-en")
                  .html("Anlaufgeschwindigkeit: <br> 10 km/h")
                  .css("color", "red")
                  .append("<br>")
              : ""
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

  /**
   * Updates the calculation of the energy gain. When a tileCountetView is given then the counters can be updated directly.
   * Otherwise the wind must be send to the dashboard.
   */
  updateCalculation() {
    if (this.tileCounterView != null && this.connector == null) {
      // function is called from the index page
      // Calculate the energy gain
      this.tileCounterView.handleUpdate();
    } else {
      //function is called from the editorpage
      var data = this.getWind();
      var jsonData = JSON.stringify(data);
      fetch(`${process.env.SERVER_HTTP_URI}/wind`, {
        method: "POST", // oder 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      })
        .then((response) => response)
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      this.stats.sources[3].calculateWind(this.getWind());
      // update the speed of the animation
      this.mapView.updateSpeed();
    }
  }

  /**
   * Returns the current wind.
   * @returns
   */
  getWind() {
    return {
      winddirection:
        this.config.winddirection.labels[
          ($(`#${this.config.winddirection.id}_knob`).val() % 1) *
            $(`#${this.config.winddirection.id}_knob`).attr("divisions")
        ],
      windspeed: ($(`#${this.config.windspeed.id}_knob`).val() % 1) * 90,
    };
  }
}

module.exports = KnobView;
