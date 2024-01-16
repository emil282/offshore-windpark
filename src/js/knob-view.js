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
        this.updateKnob({ winddirection: value });
        this.updateCalculation();
      });
      $(`#${this.config.windspeed.id}`).on("input", (event) => {
        // Sets the current windspeed
        let value = Math.round((event.target.value % 1) * 90);
        this.updateKnob({ windspeed: value });
        this.updateCalculation();
      });
    });

    //Event Listener for the physical knobs
    //When a "q" is detected the knob is turned to the right
    //When a "Backspace" is detected the knob is turned to the left
    //After 18 turns the knob is back at the starting position. Because of this I am working with modulo 18.
    //Because we have 8 wind directions I am working with modulo 8 after that.
    /*
    let directionCounter = 0;
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "q") {
          directionCounter++;
        } else if (event.key === "Backspace") {
          directionCounter--;
        }
        directionCounter = ((directionCounter % 18) + 18) % 18;
        let val = ((Math.round(directionCounter * (7 / 17) + 0.5) % 8) + 8) % 8; //+0.5, because it was better.
        this.updateKnob({ winddirection: val });
        this.updateCalculation();
      }.bind(this)
    );*/
    let speedCounter = 0;
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "q") {
          speedCounter++;
        } else if (event.key === "Backspace") {
          speedCounter--;
        }
        speedCounter = ((speedCounter % 18) + 18) % 18;
        let val = ((Math.round(speedCounter * (90 / 17)) % 90) + 90) % 90;
        this.updateKnob({ windspeed: val });
        this.updateCalculation();
      }.bind(this)
    );
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
          )
          .append("<br>")
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
   * Updates the knob values and the labels.
   * @param {*} wind
   */
  updateKnob(wind) {
    if (wind.winddirection) {
      $(`#${this.config.winddirection.id}_knob`).val(wind.winddirection / 8);
      $(`#${this.config.winddirection.id}_span`).html(
        this.config.winddirection.labels[wind.winddirection]
      );
    }

    if (wind.windspeed) {
      $(`#${this.config.windspeed.id}_knob`).val(wind.windspeed / 90);
      $(`#${this.config.windspeed.id}_span`).html(wind.windspeed + " km/h");

      // hide starting speed info if the speeed is above 10 km/h
      if (wind.windspeed >= 10) {
        $(`#${this.config.windspeed.id}_startingSpeed`).hide();
      } else {
        $(`#${this.config.windspeed.id}_startingSpeed`).show();
      }
    }
    this.stats.sources[3].calculateWind(this.getWind());
    this.mapView.updateSpeed();
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
