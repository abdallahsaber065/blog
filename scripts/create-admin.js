const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createAdminUser() {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
    const adminFirstName = (process.env.ADMIN_FIRST_NAME || 'Admin').trim();
    const adminLastName = (process.env.ADMIN_LAST_NAME || 'User').trim();

    if (!adminEmail || !adminPassword) {
        console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            console.log(`❌ User with email ${adminEmail} already exists!`);
            console.log('User details:', {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
                created_at: existingUser.created_at
            });
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const adminUser = await prisma.user.create({
            data: {
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                first_name: adminFirstName,
                last_name: adminLastName,
                role: 'admin',
                email_verified: true,
                bio: 'Admin user - Blog owner and developer'
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('User details:', {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role,
            created_at: adminUser.created_at
        });

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createAdminUser();