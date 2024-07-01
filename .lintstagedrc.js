/**
 * @type {import("lint-staged").Config}
 */
export default {
  'src/**/*.{js,ts,md}': ['biome check --write --no-errors-on-unmatched'],
};
