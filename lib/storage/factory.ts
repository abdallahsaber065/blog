import { StorageProvider } from './types';
import { LocalStorageProvider } from './localProvider';
import { S3StorageProvider } from './s3Provider';
import { ImageKitStorageProvider } from './imagekitProvider';

/**
 * Returns the configured storage provider.
 * Controlled by STORAGE_PROVIDER=local|s3|imagekit in .env (default: local)
 */
export function getStorageProvider(): StorageProvider {
    const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();

    switch (provider) {
        case 's3':
            return new S3StorageProvider();
        case 'imagekit':
            return new ImageKitStorageProvider();
        case 'local':
        default:
            return new LocalStorageProvider();
    }
}
