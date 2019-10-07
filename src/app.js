import _ from 'lodash';
import { getAndParseData, randPerm, shuffle } from './utils';

const main = (name, population = 1000, generation = 1000) => {
  const { length, distance, distances } = getAndParseData(name);
  const list = [...Array(length - 1)].map((x, i) => i + 2);
  let creatures = [...Array(population)].map(() => [1, ...randPerm(list)]);

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
    console.log('Best 5', sorted.slice(0, 5));
    const best = sorted.slice(0, 300).map(({ index }) => creatures[index]);
    const bestPerm = best.map((best) => shuffle(best, 2));
    const newCreatures = [...Array(200)].map(() => [1, ...randPerm(list)]);
    const worst = sorted.slice(790, 200).map(({ index }) => creatures[index]);

    return [...best, ...bestPerm, ...newCreatures, ...worst];
  };


  while (generation != 0) {
  	creatures = nextGeneration();
    generation--;
  }
};

main('a280');
