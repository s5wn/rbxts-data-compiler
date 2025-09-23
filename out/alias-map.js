import patchedYargs from "./yargs.js";
export const ALLOWED_TAGS = {
    ["path"]: ["path", "p"],
    ["out"]: ["out", "o"],
};
export async function getTags() {
    const patched = await Promise.resolve(patchedYargs.argv);
    const res = {};
    Object.keys(ALLOWED_TAGS).forEach((key) => {
        const aliases = ALLOWED_TAGS[key];
        aliases.forEach((aliasName) => {
            if (patched[aliasName] !== undefined &&
                patched[aliasName] !== null &&
                typeof patched[aliasName] === "string")
                res[key] = patched[aliasName];
        });
        if (!res[key])
            throw new Error("MISSING TAG " + key + ". RERUN THE SCRIPT WITH IT SPECIFIED");
    });
    return res;
}
