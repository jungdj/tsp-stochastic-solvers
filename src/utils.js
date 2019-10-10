import fs from 'fs';
import path from 'path';

const testdataList = [
  'a280',
  'st70',
  'my5',
  'ali535',
  'att48',
  'rl11849',
];

const resolvePath = (file) => path.resolve(__dirname, `../testdata/${file}.tsp`);
const resolveSolPath = (file) => path.resolve(__dirname, `../solution/${file}.tour`);
export const trainedDataPath = (name) => path.resolve(__dirname, `../trained/${name}-pheromone.json`);
const testdataFilesArray = testdataList.map(resolvePath);
export const testdataFiles = testdataList.reduce((acc, cur) => ({ ...acc, [cur]: resolvePath(cur) }), {});
const resultFiles = testdataList.reduce((acc, cur) => ({ ...acc, [cur]: resolveSolPath(cur) }), {});


export const testdataQs = {
  my5: 16,
  st70: 675,
  a280: 2579,
  ali535: 202310,
  att48: 10628,
  rl11849: 920847,
};

export const getAndParseData = (name) => {
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

  return { length: data.length, distance: euclideanDistance, distances };
};

export const randPerm = (prev) => {
  const array = prev.slice();
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const shuffle = (prev, cnt) => {
  const array = prev.slice();
  let temporaryValue;
  let randomIndex1;
  let randomIndex2;

  // While there remain elements to shuffle...
  while (cnt !== 0) {
    // Pick a remaining element...
    randomIndex1 = Math.floor(Math.random() * array.length);
    randomIndex2 = Math.floor(Math.random() * array.length);
    cnt -= 1;

    // And swap it with the current element.
    temporaryValue = array[randomIndex1];
    array[randomIndex1] = array[randomIndex2];
    array[randomIndex2] = temporaryValue;
  }

  return array;
};
