const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@admin.com' },
      data: { isAdmin: true }
    });
    console.log('User made admin:', user.email, 'isAdmin:', user.isAdmin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
