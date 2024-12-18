const fs = require('fs');
const path = require('path');

// Get the new version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('No version provided');
  process.exit(1);
}

// List of package.json files to update
const packagePaths = [
  'packages/toolkit/package.json',
  'packages/apps/package.json',
  'package.json',
];

// Update each package.json
packagePaths.forEach((packagePath) => {
  const fullPath = path.join(__dirname, '..', packagePath);

  try {
    // Read the package.json
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    // Update the version
    packageJson.version = newVersion;

    // If this is the root package.json, update the dependencies
    // This is a hack to get the @lecca-io packages to always be the same version as the root package
    if (packagePath === 'package.json') {
      if (packageJson.pnpm && packageJson.pnpm.overrides) {
        if (packageJson.pnpm.overrides['@lecca-io/toolkit']) {
          packageJson.pnpm.overrides['@lecca-io/toolkit'] = newVersion;
        }
        if (packageJson.pnpm.overrides['@lecca-io/apps']) {
          packageJson.pnpm.overrides['@lecca-io/apps'] = newVersion;
        }
      }
    }

    // Write back to file
    fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.info(`Updated ${packagePath} to version ${newVersion}`);
  } catch (error) {
    console.error(`Error updating ${packagePath}:`, error);
    process.exit(1);
  }
});
