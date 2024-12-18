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
      if (packageJson.dependencies) {

          //Not using newVersion because this script runs before the new version is published
          //So during the publish step -> pnpm install, it would fail because the version didn't exist.
          //If we do latest, then it will always get the latest version at the time the
          //docker containers are created. So even though this is fragile, the docker images
          //and all the packages will always be in sync. 

        if (packageJson.dependencies['@lecca-io/toolkit']) {
          packageJson.dependencies['@lecca-io/toolkit'] = "latest" //newVersion;
        }
        if (packageJson.dependencies['@lecca-io/apps']) {
          packageJson.dependencies['@lecca-io/apps'] = "latest" //newVersion;
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
