import patchedYargs from "./yargs.js";

export const ALLOWED_TAGS = {
	required: {
		path: {
			type: "",
			alias: ["path", "p"]
		},
		out: {
			type: "",
			alias: ["out", "o"]
		},
	},
	optional: {
		name: {
			type: "",
			alias: ["name", "n"]
		},
		const: {
			type: true,
			alias: ["const"]
		},
	},
};


export async function getTags(): Promise<
	{ [key in keyof (typeof ALLOWED_TAGS.required)]: (typeof ALLOWED_TAGS.required)[key]["type"] } & { [key in keyof (typeof ALLOWED_TAGS.optional)]?: (typeof ALLOWED_TAGS.optional)[key]["type"] }
> {
	const patched = await Promise.resolve(patchedYargs.argv);
	const res: {[key:string]:any} = {} as never;
	Object.keys(ALLOWED_TAGS.required).forEach((key) => {
		const aliasData = ALLOWED_TAGS.required[key as keyof typeof ALLOWED_TAGS.required];
		aliasData.alias.forEach((aliasName) => {
			if (
				patched[aliasName] !== undefined &&
				patched[aliasName] !== null &&
				typeof patched[aliasName] === aliasData.type
			)
				res[key] = patched[aliasName];
		});
		if (!res[key]) throw new Error("MISSING TAG " + key + ". RERUN THE SCRIPT WITH IT SPECIFIED");
	});
	Object.keys(ALLOWED_TAGS.optional).forEach((key) => {
		const aliasData = ALLOWED_TAGS.required[key as keyof typeof ALLOWED_TAGS.required];
		aliasData.alias.forEach((aliasName) => {
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
