import { glob } from "fs/promises";
import type { RecursiveObject } from "./index.js";
import { promises } from "fs";

export async function generateTypes(file:RecursiveObject, typeFile: string): Promise<string> {
    const typeData = (await promises.readFile(typeFile)).toString().trim();
    console.log("TYPE DATA: ",typeData)
    return "";
}