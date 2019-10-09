import fs from 'fs';
import _ from 'lodash';

import Ant from './Ant';

import { testdataFiles, testdataQs, trainedDataPath } from './utils';
import logger from './logger';

class World {
	name = '';

	round = 0;

	edges = {};

	destinationsFromNodes = {};

	ants = []

	numAnts = 0

	data = []

	dataLength = 0;

	loadPretrained = () => {
	  const { name } = this;
	  logger.start('loadPretrained() - name : ', name);
	  try {
	    const preTrained = fs.readFileSync(trainedDataPath(name), 'utf8');
	    const parsed = JSON.parse(preTrained); /* { edges, destinationsFromNodes } */
	    const { edges, destinationsFromNodes, dataLength } = parsed;
	    this.edges = edges;
	    this.destinationsFromNodes = destinationsFromNodes;
	    this.dataLength = dataLength;
	    logger.complete('loadPretrained() - Data loaded');
	    return true;
	  } catch (error) {
	    logger.complete('loadPretrained() - Nothing to load');
	    return false;
	  }
	}

	saveTrained = () => {
	  const { name } = this;
	  logger.start('saveTrained() - name : ', name);
	  const trained = {
	    edges: this.edges,
	    destinationsFromNodes: this.destinationsFromNodes,
	    dataLength: this.dataLength,
	  };
	  fs.writeFileSync(trainedDataPath(name), JSON.stringify(trained, null, 4), 'utf8');
	  logger.complete('saveTrained() - Data saved');
	}

	constructor(name, alpha = 1, beta = 1) {
	  logger.start('constructor()');
	  this.name = name;
	  const fileLoc = testdataFiles[name];
	  this.Q = testdataQs[name] / 10;
	  this.alpha = alpha;
	  this.beta = beta;

	  if (this.loadPretrained()) {
	  	logger.santa('Loaded pretrained data!');
	    logger.complete('constructor()');
	    return;
	  }

	  const testdata = fs.readFileSync(fileLoc, 'utf8');
	  const lines = testdata.split('\n');
	  const from = lines.findIndex((line) => line === 'NODE_COORD_SECTION');
	  let data = lines.slice(from + 1, -2);
	  data = data.map(x => x.trim());
	  data = data.map(x => x.split(' '));
	  data = data.map(x => x.filter(item => !!item));

	  for (let cur = 1; cur <= data.length; cur++) {
	  	const [, cx, cy] = data[cur - 1];

	  	const edgesFromCur = [];

	  	for (let dest = 1; dest < cur; dest++) {
	  		edgesFromCur.push({
	        nodeNum: dest,
	        ...this.getEdge(cur, dest),
	      });
	    }

	  	for (let dest = cur + 1; dest <= data.length; dest++) {
	  		const [, dx, dy] = data[dest - 1];
	  		const key = `${cur}-${dest}`;
	  		const deltaX = dx - cx;
	  		const deltaY = dy - cy;
	  		this.edges[key] = {
	  			distance: Math.sqrt(deltaX ** 2 + deltaY ** 2),
	        pheromone: 1,
	      };

	  		edgesFromCur.push({
	        nodeNum: dest,
	        distance: Math.sqrt(deltaX ** 2 + deltaY ** 2),
	        pheromone: 1,
	      });
	    }

	  	const sortedEdgesFromCur = _.sortBy(edgesFromCur, 'distance');
	    this.destinationsFromNodes[cur] = sortedEdgesFromCur.map(edge => edge.nodeNum);
	    logger.complete(`${cur}th node's edges calculated`);
	  }

	  this.dataLength = data.length;
	  logger.complete('constructor()');
	}

	getEdge = (start, end) => {
	  if (start === end) {
	    throw new Error("Start and end can't be equal");
	  }
	  const startKey = Math.min(start, end);
	  const endKey = Math.max(start, end);
	  return this.edges[`${startKey}-${endKey}`];
	}

	setEdge = (start, end, update) => {
	  if (start === end) {
	    throw new Error("Start and end can't be equal");
	  }
	  const startKey = Math.min(start, end);
	  const endKey = Math.max(start, end);
	  //console.log(start, end, update(this.getEdge(startKey, endKey)));
	  this.edges[`${startKey}-${endKey}`] = update(this.getEdge(startKey, endKey));
	}

