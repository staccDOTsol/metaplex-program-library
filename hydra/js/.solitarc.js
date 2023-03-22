// @ts-check
const path = require('path');
const programDir = path.join(__dirname, '..', 'program');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'hydra',
  programId: 'JARe5SbGC4dtrAchwcNSnzTdN4MHxGR3moMNmWEVg7hp',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
  typeAliases: {
    UnixTimestamp: 'i64',
  },
};
