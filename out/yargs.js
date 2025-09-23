#!/usr/bin/env node
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const yargs = __require("yargs");
const patchedYargs = yargs(process.argv);
export default patchedYargs;