	createSingleAnt = (at = 1) => {
	  const ant = new Ant(at);
	  this.ants.push(ant);
	}

	createAnt = (number, at = 1) => {
	  logger.start('Create Ant() - number : ', number);
	  for (let i = 1; i <= number; i++) {
	  	this.createSingleAnt(at);
	  }
	  logger.complete('Create Ant()');
	}

	sanitize = () => {
	  logger.start('sanitize()');
	  this.ants = [];
	  logger.complete('sanitize()');
	}

	forward = (ant) => {
	  const { location, path } = ant;
	  const destsFromNode = this.destinationsFromNodes[location];
	  const undiscoveredNodes = _.filter(destsFromNode, dest => !path.includes(dest));
	  // console.log({ undiscoveredNodes: undiscoveredNodes.length });
	  const numCandidates = Math.min(undiscoveredNodes.length, 2);
	  const candidates = undiscoveredNodes.slice(0, numCandidates);

	  let totalPriority = 0;
	  const accPriorities = [];
	  let overlap = false; // source and destination has same position

	  for (const candidate of candidates) {
	  	const edge = this.getEdge(location, candidate);
	  	const { pheromone, distance } = edge;
	  	if (distance === 0) {
	  		overlap = candidate;
	  		break;
	    }
	  	const priority = (pheromone ** this.alpha) * ((1 / distance) ** this.beta);
	  	  //console.log(
	    	// accPriorities[accPriorities.length - 1],
	    	// accPriorities.length,
	    	// (accPriorities.length ? accPriorities[accPriorities.length - 1] : 0),
	    	// priority,
	      //);
	    accPriorities.push(
	      (accPriorities.length ? accPriorities[accPriorities.length - 1] : 0) + priority,
	    );
	    totalPriority += priority;
	  }

	  const next = overlap || (() => {
	    const roulette = Math.random() * totalPriority;
	    const nextIndex = accPriorities.findIndex(acc => acc > roulette);
	    return candidates[nextIndex];
	  })();


	  ant.length += this.getEdge(location, next).distance;
	  ant.path.push(next);
	  ant.location = next;
	}

	endTravel = (ant) => {
	  const { location } = ant;
	  const next = 1;

	  ant.length += this.getEdge(location, next).distance;
	  ant.path.push(next);
	  ant.location = next;
	}

	retrace = (ant) => {
	  const { Q } = this;
	  const { length, path } = ant;

	  for (let i = 0; i < path.length - 1; i++) {
	  	const cur = path[i];
	  	const next = path[i + 1];

	  	const newPheromone = Q / length;

	  	this.setEdge(cur, next, edge => ({
	  			...edge,
	      pheromone: edge.pheromone + newPheromone,
	    }));
	  }
	}

	travel = (ant) => {
	  for (let i = 1; i < this.dataLength; i++) {
	    this.forward(ant);
	  }
	  this.endTravel(ant);
	}

	next = () => {
	  this.round++;
	  logger.start('Next() - Round : ', this.round);
	  logger.start('next() - start travel');
	  for (const ant of this.ants) {
	  	this.travel(ant);
	  }
	  logger.complete('next() - complete travel');
	  logger.start('next() - start retrace');
	  for (const ant of this.ants) {
	    this.retrace(ant);
	  }
	  logger.complete('next() - complete retrace');

	  this.saveTrained();
	  logger.complete('Next() - Round : ', this.round);
	}

	rankAnts = () => {
	  const rankedAnts = _.sortBy(this.ants, 'length');
	  const rankers = rankedAnts.slice(0, 10);
	  const rankedLength = rankers.map(ranker => ranker.length);
	  logger.santa('Congrats!\n', rankers.map(x => JSON.stringify(x)));
	  logger.santa('Congrats!\n', rankedLength);
	  console.log('Congrats!\n', rankedLength);
	}

	colonize = () => {
	  logger.start('Colonize() - Round : ', this.round);
	  this.createAnt(this.numAnts);
	  this.next();
	  this.rankAnts();
	  this.sanitize();
	  logger.complete('Colonize() - Round : ', this.round);
	}

	genesis = (endOfWorld = 100000, numAnts = 100) => {
	  this.numAnts = numAnts;
	  //setInterval(this.colonize, 1000)
	  for (let i = 0; i < endOfWorld; i++) {
	    this.colonize();
	  }
	}
}

export default World;
