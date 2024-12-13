const fs = require('fs');
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_, __, version] = process.argv;

if (!version) {
  console.error('Version argument is missing');
  process.exit(1);
}

const toolkitPackageJsonPath = path.join(
  __dirname,
  'packages/toolkit/package.json',
);

try {
  const packageJson = JSON.parse(
    fs.readFileSync(toolkitPackageJsonPath, 'utf-8'),
  );
  packageJson.version = version;
  fs.writeFileSync(
    toolkitPackageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );
  console.info(`Toolkit package.json updated to version: ${version}`);
} catch (error) {
  console.error('Failed to update toolkit package.json', error);
  process.exit(1);
}
