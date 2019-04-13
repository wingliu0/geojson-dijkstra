const fs = require('fs').promises;
const { Graph } = require('./index.js');

main();

async function main() {

  const geojson = await readyNetwork();
  const network = new Graph();

  console.time('buildTime');
  network.loadFromGeoJson(geojson);
  console.timeEnd('buildTime');

  // console.log(network)

  const start = '-118.277145,34.021101';
  const end = '-118.332832,34.035054';
  // const start = '-101.35986328125,43.34116005412307'; // todo number??
  // const end = '-91.669921875,40.195659093364654';

  console.time('runningTime');
  const { distance, edgelist, nodelist, path } = network.runDijkstra(start, end, { output: ['path', 'nodelist', 'edgelist', 'distance'] });
  console.timeEnd('runningTime');

  console.log({ distance });
  console.log({ edgelist });
  console.log({ nodelist });
  // console.log({ path });

}

async function readyNetwork() {

  const geojson_raw = await fs.readFile('./full_network.geojson');
  // const geojson_raw = await fs.readFile('./test.geojson');

  const geojson = JSON.parse(geojson_raw);

  // set up _cost field
  geojson.features.forEach(feat => {
    const mph = getMPH(feat.properties.NHS);
    feat.properties._cost = (feat.properties.MILES / 60) * mph;
  });

  // set up _id field
  geojson.features.forEach(feat => {
    feat.properties._id = feat.properties.ID;
  });

  // clean network
  geojson.features = geojson.features.filter(feat => {
    if (feat.properties._cost && feat.geometry.coordinates) {
      return true;
    }
  });

  return geojson;
}

function getMPH(nhs) {
  switch (nhs) {
    case 1:
      return 70;
    case 2:
      return 60;
    case 3:
      return 50;
    case 4:
      return 40;
    case 7:
      return 30;
    case 8:
      return 20;
    default:
      return 10;
  }
}