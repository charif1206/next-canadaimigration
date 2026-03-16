const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'hamza';
  const plainPassword = 'password123';

  console.log(`Checking if admin '${username}' exists...`);
  
  const existingAdmin = await prisma.admin.findUnique({
    where: { username }
  });

  if (existingAdmin) {
    console.log(`Admin '${username}' already exists. Skipping creation.`);
    return;
  }

  console.log(`Hashing password...`);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log(`Creating admin '${username}'...`);
  const admin = await prisma.admin.create({
    data: {
      username: username,
      email: `${username}@admin.com`, // Adding an email based on username
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true // Set to true so you don't need to verify via email
    }
  });

  console.log(`\n✅ Success! Admin account created.`);
  console.log(`---------------------------------`);
  console.log(`Username: ${admin.username}`);
  console.log(`Password: ${plainPassword}`);
  console.log(`Email:    ${admin.email}`);
  console.log(`---------------------------------`);
}

main()
  .catch((e) => {
    console.error('An error occurred:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });