import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTestRuns() {
  const runs = await prisma.testRun.findMany({
    take: 5,
    orderBy: { startedAt: 'desc' },
    include: {
      script: {
        select: { name: true }
      }
    }
  });

  console.log('\n=== TEST RUNS IN DATABASE ===\n');
  console.log(`Total test runs found: ${runs.length}\n`);

  runs.forEach((run, index) => {
    console.log(`${index + 1}. Test Run ID: ${run.id}`);
    console.log(`   Script: ${run.script.name}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Allure Report URL: ${run.allureReportUrl || 'NOT SET'}`);
    console.log(`   Started: ${run.startedAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkTestRuns().catch(console.error);
