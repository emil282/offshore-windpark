let windDirection = document.getElementById("wind_direction");
let windDirectionKnob = document.getElementById("wind_direction_knob");
const windDirections = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];

let windSpeed = document.getElementById("wind_speed");
let windSpeedKnob = document.getElementById("wind_speed_knob");

windDirection.addEventListener("input", (event) => {
  let value = (windDirectionKnob.value % 1) * windDirectionKnob.divisions;
  document.getElementById("wind_direction_span").innerHTML =
    windDirections[value];
});

let circleContainer = document.querySelectorAll(
  "#circle-container > li > span"
);
for (let i = 0; i < circleContainer.length; i++) {
  circleContainer[i].innerHTML = windDirections[i];
}

windSpeed.addEventListener("input", (event) => {
  let value = Math.round((windSpeedKnob.value % 1) * 12);
  document.getElementById("wind_speed_span").innerHTML = value;
});
