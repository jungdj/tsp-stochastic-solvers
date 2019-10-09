import { Signale } from 'signale';

const globalOptions = {
  config: {
    displayDate: true,
    displayTimestamp: true,
  },
  scope: 'koa.js',
  stream: process.stdout,
};

const logger = () => {
  const options = {
    ...globalOptions,
    types: {
      santa: {
        badge: '🎅',
        color: 'red',
        label: 'santa',
        logLevel: 'info',
      },
    },
  };

  const log = new Signale(options);
  return log;
};

export default logger();
