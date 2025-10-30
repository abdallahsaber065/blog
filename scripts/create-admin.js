const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'abdallahsaber065@gmail.com' }
        });

        if (existingUser) {
            console.log('❌ User with email abdallahsaber065@gmail.com already exists!');
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
        const hashedPassword = await bcrypt.hash('admin123', 10); // Change this password!

        const adminUser = await prisma.user.create({
            data: {
                username: 'abdallahsaber065',
                email: 'abdallahsaber065@gmail.com',
                password: hashedPassword,
                first_name: 'Abdallah',
                last_name: 'Saber',
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
        console.log('🔑 Default password: admin123 (Please change this after first login!)');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createAdminUser();