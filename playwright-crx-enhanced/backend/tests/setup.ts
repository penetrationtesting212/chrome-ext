import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Clean up existing test data
    await prisma.$transaction([
      prisma.testDataRow.deleteMany(),
      prisma.testDataFile.deleteMany(),
      prisma.selfHealingLocator.deleteMany(),
      prisma.locatorStrategy.deleteMany(),
      prisma.variable.deleteMany(),
      prisma.breakpoint.deleteMany(),
      prisma.testStep.deleteMany(),
      prisma.testRun.deleteMany(),
      prisma.script.deleteMany(),
      prisma.project.deleteMany(),
      prisma.extensionScript.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.user.deleteMany()
    ]);
    
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});