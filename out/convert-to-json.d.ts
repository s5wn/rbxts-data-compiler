export declare const ALLOWED_EXTENSIONS: readonly ["toml", "yaml", "json", "yml"];
export declare const FILE_EXTENSION_REGEXP: RegExp;
export declare function ConvertFile(path: string): Promise<any>;
export declare function tryFileExtension(path: string): boolean;
export declare function getFileExtension(path: string): (typeof ALLOWED_EXTENSIONS)[number];
