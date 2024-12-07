import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV === 'production') {
    // Configuración para producción usando TLS explícito
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: false, // Usar SSL/TLS
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        tls: {
            // No fallar en certificados inválidos
            rejectUnauthorized: false,
            // Forzar uso de TLSv1.2
            minVersion: 'TLSv1.2'
        }
    });
} else {
    // Configuración para desarrollo usando Mailtrap
    transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASSWORD,
        },
    });
}

// Verificar la conexión al iniciar
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error al verificar el transporter:', error);
    } else {
        console.log('Servidor de correo listo para enviar mensajes', success);
    }
});

export async function sendVerificationEmail(email: string, verificationCode: string) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: 'Verify your Serum Box account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #319795;">Welcome to Serum Box</h1>
                    <p>Thank you for signing up. Please verify your account using the following code:</p>
                    <h2 style="background-color: #E6FFFA; padding: 15px; text-align: center; font-size: 24px; border-radius: 5px;">${verificationCode}</h2>
                    <p>If you did not request this verification, please ignore this email.</p>
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                        <img src="${process.env.NEXTAUTH_URL}/images/serum-box.png" alt="Serum Box Logo" style="width: 150px; height: auto;">
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado a:', email);
    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error);
        throw new Error('Error al enviar el correo de verificación');
    }
}

export async function sendPasswordRecoveryEmail(email: string, resetToken: string) {
    try {
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: 'Reset your Serum Box password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #319795;">Password Reset Request</h1>
                    <p>You requested to reset your password. Click the link below to set a new password:</p>
                    <a href="${resetUrl}" style="
                        background-color: #319795;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 20px 0;
                    ">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                        <img src="${process.env.NEXTAUTH_URL}/images/serum-box.png" alt="Serum Box Logo" style="width: 150px; height: auto;">
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Password recovery email sent to:', email);
    } catch (error) {
        console.error('Error sending password recovery email:', error);
        throw new Error('Error sending password recovery email');
    }
}
