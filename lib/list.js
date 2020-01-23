'use strict';
const RegClient = require('npm-registry-client');
const archy = require('archy');

const noop = () => {};
const logger = {
  error: noop,
  warn: noop,
  info: noop,
  verbose: noop,
  silly: noop,
  http: noop,
  pause: noop,
  resume: noop
};

const client = new RegClient({ log: logger });
const uri = 'https://registry.npmjs.org/';
const params = { timeout: 1000 };

function list() {
  client.get(`${uri}/-/v1/search?text=scope:specifications`, params, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    const nodes = res.objects.map(
      o => `${o.package.name.replace('@specifications/', '')}@${o.package.version}`
    );

    console.log(archy({ nodes }));
  });
}

module.exports = {
  command: 'list',
  describe: 'list all specifications',
  handler: list
};
