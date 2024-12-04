module.exports = {
  '{apps,libs,tools}/**/*.{ts,tsx}': (files) => {
    return `nx affected:lint --fix --files=${files.join(',')}`;
  },
};
