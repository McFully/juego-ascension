const fs = require('fs');

let content = fs.readFileSync('src/reducers/economyReducer.js', 'utf8');

if (!content.includes('handleVoteDaoProposal')) {
  content = content.replace(
    '  handleFinalizeExchangeProject,\n  handleDispatchSpotArbitrage',
    '  handleFinalizeExchangeProject,\n  handleDispatchSpotArbitrage,\n  handleVoteDaoProposal,\n  handleTradeLonjaShares'
  );

  const newCases = `    case 'VOTE_DAO_PROPOSAL':
      return handleVoteDaoProposal(state, action);
    case 'TRADE_LONJA_SHARES':
      return handleTradeLonjaShares(state, action);
`;

  content = content.replace(
    "    case 'FINALIZE_EXCHANGE_PROJECT':\n      return handleFinalizeExchangeProject(state, action);\n",
    "    case 'FINALIZE_EXCHANGE_PROJECT':\n      return handleFinalizeExchangeProject(state, action);\n" + newCases
  );

  fs.writeFileSync('src/reducers/economyReducer.js', content, 'utf8');
  console.log('economyReducer.js actualizado con VOTE_DAO_PROPOSAL y TRADE_LONJA_SHARES');
}
