// @ts-check
const path = require('path');
const programDir = path.join(__dirname, '..', 'program');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'hydra',
  programId: '5G76ijPLinxx8tZai4hYkhoBkb2QidrX9BuJiEpuJhs7',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
  typeAliases: {
    UnixTimestamp: 'i64',
  },
};
