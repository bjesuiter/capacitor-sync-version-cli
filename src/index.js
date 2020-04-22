#!/usr/bin/env node

// This is a hack from the esm package enables es module loading for all other imports in cli.js
// eslint-disable-next-line no-global-assign
require = require('esm')(module);
module.exports = require('./cli.js');
