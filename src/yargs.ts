#!/usr/bin/env node

import yargs = require("yargs");
const patchedYargs = yargs(process.argv);
export default patchedYargs;
