// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const envFilePath = path.join(process.cwd(), '.env');

async function readEnvFile(): Promise<Map<string, string>> {
    try {
        const content = await fs.readFile(envFilePath, 'utf-8');
        const map = new Map<string, string>();
        content.split('\n').forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                // Remove surrounding quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    map.set(key.trim(), value.slice(1, -1));
                } else {
                    map.set(key.trim(), value);
                }
            }
        });
        return map;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return new Map(); // File doesn't exist yet
        }
        throw error;
    }
}

async function writeEnvFile(envMap: Map<string, string>): Promise<void> {
    const content = Array.from(envMap.entries())
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n');
    await fs.writeFile(envFilePath, content, 'utf-8');
}


export async function GET() {
    try {
        const envMap = await readEnvFile();
        const apiKey = envMap.get('GOOGLE_API_KEY') || '';
        return NextResponse.json({ apiKey });
    } catch (error) {
        console.error('Error reading .env file:', error);
        return NextResponse.json({ message: 'Error reading settings' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const { apiKey } = await request.json();
        if (typeof apiKey !== 'string') {
            return NextResponse.json({ message: 'Invalid API key format' }, { status: 400 });
        }

        const envMap = await readEnvFile();
        envMap.set('GOOGLE_API_KEY', apiKey);
        await writeEnvFile(envMap);

        // Update process.env for the currently running server instance
        process.env.GOOGLE_API_KEY = apiKey;

        return NextResponse.json({ message: 'API key saved successfully. A server restart may be required for all changes to take effect.' });
    } catch (error) {
        console.error('Error writing to .env file:', error);
        return NextResponse.json({ message: 'Error saving settings' }, { status: 500 });
    }
}
