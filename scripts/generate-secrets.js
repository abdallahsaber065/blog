const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

function main() {
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log('Updating existing .env file...');
    } else if (fs.existsSync(envExamplePath)) {
        envContent = fs.readFileSync(envExamplePath, 'utf8');
        console.log('Creating .env from .env.example...');
    } else {
        console.error('Error: Neither .env nor .env.example found.');
        process.exit(1);
    }

    const secretsToGenerate = [
        'NEXTAUTH_SECRET',
        'ADMIN_PASSWORD',
        'SECRET_KEY',
        'CSRF_SECRET',
        'NEXT_PUBLIC_CSRF_TOKEN'
    ];

    let updatedContent = envContent;

    secretsToGenerate.forEach(key => {
        // Regex to match the key and its value, even if it's quoted or has spaces
        const regex = new RegExp(`^${key}=(.*)$`, 'm');
        const match = updatedContent.match(regex);

        if (match) {
            const currentValue = match[1].trim().replace(/^["'](.*)["']$/, '$1');

            // Check if it's a placeholder or empty
            const isPlaceholder = currentValue === '' ||
                currentValue.startsWith('your-') ||
                currentValue === 'Password123' ||
                currentValue.includes('placeholder');

            if (isPlaceholder) {
                const newSecret = generateSecret();
                // Preserving quotes if they existed or adding them if needed
                const hasQuotes = match[1].trim().startsWith('"') || match[1].trim().startsWith("'");
                const formattedSecret = hasQuotes ? `"${newSecret}"` : newSecret;

                updatedContent = updatedContent.replace(regex, `${key}=${formattedSecret}`);
                console.log(`Generated new secret for ${key}`);
            } else {
                console.log(`${key} already has a value, skipping...`);
            }
        } else {
            // If key doesn't exist, append it
            const newSecret = generateSecret();
            updatedContent += `\n${key}="${newSecret}"`;
            console.log(`Added and generated new secret for ${key}`);
        }
    });

    fs.writeFileSync(envPath, updatedContent);
    console.log('.env file updated successfully with strong secrets.');
}

main();
