// import ol from ol

var modal = document.getElementById("myModal");
var openBtn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

const results = [];

// fs.createReadStream("model-data.csv")
//   .pipe(csvParser())
//   .on("data", (data) => results.push(data))
//   .on("end", () => {
//     console.log(results);
//   });


openBtn.onclick = function () {
  modal.style.display = "block";
};
span.onclick = function() {
  modal.style.display = "none";
}

var age_driver, age_vehicle, engine_cap, gender, vehicle_type;
var inputData = []

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

async function getWeatherData(lat, long) {
  
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherApiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "Failed to fetch weather data");
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

async function fetchOSMData(req) {
  var bboxStr = req.bbox.toString();
  let values = bboxStr.split(",");

  let temp = values[1];
  values[1] = values[0];
  values[0] = temp;

  temp = values[3];
  values[3] = values[2];
  values[2] = temp;

  let bbox = values.join(",");
  const overpassUrl = "http://overpass-api.de/api/interpreter";
  const responses = [];

  const junctionQuery = `[out:json][timeout:25];
nwr["junction"](${bbox});
out geom;`;
  const junctionRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(junctionQuery)}`
  );
  const junctionData = await junctionRes.json();
  responses.push(junctionData.elements
    .filter((element) => "lat" in element && "lon" in element)
    .map((element) => [element.lon, element.lat]));



  const roundaboutsQuery = `[out:json][timeout:25];
(
  nwr["highway"="mini_roundabout"](${bbox});
  nwr["junction"="roundabout"](${bbox});
);
out geom;`;
  const roundaboutsRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(roundaboutsQuery)}`
  );
  const roundaboutsData = await roundaboutsRes.json();
  responses.push(
    roundaboutsData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );
  
  
  const trafficSignalsQuery = `[out:json][timeout:25];
nwr["highway"="traffic_signals"](${bbox});
out geom;`;
  const trafficSignalsRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(trafficSignalsQuery)}`
  );
  const trafficSignalsData = await trafficSignalsRes.json();
  responses.push(
    trafficSignalsData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );



  const sliproadsQuery = `[out:json][timeout:25];
nwr["highway"="trunk_link"](${bbox});
out geom;`;
  const sliproadsRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(sliproadsQuery)}`
  );
  const sliproadsData = await sliproadsRes.json();
  responses.push(
    sliproadsData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );



  const singlecrgQuery = `[out:json][timeout:25];
nwr["oneway"](${bbox});
out geom;`;
  const singlecrgRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(singlecrgQuery)}`
  );
  const singlecrgData = await singlecrgRes.json();
  responses.push(
    singlecrgData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );



  const doublecrgQuery = `[out:json][timeout:25];
