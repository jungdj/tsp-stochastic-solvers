import fs from 'fs';
import path from 'path';

const testdataList = [
  'a280',
  'ali535',
  'att48',
];

const resolvePath = (file) => path.resolve(__dirname, `../testdata/${file}.tsp`);
const testdataFilesArray = testdataList.map(resolvePath);
const testdataFiles = testdataList.reduce((acc, cur) => ({ ...acc, [cur]: resolvePath(cur) }), {});

const getAndParseData = (name) => {
  const fileLoc = testdataFiles[name];
  const testdata = fs.readFileSync(fileLoc, 'utf8');
  const lines = testdata.split('\n');
  const from = lines.findIndex((line) => line === 'NODE_COORD_SECTION');
  let data = lines.slice(from + 1, -2);
  data = data.map((x) => x.trim());
  data = data.map((x) => x.split(' '));
  data = data.map((x) => x = x.filter((x) => !!x));

  const distances = {};

  const euclideanDistance = (a, b) => {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    const edge = `${low}-${high}`;
    return distances[edge] || (() => {
      const [, x1, y1] = data[low - 1];
      const [, x2, y2] = data[high - 1];
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      distances[edge] = distance;
      return distance;
    })();
  };

  return { l: data.length, d: euclideanDistance };
};

const main = (name) => {
  const { l, d } = getAndParseData(name);
};

main('a280');
