import { glob } from "fs/promises";
import type { RecursiveObject } from "./index.js";
import { promises } from "fs";

type StringObject = {[key:string]: string};

export async function generateTypes(file:RecursiveObject, typeFile: string): Promise<string> {
    let toReturn = "{\n" 
    const typeData = (await promises.readFile(typeFile)).toString().trim();
    function getType(index:string) {
        const exp = new RegExp(String.raw`\s${index}\s`,"m")
        const hasMatch = typeData.match(exp);
        if (!hasMatch) return "any";
        const firstIndex = hasMatch[0];
        const upperBound = (hasMatch.index!+firstIndex.length);
        const substr = typeData.substring(upperBound);
        const exp2 = /{([^}]*)}/;
        const returnVal = substr.match(exp2)
        return `${index}: ${returnVal?.[0] ?? "any"} \n`; 
    }
    Object.keys(file).forEach((index)=>{
        toReturn += getType(index);
    })
    return toReturn + "}";
}