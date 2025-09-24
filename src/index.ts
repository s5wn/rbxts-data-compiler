import { createWriteStream, glob, promises, writeFile, writeFileSync } from "fs";
import { getTags } from "./alias-map.js";
import { ALLOWED_EXTENSIONS, ConvertFile, FILE_EXTENSION_REGEXP, tryFileExtension } from "./convert-to-json.js";

await getTags().then(async (val) => {
	console.log(val,"VALUE")
	const path = val.path,
		out = val.out,
        name = val.name ?? "GENERATED_JSON_DATA"

	const fileData: { [key: string]: object } = {};

	glob(
		ALLOWED_EXTENSIONS.map((v) => path + "/**/*." + v),
		async (err, files) => {
			const total: Promise<void>[] = [];
			files
				.filter((v) => tryFileExtension(v))
				.forEach((fileName) => {
					total.push(
						Promise.try(async () => {
							{
								const data = await ConvertFile(fileName);
								const relative = fileName.slice(path.length);
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
				promises.writeFile(out + `/${name.toLowerCase()}.ts`,`export const ${name.toUpperCase()} = ${JSON.stringify(fileData)} as const`);

			});
		},
	);
});
