'use strict';
// @ts-check
const base = require('../../.base-ammanrc.js');

const hydraValidator = {
  programs: [base.programs.metadata, base.programs.hydra,   {
    label: 'Clockwork',
    programId: '3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv',
    deployPath: '../../../clockwork/target/deploy/clockwork_thread_program.so',
  }],
  commitment: 'confirmed',
  verifyFees: false,
};

const validator = {
  hydraValidator,
  programs: [base.programs.metadata, base.programs.hydra,   {
    label: 'Clockwork',
    programId: '3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv',
    deployPath: '../../../clockwork/target/deploy/clockwork_thread_program.so',
  }],
};
module.exports = { validator };
