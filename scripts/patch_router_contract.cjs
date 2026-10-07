const fs = require('fs');

let content = fs.readFileSync('src/__tests__/routerContract.test.js', 'utf8');
content = content.replace("'espionage_alert'", "'espionage_alert', 'FOUNDING_PARTNER'");
fs.writeFileSync('src/__tests__/routerContract.test.js', content, 'utf8');
console.log('routerContract.test.js actualizado');
