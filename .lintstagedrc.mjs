/**
 * Monorepo lint-staged config.
 * Function form is used so the command runs the full linter
 * for the respective package, regardless of which specific
 * files were staged (needed because ESLint configs live in each sub-package).
 */
export default {
  "client/src/**/*.{ts,tsx}": () => "yarn workspace client lint:fix",
  "server/src/**/*.ts": () => "yarn workspace server lint:fix",
};
