const net = require('net');
const chalk = require('chalk');
const execa = require('execa');

exports.isPackageValid = (package) => {
  try {
    require.resolve(package);
    return true;
  } catch (error) {
    return false;
  }
}

exports.hasTsNode = () => {
  return exports.isPackageValid('ts-node/dist/bin');
};

exports.isDev = function isDev() {
  if (process.env.NOCOBASE_ENV === 'production') {
    return false;
  }
  return exports.hasTsNode();
};

exports.nodeCheck = () => {
  if (!exports.hasTsNode()) {
    console.log('Please install all dependencies');
    console.log(chalk.yellow('$ yarn install'));
    process.exit(0);
  }
};

exports.run = (command, argv, options = {}) => {
  return execa(command, argv, {
    shell: true,
    stdio: 'inherit',
    ...options,
    env: {
      ...process.env,
      ...options.env,
    },
  });
};

exports.isPortReachable = async (port, { timeout = 1000, host } = {}) => {
  const promise = new Promise((resolve, reject) => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      reject();
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });

  try {
    await promise;
    return true;
  } catch (_) {
    return false;
  }
};

exports.postCheck = async (opts) => {
  const port = opts.port || process.env.SERVER_PORT;
  const result = await exports.isPortReachable(port);
  if (result) {
    console.error(chalk.red(`post already in use ${port}`));
    process.exit(1);
  }
};
