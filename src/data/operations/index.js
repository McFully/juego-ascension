import { operationsResources } from './operationsResources.js';
import { operationsScience } from './operationsScience.js';
import { operationsLogistics } from './operationsLogistics.js';
import { operationsInfra } from './operationsInfra.js';
import { operationsCivics } from './operationsCivics.js';
import { operationsEnergy } from './operationsEnergy.js';
import { operationsDefense } from './operationsDefense.js';

export const EXPANDED_BUILDING_OPERATIONS = {
  ...operationsResources,
  ...operationsScience,
  ...operationsLogistics,
  ...operationsInfra,
  ...operationsCivics,
  ...operationsEnergy,
  ...operationsDefense
};
