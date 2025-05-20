import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { generateKeyPairSync, KeyObject, createPrivateKey, createPublicKey } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

class JwtHelper {
    private readonly privateKey: KeyObject;
    private readonly publicKey: KeyObject;

    constructor({ privateKey, publicKey }: { privateKey: KeyObject, publicKey: KeyObject }) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public issueToken(payload: object, audience: string, expiresInSeconds: number): string {
        const signOptions: SignOptions = {
            expiresIn: expiresInSeconds,
            algorithm: 'RS256',
            issuer: '93@Home-Center-Server',
            audience,
        };
        return jwt.sign(payload, this.privateKey, signOptions);
    }

    public verifyToken(token: string | undefined, audience: string | null = null): object | null {
        try {
            if (!token) return null;

            const decoded = jwt.verify(token, this.publicKey, {
                algorithms: ['RS256'],
                audience,
            } as VerifyOptions);

            if (typeof decoded === 'object' && decoded !== null) {
                return decoded;
            }

            return null;
        } catch (error) {
            console.error('JWT verification error:', (error as Error).message);
            return null;
        }
    }

    public static generateKeys(): { privateKey: KeyObject, publicKey: KeyObject } {
        const { privateKey, publicKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });
        return { privateKey, publicKey };
    }
}

export default JwtHelper;