

var r_pin = "r_pin.png",
  o_pin = "o_pin.png",
  y_pin = "y_pin.png";
var styles = {
  point: function (severe) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: severe == 0 ? y_pin : severe == 1 ? o_pin : r_pin,
        scale: 0.1,
      }),
    });
  },
};

var utils = {
  createPoints: function (coord, severe, vectorSource) {
    var feature = new ol.Feature({
      type: "place",
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)),
    });
    feature.setStyle(styles.point(severe));
    vectorSource.addFeature(feature);
  },
};

export function plot_data(vectorSource) {
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
        utils.createPoints(values[i], lab[i], vectorSource);
      }
      return values;
    })
    .catch((error) => {
      console.error("Error fetching the CSV file:", error);
    });
}