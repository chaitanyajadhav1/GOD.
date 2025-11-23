/**
 * Script to create the first Super Admin user
 * 
 * Usage:
 *   npx tsx scripts/create-super-admin.ts <email> <password> <mobile_number>
 * 
 * Example:
 *   npx tsx scripts/create-super-admin.ts admin@example.com SecurePass123! +919876543210
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('❌ Usage: npx tsx scripts/create-super-admin.ts <email> <password> <mobile_number>');
    console.error('   Example: npx tsx scripts/create-super-admin.ts admin@example.com SecurePass123! +919876543210');
    process.exit(1);
  }

  const [email, password, mobileNumber] = args;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }

  // Validate password
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  // Validate mobile number (should be 10 digits or +91 format)
  const mobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const cleanedMobile = mobileNumber.replace(/[\s\-()]/g, '');
  if (!mobileRegex.test(cleanedMobile)) {
    console.error('❌ Invalid mobile number format. Must be 10 digits starting with 6-9');
    process.exit(1);
  }

  // Normalize mobile number
  const normalizedMobile = cleanedMobile.startsWith('+91') 
    ? cleanedMobile 
    : cleanedMobile.startsWith('91') && cleanedMobile.length === 12
    ? '+' + cleanedMobile
    : '+91' + cleanedMobile;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mobile_number: normalizedMobile }
        ]
      }
    });

    if (existingUser) {
      console.error(`❌ User already exists with ${existingUser.email === email ? 'email' : 'mobile number'}`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        mobile_number: normalizedMobile,
        password_hash: passwordHash,
        user_type: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    // Create profile
    await prisma.profile.create({
      data: {
        user_id: superAdmin.id,
        first_name: 'Super',
        last_name: 'Admin',
        profile_type: 'ADMIN',
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Mobile: ${normalizedMobile}`);
    console.log(`   User ID: ${superAdmin.id}`);
    console.log('\n📝 You can now login using email and password on the login page.');

  } catch (error: any) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.code === 'P2002') {
      console.error('   Duplicate entry. User with this email or mobile number already exists.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

