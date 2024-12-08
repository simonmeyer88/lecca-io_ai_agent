module.exports = {
  '{packages,apps,libs,tools}/**/*.{ts,tsx}': (files) => [
    `nx affected:lint --fix --max-warnings=0 --files=${files.join(',')}`,
    `nx format:write --files=${files.join(',')}`,
  ],
};
