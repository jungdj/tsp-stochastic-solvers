import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { getAndParseData, randPerm, shuffle } from './utils';

const loadPretrained = (name, population) => {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, `../trained/${name}-${population}.txt`), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

const savePretrained = (name, population, creatures) => {
  try {
    fs.writeFileSync(path.resolve(__dirname, `../trained/${name}-${population}.txt`), JSON.stringify(creatures), 'utf8');
  } catch (error) {
  }
};



const main = (name, population = 3, generation = 1000000) => {
  const { length, distance } = getAndParseData(name);
  const list = [...Array(length - 1)].map((x, i) => i + 2);
  let creatures = loadPretrained(name, population);
  if (!creatures) {
    creatures = [...Array(population)].map(() => [1, ...randPerm(list)]);
  }

  const fitnessFunc = (creature) => {
  	const dup = creature.slice(0, creature.length - 1); // Cut last element to reduce redundant last check
    return dup.reduce((acc, cur, i) => acc + distance(cur, creature[i + 1]), distance(creature[0], creature[creature.length - 1]));
  };

  const nextGeneration = () => {
    const fitnesses = creatures.map((creature, i) => ({
      fitness: fitnessFunc(creature),
      index: i,
    }));

    const sorted = _.sortBy(fitnesses, 'fitness');
    console.log('Best 10', sorted.slice(0, 10));
    const best = sorted.slice(0, 1).map(({ index }) => creatures[index]);
    const bestPerm1 = best.map((best) => shuffle(best, 1));
    const bestPerm2 = best.map((best) => shuffle(best, 2));
    const bestPerm3 = best.map((best) => shuffle(best, 3));
    const bestPerm = [...bestPerm1, ...bestPerm2, ...bestPerm3]//, ...bestPerm4, ...bestPerm5];
    return [...best, ...bestPerm];
  };


  while (generation != 0) {
  	console.log(`[GEN ${generation} Left]`);
  	creatures = nextGeneration();
		savePretrained(name, population, creatures);
    generation--;
  }
};

main('a280');
