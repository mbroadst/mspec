'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdirp = util.promisify(require('mkdirp'));
const pacote = require('pacote');

const kLockFile = 'spec.lock';

const prefix = spec => `@specifications/${spec}`;
async function install(argv) {
  console.dir({ argv });

  if (argv.spec) {
    installSpecification(argv.spec);
    return;
  }

  console.log('installing from spec.lock...');
}

async function installSpecification(specName) {
  try {
    // verify package exists
    const manifest = await pacote.manifest(prefix(specName));
    console.dir({ manifest }, { depth: 3 });

    const specPath = path.join(process.cwd(), specName);
    await mkdirp(specPath);
    const result = await pacote.extract(prefix(specName), specPath);

    console.log('for package lock:');
    const lockEntry = {
      version: manifest.version,
      resolved: result.resolved,
      integrity: result.integrity
    };

    updateLockFileWithSpec(specName, lockEntry, err => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`wrote spec lock`);
    });
  } catch (err) {
    console.error(err);
  }
}

function updateLockFileWithSpec(specName, spec, callback) {
  const lockPath = path.resolve(process.cwd(), kLockFile);
  fs.readFile(lockPath, (err, data) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        callback(err);
        return;
      }
    }

    // try reading existing data
    let lockData = {};
    try {
      lockData = JSON.parse(data);
    } catch (err) {
      // TODO: manifest is corrupt, do something here
    }

    // record this spec in the lockfile
    lockData[specName] = spec;

    let output;
    try {
      output = JSON.stringify(lockData, null, 2);
    } catch (err) {
      // TODO: stringification failed, do something here
      callback(err);
      return;
    }

    fs.writeFile(lockPath, output, { flag: 'w+' }, err => {
      if (err) {
        callback(err);
        return;
      }

      callback();
    });
  });
}

module.exports = {
  command: 'install [spec]',
  describe: 'install a specification',
  builder: {},
  handler: install
};
