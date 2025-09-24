import patchedYargs from "./yargs.js";

export const ALLOWED_TAGS = {
	required: {
		path: ["path", "p"],
		out: ["out", "o"],
	},
	optional: {
		name: ["name", "n"],
		const: ["const"]
	},
};

export async function getTags(): Promise<
	{ [key in keyof (typeof ALLOWED_TAGS)["required"]]: string } &{ [key in keyof (typeof ALLOWED_TAGS)["optional"]]?: string }
> {
	const patched = await Promise.resolve(patchedYargs.argv);
	const res: { [key: string]: string } = {};
	Object.keys(ALLOWED_TAGS.required).forEach((key) => {
		const aliases = ALLOWED_TAGS.required[key as keyof typeof ALLOWED_TAGS.required];
		aliases.forEach((aliasName) => {
			if (
				patched[aliasName] !== undefined &&
				patched[aliasName] !== null &&
				typeof patched[aliasName] === "string"
			)
				res[key] = patched[aliasName];
		});
		if (!res[key]) throw new Error("MISSING TAG " + key + ". RERUN THE SCRIPT WITH IT SPECIFIED");
	});
	Object.keys(ALLOWED_TAGS.optional).forEach((key) => {
		const aliases = ALLOWED_TAGS.optional[key as keyof typeof ALLOWED_TAGS.optional];
		aliases.forEach((aliasName) => {
			if (
				patched[aliasName] !== undefined &&
				patched[aliasName] !== null &&
				typeof patched[aliasName] === "string"
			)
				res[key] = patched[aliasName];
		});
	});
	return res as never;
}
