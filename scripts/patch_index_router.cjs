const fs = require('fs');

let content = fs.readFileSync('src/reducers/index.js', 'utf8');

const targetStr = `    case 'FINALIZE_EXCHANGE_PROJECT':
    case 'ESTABLISH_BILATERAL_ROUTE':`;

const replacementStr = `    case 'FINALIZE_EXCHANGE_PROJECT':
    case 'VOTE_DAO_PROPOSAL':
    case 'TRADE_LONJA_SHARES':
    case 'DEPOSIT_TO_VAULT':
    case 'CONTRACT_FREIGHT':
    case 'ESTABLISH_BILATERAL_ROUTE':`;

const norm = content.replace(/\r\n/g, '\n');
if (norm.includes(targetStr)) {
  const newNorm = norm.replace(targetStr, replacementStr);
  fs.writeFileSync('src/reducers/index.js', newNorm.replace(/\n/g, '\r\n'), 'utf8');
  console.log('src/reducers/index.js enrutado con acciones de Lonja.');
} else {
  console.log('targetStr no encontrado en index.js');
}
