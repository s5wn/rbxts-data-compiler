import { glob } from "fs/promises";
import type { RecursiveObject } from "./index.js";
import { promises } from "fs";

type StringObject = {[key:string]: string};

function getClosingBracket(s:string): [number,number] {
  let closeIndex = -1;
  let initial = -1;
  let counter = 0;
  const stack = [];
  const whitelisted = ["}","{"];
  const lookup: {[key:string]:string|undefined} = {"}":"{"};

  for (let c of s) {
    if (lookup[c]) {
      if (stack.length > 0 && stack[stack.length - 1] === lookup[c]) {
        stack.pop();
        if (stack.length===0) closeIndex = counter;
      } else {
        return [-1,-1];
      }
    } else if (whitelisted.includes(c)) {
      if (stack.length===0) initial = counter;
      stack.push(c);
    }
    counter++;
  }
  return [initial,closeIndex];
}
export async function generateTypes(file:RecursiveObject, typeFile: string): Promise<string> {
    let toReturn = "{\n" 
    const typeData = (await promises.readFile(typeFile)).toString().trim();
    function getType(index:string) {
        const exp = new RegExp(String.raw`\s${index}\s`,"m")
        const hasMatch = typeData.match(exp);
        if (!hasMatch) return `${index}: any; \n`;
        const firstIndex = hasMatch[0];
        const upperBound = (hasMatch.index!+firstIndex.length);
        const indexStart = typeData.substring(upperBound+1).trim().search("{");
        if (indexStart===-1) return `${index}: any; \n`;
        const iterStr = typeData.substring(indexStart);
        const [lower,upper] = getClosingBracket(iterStr);
        if (lower>-1) {
            return `${index}: ${typeData.substring(lower,upper+1)}; \n`; 
        }
        return `${index}: any; \n`;
    }
    Object.keys(file).forEach((index)=>{
        toReturn += getType(index);
    })
    return toReturn + "}";
}