/**
 * Genera un código de verificación numérico de 6 dígitos
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
