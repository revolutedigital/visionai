import crypto from 'crypto';
import fs from 'fs';

/**
 * Calcula hash SHA256 de um arquivo
 * Usado para cache de análises IA - fotos duplicadas não são analisadas 2x
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Calcula hash de um buffer (imagem já carregada)
 */
export function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
