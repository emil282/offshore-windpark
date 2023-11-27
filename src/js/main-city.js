/* eslint-disable no-console */
/* globals PIXI */
const City = require("./city");
const MapView = require("./map-view");
require("../sass/default.scss");
const ServerSocketConnector = require("./server-socket-connector");
const ConnectionStateView = require("./connection-state-view");
const showFatalError = require("./lib/show-fatal-error");
const CarOverlay = require("./cars/car-overlay");
const TextureLoader = require("./texture-loader");
const CarSpawner = require("./cars/car-spawner");
const VariableMapOverlay = require("./variable-map-overlay");
//const PowerUpViewMgr = require("./power-up-view-mgr");
//const TrafficHandler = require("./power-ups/traffic-handler");
//const AutonomousVehicleHandler = require("./power-ups/autonomous-vehicle-handler");
//const MaxSpeedHandler = require("./power-ups/max-speed-handler");
//const SpawnTramHandler = require("./power-ups/spawn-tram");
//const WalkableCityHandler = require("./power-ups/walkable-city-handler");
//const DenseCityHandler = require("./power-ups/dense-city-handler");
//const AutonomousVehicleLidarHandler = require("./power-ups/autonomous-vehicle-lidar-handler");
const DataManager = require("./data-manager");
const GreenSpacesData = require("./data-sources/green-spaces-data");
const WindTurbinesData = require("./data-sources/wind-turbines-data_WT");
const ZoningData = require("./data-sources/zoning-data");
const ZoneBalanceData = require("./data-sources/zone-balance-data");

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: "no-store" })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
  })
  .catch((err) => {
    showFatalError(
      `Error loading configuration from ${process.env.SERVER_HTTP_URI}`,
      err
    );
    console.error(
      `Error loading configuration from ${process.env.SERVER_HTTP_URI}`
    );
    throw err;
  })
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 1152,
      height: 1152,
      backgroundColor: 0xa6a6a6,
    });
    const textureLoader = new TextureLoader(app);
    textureLoader.addSpritesheet("roads");
    textureLoader.addSpritesheet("roads-walkable");
    textureLoader.addSpritesheet("parks");
    textureLoader.addSpritesheet("water");
    textureLoader.addSpritesheet("windturbines_small");
    textureLoader.addSpritesheet("windturbines_big");
    textureLoader.addSpritesheet("redBorder_windturbines_big");
    textureLoader.addSpritesheet("redBorder_windturbines_small");
    textureLoader.addFolder("cars", CarSpawner.allTextureIds(config));
    textureLoader
      .load()
      .then((textures) => {
        $('[data-component="app-container"]').append(app.view);
        const stats = new DataManager();
        stats.registerSource(new ZoningData(city, config));
        stats.registerSource(new ZoneBalanceData(city, config));
        stats.registerSource(new GreenSpacesData(city, config));
        stats.registerSource(new WindTurbinesData(city, config));
        stats.calculateAll(); // Calculation gets done here once, because the cities default state is no longer only empty cells, but park cells. Therefore the tile count must be calculated here too, default 0 is no longer correct
        city.map.events.on("update", () => {
          stats.calculateAll();
        });

        const mapView = new MapView(city, config, textures, stats);
        app.stage.addChild(mapView.displayObject);
        mapView.displayObject.width = 1152;
        mapView.displayObject.height = 1152;
        mapView.displayObject.x = 0;
        mapView.displayObject.y = 0;

        const carOverlay = new CarOverlay(mapView, config, textures);
        app.ticker.add((time) => carOverlay.animate(time));
        const carSpawner = new CarSpawner(carOverlay, config);
        app.ticker.add((time) => carSpawner.animate(time));

        /*const powerUpViewMgr = new PowerUpViewMgr();
        app.ticker.add((time) => powerUpViewMgr.animate(time));
        powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(
          new AutonomousVehicleHandler(config, carSpawner)
        );
        powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
        powerUpViewMgr.registerHandler(
          new SpawnTramHandler(config, carSpawner)
        );
        powerUpViewMgr.registerHandler(
          new WalkableCityHandler(config, mapView)
        );
        powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapView));
        powerUpViewMgr.registerHandler(
          new AutonomousVehicleLidarHandler(config, carOverlay),
          true
        );*/

        const variableMapOverlay = new VariableMapOverlay(mapView, config);
        app.ticker.add((time) => variableMapOverlay.animate(time));

        const connector = new ServerSocketConnector(
          process.env.SERVER_SOCKET_URI
        );
        connector.events.on("map_update", (cells) => {
          city.map.replace(cells);
        });
        connector.events.on("connect", () => {
          connector.getMap();
          //connector.getActivePowerUps();
        });
        connector.events.on("view_show_map_var", (variable, data) => {
          variableMapOverlay.show(
            data,
            config.variableMapOverlay.colors[variable] || 0x000000
          );
          setTimeout(() => {
            variableMapOverlay.hide();
          }, config.variableMapOverlay.overlayDuration * 1000);
        });
        /*connector.events.on("power_ups_update", (activePowerUps) => {
          powerUpViewMgr.update(activePowerUps);
        });*/

        const connStateView = new ConnectionStateView(connector);
        $("body").append(connStateView.$element);
      })
      .catch((err) => {
        showFatalError("Error loading textures", err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
