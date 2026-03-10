import { startCron as startEsReindex } from './es-reindex/index';
import { startCron as startUserSync } from './user-sync/index';

startEsReindex();
startUserSync();

console.log('[batch] All jobs scheduled.');
