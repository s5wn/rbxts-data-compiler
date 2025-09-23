export declare const ALLOWED_TAGS: {
    path: string[];
    out: string[];
};
export declare function getTags(): Promise<{
    [key in keyof typeof ALLOWED_TAGS]: string;
}>;
