import World from './World';
import logger from './logger';

const braveNewWorld = new World('rl11849');

logger.start('Creation of the World');

braveNewWorld.genesis(100, 100);

logger.complete('End of the World');
