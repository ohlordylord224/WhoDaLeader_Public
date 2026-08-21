// One-off verification script: prints owners and deal pipeline stages.
// Run with: npx tsx scripts/verify-hubspot.ts
import 'dotenv/config'
import { credentials } from '../server/utils/credentials'
import { getOwners, getDealStages } from '../server/utils/hubspot'

async function main() {
  console.log('\n── Owners ──────────────────────────────')
  const owners = await getOwners(credentials)
  if (owners.size === 0) {
    console.log('  (none returned)')
  } else {
    for (const [id, name] of [...owners.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
      console.log(`  ${id.padEnd(12)} ${name}`)
    }
  }

  console.log('\n── Deal pipeline stages ────────────────')
  const stages = await getDealStages(credentials)
  if (stages.length === 0) {
    console.log('  (none returned)')
  } else {
    let lastPipeline = ''
    for (const s of stages) {
      if (s.pipelineLabel !== lastPipeline) {
        console.log(`\n  Pipeline: ${s.pipelineLabel} (${s.pipelineId})`)
        lastPipeline = s.pipelineLabel
      }
      console.log(`    stageId=${s.stageId.padEnd(20)} label="${s.stageLabel}"`)
    }
  }
  console.log()
}

main().catch(err => { console.error(err); process.exit(1) })
