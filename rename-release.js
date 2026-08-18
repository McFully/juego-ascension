import { renameSync, readFileSync } from 'fs';
const { version } = JSON.parse(readFileSync('package.json'));
try { renameSync('release/win-unpacked/Ascension.exe', `release/win-unpacked/ascension-v${version}.exe`); } catch {}
try { renameSync(`release/Ascension Setup ${version}.exe`, `release/ascension-v${version}-Setup.exe`); } catch {}
