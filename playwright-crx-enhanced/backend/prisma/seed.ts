import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample script
  const script = await prisma.script.create({
    data: {
      userId: user.id,
      name: 'Sample Login Test',
      description: 'Example automated login test',
      language: 'typescript',
      code: `import { test, expect } from '@playwright/test';

test('login test', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://example.com/dashboard');
});`,
      browserType: 'chromium',
      selfHealingEnabled: true,
    },
  });

  console.log('✅ Created sample script:', script.name);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
