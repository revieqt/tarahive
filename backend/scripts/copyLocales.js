const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../src/modules/v2/localization');
const destination = path.join(__dirname, '../dist/modules/v2/localization');

for (const directory of ['locales', 'backend']) {
  const target = path.join(destination, directory);
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(
    path.join(source, directory),
    target,
    { recursive: true },
  );
}
