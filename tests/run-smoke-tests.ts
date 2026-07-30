import { runApiSmoke } from './automation/api-smoke';
import { runUiSmoke } from './automation/ui-smoke';

async function main() {
  await runApiSmoke();
  await runUiSmoke();
  console.log('All smoke tests passed');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});