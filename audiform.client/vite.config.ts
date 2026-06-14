import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';
import { env } from 'node:process';

const certificateName = 'audiform.client';

const baseFolder = path.resolve(
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? path.join(env.APPDATA, 'ASP.NET', 'https')
        : path.join(env.HOME ?? '', '.aspnet', 'https'),
);

function resolvePathInsideFolder(baseFolderPath: string, fileName: string): string {
    const resolvedBaseFolder = path.resolve(baseFolderPath);
    const resolvedFilePath = path.resolve(resolvedBaseFolder, fileName);

    const relativePath = path.relative(resolvedBaseFolder, resolvedFilePath);

    if (
        relativePath === '' ||
        relativePath.startsWith('..') ||
        path.isAbsolute(relativePath)
    ) {
        throw new Error('Ongeldig certificaatpad.');
    }

    return resolvedFilePath;
}

const certFilePath = resolvePathInsideFolder(baseFolder, `${certificateName}.pem`);
const keyFilePath = resolvePathInsideFolder(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    const result = childProcess.spawnSync(
        'dotnet',
        [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ],
        { stdio: 'inherit' },
    );

    if (result.status !== 0) {
        throw new Error('Could not create certificate.');
    }
}

const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0]
        : 'https://localhost:7050';

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '^/weatherforecast': {
                target,
                secure: false,
            },
        },
        port: parseInt(env.DEV_SERVER_PORT || '60942'),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        },
    },
});