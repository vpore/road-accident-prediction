

export async function fetch_OSM_data(req) {
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
  responses.push(
    junctionData.elements
      .filter((element) => "lat" in element && "lon" in element)
      .map((element) => [element.lon, element.lat])
  );

  console.log(junctionData)

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

  return responses;
}
