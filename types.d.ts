export type PackageAccess = 'public' | 'restricted' | string;

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | string;

export interface Config {
    /**
     * Keep only main section of `README.md`
     * @default false
     */
    cleanDocs?: boolean;

    /**
     * Clean inline comments from JS files.
     * @default false
     */
    cleanComments?: boolean;

    /**
     * List of files that you want to delete before publishing (supports regex and glob patterns).
     */
    files?: Array<string | RegExp>;

    /**
     * List of fields in the `package.json` file that you want to delete before publishing.
     */
    fields?: string[];

    /**
     * Clean project without `npm publish` (tmp directory will not be deleted automatically).
     * @default false
     */
    withoutPublish?: boolean;

    /**
     * Name of package manager to use.
     * @default "npm"
     */
    packageManager?: PackageManager;

    /**
     * Whether the npm registry publishes this package as a public package, or restricted.
     */
    access?: PackageAccess;

    /**
     * Create temporary directory with given name.
     */
    tempDir?: string;

    /**
     * Options which are directly passed into package manager during publish.
     */
    packageManagerOptions?: string[];

    /**
     * Reports the details of what would have been published.
     */
    dryRun?: boolean;

    /**
     * Registers the package with the given tag.
     */
    tag?: string[];

    /**
     * Run script on the to-release dir before npm publish.
     */
    beforeScript?: string;
}