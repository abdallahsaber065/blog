# Scripts

This directory contains utility scripts for the blog application.

## create-admin.js / create-admin.ts

Creates an admin user with the following details:

- **Username**: abdallahsaber065
- **Email**: <abdallahsaber065@gmail.com>
- **Role**: admin
- **Default Password**: admin123

### Usage

1. Make sure your database is running and `.env` file is configured
2. Run the script:

```bash
npm run create-admin
```

Or run directly:

```bash
node scripts/create-admin.js
```

### Important Notes

- The script will check if the user already exists before creating
- **IMPORTANT**: Change the default password `admin123` after first login!
- The user will be created with `email_verified: true` so you can login immediately
- If the user already exists, the script will show the existing user details

### Security

- The password is hashed using bcrypt with 10 salt rounds
- Make sure to change the default password immediately after creation
- Consider using environment variables for sensitive data in production

### Troubleshooting

- Make sure your database is running
- Verify your `DATABASE_URL` in `.env` file is correct
- Run `npx prisma generate` if you get Prisma client errors
- Check database connection with `npx prisma db push`
