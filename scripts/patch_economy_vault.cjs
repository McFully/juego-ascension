const fs = require('fs');

let content = fs.readFileSync('src/reducers/economyReducer.js', 'utf8');

if (!content.includes('handleDepositToVault')) {
  content = content.replace(
    '  handleVoteDaoProposal,\n  handleTradeLonjaShares',
    '  handleVoteDaoProposal,\n  handleTradeLonjaShares,\n  handleDepositToVault,\n  handleContractFreight'
  );

  const newCases = `    case 'DEPOSIT_TO_VAULT':
      return handleDepositToVault(state, action);
    case 'CONTRACT_FREIGHT':
      return handleContractFreight(state, action);
`;

  content = content.replace(
    "    case 'TRADE_LONJA_SHARES':\n      return handleTradeLonjaShares(state, action);\n",
    "    case 'TRADE_LONJA_SHARES':\n      return handleTradeLonjaShares(state, action);\n" + newCases
  );

  fs.writeFileSync('src/reducers/economyReducer.js', content, 'utf8');
  console.log('economyReducer.js actualizado con DEPOSIT_TO_VAULT y CONTRACT_FREIGHT');
}
