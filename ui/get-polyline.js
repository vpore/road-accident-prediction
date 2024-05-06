
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

export function get_polyline(coords) {
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