import { createHmac } from "crypto";

export function randomString(length: number): string {
    let result = '';
    const characters = '0123456789abcdef';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function computeSignature(challenge: string, signature: string, key: string): boolean {
    const hmac = createHmac('sha256', key);
    hmac.update(challenge);
    const calculatedSignature = hmac.digest('hex').toLowerCase();
    return calculatedSignature === signature.toLowerCase();
}