/**
 * @type {import("lint-staged").Config}
 */
export default {
  'src/**/*.{js,ts,md}': ['prettier --check'],
};