nwr["dual_carriageway"](${bbox});
out geom;`;
  const doublecrgRes = await fetch(
    `${overpassUrl}?data=${encodeURIComponent(doublecrgQuery)}`
  );
  const doublecrgData = await doublecrgRes.json();
  responses.push(
    doublecrgData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );


  return(responses);
}

var points = [],
  msg_el = document.getElementById("msg"),
  url_osrm_nearest = "//router.project-osrm.org/nearest/v1/driving/",
  url_osrm_route = "//router.project-osrm.org/route/v1/driving/",
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
            if (radius == 10) {
              geom.setRadius(15);
            } else if(radius == 30){
              geom.setRadius(25);
            } else {
              geom.setRadius(20);
            }
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

var point1, point2;
var pathData, coordinatesData, coords, polylineString;

function encodeValue(value) {
  value = Math.round(value * 1e5);
  value = value < 0 ? ~(value << 1) : value << 1;

  var encoded = "";
  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }
  encoded += String.fromCharCode(value + 63);

  return encoded;
}

function getPolyline(coords) {
  var result = [];
  var prevCoords = [0, 0];

  for (var i = 0; i < coords.length; i++) {
    var lat = coords[i][1];
    var lng = coords[i][0];

    var latDiff = lat - prevCoords[0];
    var lngDiff = lng - prevCoords[1];

    prevCoords[0] = lat;
    prevCoords[1] = lng;

    result.push(encodeValue(latDiff), encodeValue(lngDiff));
  }

  return result.join("");
}

function plotData() {
  fetch("model-data.csv")
    .then((response) => response.text())
    .then((data) => {
      const og_rows = data.split("\n");
      const rows = og_rows.slice(1);
      const selectedRows = rows;
      const lowerLeft = [72.81905414127034, 19.043769535650142];
      const upperRight = [72.84733535152644, 19.07605738257138];
      const lab = selectedRows
        .map((row) => {
          const columns = row.split(",");
          const coordinates = [parseFloat(columns[2]), parseFloat(columns[1])];
          const severe = columns[50];
          const withinRange =
            coordinates[0] >= lowerLeft[0] &&
            coordinates[0] <= upperRight[0] &&
            coordinates[1] >= lowerLeft[1] &&
            coordinates[1] <= upperRight[1];
          if (withinRange) {
            return severe;
          } else {
            return null;
          }
        })
        .filter((coordinate) => coordinate !== null);

      const values = selectedRows
        .map((row) => {
          const columns = row.split(",");
          const coordinates = [parseFloat(columns[2]), parseFloat(columns[1])];
          const withinRange =
            coordinates[0] >= lowerLeft[0] &&
            coordinates[0] <= upperRight[0] &&
            coordinates[1] >= lowerLeft[1] &&
            coordinates[1] <= upperRight[1];

          if (withinRange) {
            return coordinates;
          } else {
            return null;
          }
        })
        .filter((coordinate) => coordinate !== null);
      for (let i = 0; i < values.length; i++) {
        utils.createPoints(values[i], lab[i]);
      }
      return values;
    })
    .catch((error) => {
      console.error("Error fetching the CSV file:", error);
    });
}

plotData();

var zoomFunction = function (feature, resolution) {
  var zoom = map.getView().getZoom();
  var scaleFactor = 1;
  if (zoom < 10) {
    scaleFactor = 0.5;
  } else if (zoom < 15) {
    scaleFactor = 0.2;
  }
  iconStyle.getImage().setScale(scaleFactor);
  
  return [iconStyle];
};

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

    //get the route
    point1 = last_point.join();
    point2 = coord_street.join();

    // fetch(url_osrm_route + point1 + ";" + point2)
    //   .then(function (r) {
    //     return r.json();
    //   })
    //   .then(function (json) {
    //     if (json.code !== "Ok") {
    //       msg_el.innerHTML = "No route found.";
    //       return;
    //     }
    //     msg_el.innerHTML = "Route added";
    //     console.log(json.routes[0].geometry);
    //     // utils.createRoute(json.routes[0].geometry);
    //   });

    fetch(url_ors_dir + "&start=" + point1 + "&end=" + point2)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        msg_el.innerHTML = "Route added";
        coords = json.features[0].geometry.coordinates;
        polylineString = getPolyline(coords);
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
    
    fetch(url_ors_dir + "&start=" + point1 + "&end=" + point2)
      .then(function (r) { return r.json(); })
        .then(
            function (json) {
              pathData = json.features[0].properties.segments[0].steps;
              coordinatesData = json.features[0].geometry.coordinates;
              getWeatherData(point1_2, point1_1).then((data) => {
                if (data) {
                  weatherData = data;
                  fetchOSMData(json).then((data) => {
                    if(data) {
                      junctionsData = data[0];
                      roundaboutsData = data[1];
                      trafficSignalsData = data[2];
                      sliproadsData = data[3];
                      singlecrgData = data[4];
                      doublecrgData = data[5];
                      getPathData(pathData, junctionsData, roundaboutsData, sliproadsData, singlecrgData, doublecrgData, trafficSignalsData, weatherData, coordinatesData);
                    }
                  })
                }
              });
            }
        )

  });
});

const input_data = [
  [0.1, 0.2],
  [0.3, 0.4],
];

function calculateDistance(lon1, lat1, lon2, lat2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const del_phi = ((lat2 - lat1) * Math.PI) / 180;
  const del_lam = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(del_phi / 2) * Math.sin(del_phi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(del_lam / 2) * Math.sin(del_lam / 2);
  const c = 2 * Math.asin(Math.sqrt(a));

  const distance = R * c;
  return distance;
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

function compute_input(
  weather,
  trafficsignal_dis,
  junction_dis,
  roundabout_dis,
  sliproad_dis,
  singcrg_dis,
  doublecrg_dis,
  manoeuvre,
  coordinatesData
) {
  for (let i = 0; i < coordinatesData.length; i++) {
    var inputEntry = {
      Latitude: coordinatesData[i][1],
      Longitude: coordinatesData[i][0],
      Time: hour,
      Age_of_Vehicle: age_vehicle,
      Engine_Capacity: engine_cap,
      Day_of_Week_Monday: day == 1 ? 1 : 0,
      Day_of_Week_Saturday: day == 6 ? 1 : 0,
      Day_of_Week_Sunday: day == 0 ? 1 : 0,
      Day_of_Week_Thursday: day == 4 ? 1 : 0,
      Day_of_Week_Tuesday: day == 2 ? 1 : 0,
      Day_of_Week_Wednesday: day == 3 ? 1 : 0,
      Junction_Control_Give_way_or_uncontrolled: trafficsignal_dis[i]
        ? 0
        : junction_dis[i],
      Junction_Control_Not_at_junction: trafficsignal_dis[i]
        ? 0
        : (junction_dis[i]?0:1),
      Junction_Detail_Not_at_junction: junction_dis[i] ? 0 : 1,
      Junction_Detail_Roundabout: roundabout_dis[i] ? 1 : 0,
      Junction_Detail_Slip_road: sliproad_dis[i] ? 1 : 0,
      Light_Conditions_Daylight: hour > 6 && hour < 19 ? 1 : 0,
      Road_Surface_Conditions_wet:
        weather == "rain" || weather == "snow" ? 1 : 0,
      Road_Type_Roundabout: roundabout_dis[i] ? 1 : 0,
      Road_Type_Single_carriageway: singcrg_dis[i],
      Urban_or_Rural_Area_Urban: 1,
      Weather_Conditions_rain: weather == "rain" ? 1 : 0,
      Weather_Conditions_snow: weather == "snow" ? 1 : 0,
      Age_Band_of_Driver_21_25: age_driver >= 21 && age_driver <= 25 ? 1 : 0,
      Age_Band_of_Driver_26_35: age_driver >= 26 && age_driver <= 35 ? 1 : 0,
      Age_Band_of_Driver_36_45: age_driver >= 36 && age_driver <= 45 ? 1 : 0,
      Age_Band_of_Driver_46_55: age_driver >= 46 && age_driver <= 55 ? 1 : 0,
      Age_Band_of_Driver_56_65: age_driver >= 56 && age_driver <= 65 ? 1 : 0,
      Age_Band_of_Driver_66_75: age_driver >= 66 && age_driver <= 75 ? 1 : 0,
      Age_Band_of_Driver_Over_75: age_driver > 75 ? 1 : 0,
      Junction_Location_At_junction: junction_dis[i],
      Junction_Location_At_main_road: singcrg_dis[i],
      Junction_Location_At_roundabout: roundabout_dis[i],
      Junction_Location_At_slip_road: sliproad_dis[i],
      Junction_Location_Not_at_junction: junction_dis[i] ? 0 : 1,
      Sex_of_Driver_Male: gender == "male" ? 1 : 0,
      Vehicle_Manoeuvre_goal: manoeuvre[i]==10?1:0,
      Vehicle_Manoeuvre_keep_left: manoeuvre[i]==12?1:0,
      Vehicle_Manoeuvre_keep_right: manoeuvre[i]==13?1:0,
      Vehicle_Manoeuvre_left: manoeuvre[i]==0?1:0,
      Vehicle_Manoeuvre_right: manoeuvre[i]==1?1:0,
      Vehicle_Manoeuvre_sharp_left: manoeuvre[i]==2?1:0,
      Vehicle_Manoeuvre_sharp_right: manoeuvre[i]==3?1:0,
      Vehicle_Manoeuvre_slight_left: manoeuvre[i]==4?1:0,
      Vehicle_Manoeuvre_slight_right: manoeuvre[i]==5?1:0,
      Vehicle_Manoeuvre_straight: manoeuvre[i]==6?1:0,
      Vehicle_Manoeuvre_u_turn: manoeuvre[i]==9?1:0,
      Vehicle_Type_Car: vehicle_type == "car" ? 1 : 0,
      Vehicle_Type_Motorcycle: vehicle_type == "bike" ? 1 : 0,
    };

    var X_new = Object.values(inputEntry);
    inputData.push(X_new);
  }

}

function getPathData(pathData, junctionsData, roundaboutsData, sliproadsData, singlecrgData, doublecrgData, trafficSignalsData, weatherData, coordinatesData) {
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
    weather,
    trafficsignal_dis,
    junction_dis,
    roundabout_dis,
    sliproad_dis,
    singcrg_dis,
    doublecrg_dis,
    manoeuvre,
    coordinatesData
  );

  predict(inputData);
  
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