#!/usr/bin/env node
import { createWriteStream, glob, promises, writeFile, writeFileSync } from "fs";
import { ALLOWED_EXTENSIONS, ConvertFile, FILE_EXTENSION_REGEXP, tryFileExtension } from "./convert-to-json.js";
import path, { resolve } from "path";
import patchedYargs from "./yargs.js";
import { generateTypes } from "./type-gen.js";
import { warn } from "console";

export type RecursiveObject = {[key:string]: RecursiveObject};

const argv = await Promise.resolve(patchedYargs.argv);

	const in_dir = resolve((argv.p ?? argv.path) as string),
		out_dir = resolve((argv.o ?? argv.out) as string),
        file_name = (argv.name ?? argv.n ?? "GENERATED_JSON_DATA") as string
	
	
	const globMap = ALLOWED_EXTENSIONS.map((v) => path.join(in_dir, "/**/*." + v));
	warn("globmap",globMap)
	const typeArg = (argv.t ?? argv.types) as string | undefined;

	const fileData: RecursiveObject = {};

	glob(
		globMap,
		async (err, files) => {
			const total: Promise<void>[] = [];
			files
				.filter((v) => tryFileExtension(v))
				.forEach((fileName) => {
					total.push(
						Promise.try(async () => {
							{
								const data = await ConvertFile(fileName);
								const relative = path.relative(in_dir,resolve(fileName))
								let p: RecursiveObject = fileData;
								console.warn("ITER: ", relative.replace(FILE_EXTENSION_REGEXP,"").split(path.sep))
								relative.replace(FILE_EXTENSION_REGEXP,"").split(path.sep).forEach((v, i, arr) => {
									if (v === "") return;
									if (i === arr.length - 1) {
										warn("FILE NAME: ",path.parse(relative).name)
										p[path.parse(relative).name] = data as never;
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
				const typeMap = typeArg!==undefined ? await generateTypes(fileData,typeArg) : undefined;
				const result = JSON.stringify(fileData,null,4)
				await promises.writeFile(out_dir + `/${file_name.toLowerCase()}.ts`,`
				${typeMap!==undefined ? `export type ${"T"+file_name.toUpperCase()} = ${typeMap}` : ""}
				export const ${file_name.toUpperCase()} = ${result} ${argv["const"] ? "as const": ""} ${typeMap!==undefined ? `satisfies ${"T"+file_name.toUpperCase()}` : ""};`);
				console.log("DATA SAVED TO FILE -> " + out_dir + `/${file_name.toLowerCase()}.ts`);
			});
		},
	);