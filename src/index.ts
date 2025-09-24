import { createWriteStream, glob, promises, writeFile, writeFileSync } from "fs";
import { getTags } from "./alias-map.js";
import { ALLOWED_EXTENSIONS, ConvertFile, FILE_EXTENSION_REGEXP, tryFileExtension } from "./convert-to-json.js";
import { resolve } from "path";
await getTags().then(async (val) => {
	console.log(val,"VALUE")
	const in_dir = resolve(val.path),
		out_dir = resolve(val.out),
        file_name = val.name ?? "GENERATED_JSON_DATA"

	const fileData: { [key: string]: object } = {};

	glob(
		ALLOWED_EXTENSIONS.map((v) => in_dir + "/**/*." + v),
		async (err, files) => {
			const total: Promise<void>[] = [];
			files
				.filter((v) => tryFileExtension(v))
				.forEach((fileName) => {
					total.push(
						Promise.try(async () => {
							{
								const data = await ConvertFile(fileName);
								const relative = fileName.slice(in_dir.length);
								let p: typeof fileData = fileData;
								relative.split("/").forEach((v, i, arr) => {
									if (v === "") return;
									if (i === arr.length - 1) {
										p[v.replace(FILE_EXTENSION_REGEXP,"")] = data as never;
                                      //  console.log("SET", fileData);
										return;
									}
									p[v] ??= {};
									p = p[v] as never;
								});
							}
						}).catch((r)=>console.log("FAILED TO PARSE FILE: " + r)),
					);
				});

			await Promise.allSettled(total).then(async () => {
				//console.warn("DOING THIS EVIL THANG");

                //JSON.stringify(fileData)
				promises.writeFile(out_dir + `/${file_name.toLowerCase()}.ts`,`export const ${file_name.toUpperCase()} = ${JSON.stringify(fileData)} as const`);

			});
		},
	);
});
