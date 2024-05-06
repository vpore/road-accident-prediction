
import { fetch_OSM_data } from "./fetch-OSM-data.js";
import { fetch_weather_data } from "./fetch-weather-data.js";
import { plot_data } from "./plot-datapoints.js";
import { get_polyline } from "./get-polyline.js";
import { compute_input } from "./compute-input.js";

var modal = document.getElementById("myModal");
var openBtn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

openBtn.onclick = function () {
  modal.style.display = "block";
};
span.onclick = function() {
  modal.style.display = "none";
}

var age_driver, age_vehicle, engine_cap, gender, vehicle_type;
var inputData = []

// ---- FORM INPUT ----
document.getElementById("inputForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent the default form submission
  age_driver = document.getElementById("age_driver").value;
  age_vehicle = document.getElementById("age_vehicle").value;
  engine_cap = document.getElementById("engine_cap").value;
  gender = document.getElementById("gender").value;
  vehicle_type = document.getElementById("vehicle_type").value;
  modal.style.display = "none";
});

const d = new Date();
let hour = d.getHours();
let day = d.getDay();


var points = [],
  msg_el = document.getElementById("msg"),
  url_osrm_nearest = "//router.project-osrm.org/nearest/v1/driving/",
  icon_url = "//cdn.rawgit.com/openlayers/ol3/master/examples/data/icon.png",
  r_pin = "r_pin.png",
  o_pin = "o_pin.png",
  y_pin = "y_pin.png",
  url_ors_dir =
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}`,
  vectorSource = new ol.source.Vector(),
  vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  }),
  styles = {
    route: new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6,
        color: [40, 40, 40, 0.8],
      }),
    }),
    point: function (severe) {
      return new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: severe == 0 ? y_pin : severe == 1 ? o_pin : r_pin,
          scale: 0.1,
        }),
      });
    },
    icon: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: icon_url,
      }),
    }),
    circle: function (radius) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(255, 0, 0, 0.7)",
          width: 1,
        }),
        fill: new ol.style.Fill({
          color:
            radius == 10
              ? "rgba(255, 255, 0, 0.5)"
              : radius == 20
              ? "rgba(255, 165, 0, 0.5)"
              : "rgba(255, 0, 0, 0.5)",
        }),
        geometry: function (feature) {
          var geom = feature.getGeometry();
          if (geom.getType() === "Circle") {
            geom.setRadius(radius*3);
          }
          return geom;
        },
      });
    },
  };

console.clear();

var map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    vectorLayer,
  ],
  view: new ol.View({
    center: [8108003, 2162484],
    zoom: 15,
  }),
});

plot_data(vectorSource);

var point1, point2;
var pathData, coordinatesData, coords, polylineString;

var dist;
function fetchCoordinatesData(data) {
  for(let i=0; i<data.length; i++) {
    for(let j=i+1; j<data.length; j++) {
      dist = calculateDistance(data[i][0], data[i][1], data[j][0], data[j][1]);
      if(dist <= 500) data.splice(j, 1);
    }
  }
  return data;
}

map.on("click", function (evt) {
  utils.getNearest(evt.coordinate).then(function (coord_street) {
    var last_point = points[points.length - 1];
    var points_length = points.push(coord_street);

    if (points_length < 2) {
      msg_el.innerHTML = "Click to add another point";
      utils.createFeature(coord_street);
      return;
    }
    else if(points_length > 2) {return;}
    else {utils.createFeature(coord_street);}

    //------  GET ROUTE  -------
    point1 = last_point.join();
    point2 = coord_street.join();

    fetch(url_ors_dir + "&start=" + point1 + "&end=" + point2)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        msg_el.innerHTML = "Route added";
        coords = json.features[0].geometry.coordinates;
        polylineString = get_polyline(coords);
        utils.createRoute(polylineString);
      });
    
    var id1 = point1.indexOf(',');
    var point1_1 = point1.substring(0, id1);
    var point1_2 = point1.substring(id1+1);
    point1 = point1_1 + "," + point1_2;
    
    var weatherData,
      junctionsData,
      roundaboutsData,
      trafficSignalsData,
      sliproadsData,
      singlecrgData,
      doublecrgData;

    var id2 = point2.indexOf(",");
    var point2_1 = point2.substring(0, id2);
    var point2_2 = point2.substring(id2 + 1);
    point2 = point2_1 + "," + point2_2;
    
    //------  GET ROUTE DIRECTIONS  -------
    fetch(url_ors_dir + "&start=" + point1 + "&end=" + point2)
      .then(function (r) { return r.json(); })
        .then(
            function (json) {
              pathData = json.features[0].properties.segments[0].steps;
              console.log(json.features[0].geometry.coordinates.length);
              coordinatesData = fetchCoordinatesData(json.features[0].geometry.coordinates);
              console.log(coordinatesData.length);
              fetch_weather_data(point1_2, point1_1).then((data) => {
                if (data) {
                  weatherData = data;
                  fetch_OSM_data(json).then((data) => {
                    if (data) {
                      junctionsData = data[0];
                      roundaboutsData = data[1];
                      trafficSignalsData = data[2];
                      sliproadsData = data[3];
                      singlecrgData = data[4];
                      doublecrgData = data[5];
                      generatePathData(
                        pathData,
                        junctionsData,
                        roundaboutsData,
                        sliproadsData,
                        singlecrgData,
                        doublecrgData,
                        trafficSignalsData,
                        weatherData,
                        coordinatesData
                      );
                    }
                  });
                }
              });
            }
        )

  });
});



function generatePathData(pathData, junctionsData, roundaboutsData, sliproadsData, singlecrgData, doublecrgData, trafficSignalsData, weatherData, coordinatesData) {
  var weather = weatherData.weather[0].main.toLowerCase();
  var trafficsignal_dis = calculateDistances(coordinatesData, trafficSignalsData);
  var junction_dis = calculateDistances(coordinatesData, junctionsData);
  var roundabout_dis = calculateDistances(coordinatesData, roundaboutsData);
  var sliproad_dis = calculateDistances(coordinatesData, sliproadsData);
  var singcrg_dis = calculateDistances(coordinatesData, singlecrgData);
  var doublecrg_dis = calculateDistances(coordinatesData, doublecrgData);
  var manoeuvre = [];
  for(let i=0; i<pathData.length; i++) {
    manoeuvre.push(pathData[i].type);
  }

  compute_input(
    hour,
    age_vehicle,
    age_driver,
    engine_cap,
    gender,
    vehicle_type,
    day,
    weather,
    trafficsignal_dis,
    junction_dis,
    roundabout_dis,
    sliproad_dis,
    singcrg_dis,
    doublecrg_dis,
    manoeuvre,
    coordinatesData,
    inputData
  );

  predict(inputData);
  
}

function predict(inputData) {
  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input_data: inputData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.predictions);
      map_predictions(inputData, data.predictions);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function map_predictions(inputData, data) {
  var coord = [];
  for(let i=0; i<data.length; i++) {
    coord = [];
    coord.push(inputData[i][1]);
    coord.push(inputData[i][0]);
    utils.createMarker(coord, (data[i]+1)*10);
  }
}


function calculateDistances(coords1, coords2) {
  const distances = [];
  let x = 0;
  for (let i = 0; i < coords1.length; i++) {
    x = 0;
    for (let j = 0; j < coords2.length; j++) {
      const distance = calculateDistance(
        coords1[i][0],
        coords1[i][1],
        coords2[j][0],
        coords2[j][1]
      );
      x = x || (distance <= 20 ? 1 : 0);
    }
    distances.push(x);
  }
  return distances;
}

function calculateDistance(lon1, lat1, lon2, lat2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const del_phi = ((lat2 - lat1) * Math.PI) / 180;
  const del_lam = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(del_phi / 2) * Math.sin(del_phi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(del_lam / 2) *
      Math.sin(del_lam / 2);
  const c = 2 * Math.asin(Math.sqrt(a));

  const distance = R * c;
  return distance;
}


var utils = {
  getNearest: function (coord) {
    var coord4326 = utils.to4326(coord);
    return new Promise(function (resolve, reject) {
      fetch(url_osrm_nearest + coord4326.join())
        .then(function (response) {
          return response.json();
        })
        .then(function (json) {
          if (json.code === "Ok") resolve(json.waypoints[0].location);
          else reject();
        });
    });
  },
  createPoints: function (coord, severe) {
    var feature = new ol.Feature({
      type: "place",
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)),
    });
    feature.setStyle(styles.point(severe));
    vectorSource.addFeature(feature);
  },
  createFeature: function (coord) {
    var feature = new ol.Feature({
      type: "place",
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)),
    });
    feature.setStyle(styles.icon);
    vectorSource.addFeature(feature);
  },
  createMarker: function (coord, radius) {
    var feature = new ol.Feature({
      type: "place",
      geometry: new ol.geom.Circle(ol.proj.fromLonLat(coord), radius),
    });
    feature.setStyle(styles.circle(radius));
    vectorSource.addFeature(feature);
  },
  createRoute: function (polyline) {
    var route = new ol.format.Polyline({
      factor: 1e5,
    }).readGeometry(polyline, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });
    var feature = new ol.Feature({
      type: "route",
      geometry: route,
    });
    feature.setStyle(styles.route);
    vectorSource.addFeature(feature);
  },
  to4326: function (coord) {
    return ol.proj.transform(
      [parseFloat(coord[0]), parseFloat(coord[1])],
      "EPSG:3857",
      "EPSG:4326"
    );
  },
};