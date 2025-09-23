import fs from "node:fs";
import toml from "toml";
import yaml from "yaml";
export const ALLOWED_EXTENSIONS = ["toml", "yaml", "json", "yml"];
export const FILE_EXTENSION_REGEXP = /(?:\.([^.]+))?$/;
export async function ConvertFile(path) {
    const fileExt = getFileExtension(path);
    let result;
    const data = (await fs.promises.readFile(path)).toString();
    switch (fileExt) {
        case "toml":
            result = toml.parse(data);
            break;
        case "yaml":
        case "yml":
            result = yaml.parse(data);
            break;
        case "json":
            result = JSON.parse(data);
            break;
    }
    if (!result)
        throw new Error("FAILED TO PARSE FILE");
    console.warn(result, " \n \n \n \n PARSED \n ", path);
    return result; // json data
}
export function tryFileExtension(path) {
    const result = FILE_EXTENSION_REGEXP.exec(path)?.[1];
    return result !== undefined && ALLOWED_EXTENSIONS.includes(result);
}
export function getFileExtension(path) {
    if (!tryFileExtension(path))
        throw new Error("BLACKLISTED FILE EXTENSION AT " +
            path +
            ". PROGRAM ONLY SUPPORTS " +
            ALLOWED_EXTENSIONS.join(",") +
            " FILES");
    return FILE_EXTENSION_REGEXP.exec(path)?.[1];
}
