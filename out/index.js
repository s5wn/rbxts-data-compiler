import { createWriteStream, glob, promises, writeFile, writeFileSync } from "fs";
import { getTags } from "./alias-map.js";
import { ALLOWED_EXTENSIONS, ConvertFile, FILE_EXTENSION_REGEXP, tryFileExtension } from "./convert-to-json.js";
await getTags().then(async (val) => {
    const path = val.path, out = val.out;
    const fileData = {};
    glob(ALLOWED_EXTENSIONS.map((v) => path + "/**/*." + v), async (err, files) => {
        const total = [];
        files
            .filter((v) => tryFileExtension(v))
            .forEach((fileName) => {
            total.push(Promise.try(async () => {
                {
                    const data = await ConvertFile(fileName);
                    const relative = fileName.slice(path.length);
                    let p = fileData;
                    relative.split("/").forEach((v, i, arr) => {
                        if (v === "")
                            return;
                        if (i === arr.length - 1) {
                            p[v.replace(FILE_EXTENSION_REGEXP, "")] = data;
                            //  console.log("SET", fileData);
                            return;
                        }
                        p[v] ??= {};
                        p = p[v];
                    });
                }
            }).catch((r) => console.log("LOL, FAILED TO PARSE: " + r)));
        });
        await Promise.allSettled(total).then(async () => {
            //console.warn("DOING THIS EVIL THANG");
            //JSON.stringify(fileData)
            promises.writeFile(out + "/data.ts", "export const data = " + JSON.stringify(fileData) + "as const");
        });
    });
});
