import { glob } from "fs/promises";

export async function generateTypes(globs: string[], typesPath: string): Promise<string> {
    for await(const entry of glob(globs)) {

    }
    return "";
}