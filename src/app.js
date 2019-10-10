import World from './World';
import logger from './logger';

const braveNewWorld = new World('a280');

logger.start('Creation of the World');

braveNewWorld.genesis(100, 50);

logger.complete('End of the World');
