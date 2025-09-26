#!/usr/bin/env node
import { createWriteStream, glob, promises, writeFile, writeFileSync } from "fs";
import { ALLOWED_EXTENSIONS, ConvertFile, FILE_EXTENSION_REGEXP, tryFileExtension } from "./convert-to-json.js";
import path, { resolve } from "path";
import patchedYargs from "./yargs.js";

type RecursiveObject = {[key:string]: RecursiveObject};

const argv = await Promise.resolve(patchedYargs.argv);

	const in_dir = resolve((argv.p ?? argv.path) as string),
		out_dir = resolve((argv.o ?? argv.out) as string),
        file_name = (argv.name ?? argv.n ?? "GENERATED_JSON_DATA") as string


	const fileData: RecursiveObject = {};

	glob(
		ALLOWED_EXTENSIONS.map((v) => path.join(in_dir, "/**/*." , v)),
		async (err, files) => {
			const total: Promise<void>[] = [];
			files
				.filter((v) => tryFileExtension(v))
				.forEach((fileName) => {
					total.push(
						Promise.try(async () => {
							{
								const data = await ConvertFile(fileName);
								const relative = path.relative(fileName,in_dir)
								let p: RecursiveObject = fileData;
								relative.replace(FILE_EXTENSION_REGEXP,"").split(path.sep).forEach((v, i, arr) => {
									if (v === "") return;
									if (i === arr.length - 1) {
										p[v.replace(FILE_EXTENSION_REGEXP,"")] = data as never;
										return;
									}
									p[v] ??= {};
									p = p[v];
								});
							}
						}).catch((r)=>console.log("FAILED TO PARSE FILE: " + r)),
					);
				});

			await Promise.allSettled(total).then(async () => {
				promises.writeFile(out_dir + `/${file_name.toLowerCase()}.ts`,`export const ${file_name.toUpperCase()} = ${JSON.stringify(fileData)} ${argv["const"] ? "as const": ""};`);
				console.log("DATA SAVED TO FILE -> " + out_dir + `/${file_name.toLowerCase()}.ts`);
			});
		},
	);