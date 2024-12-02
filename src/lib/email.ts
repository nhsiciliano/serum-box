import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV === 'production') {
    // Configuración para producción
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, // use TLS
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

export async function sendVerificationEmail(email: string, verificationCode: string) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: 'Verifica tu cuenta de Serum Box',
            html: `
        <h1>Bienvenido a Serum Box</h1>
        <p>Gracias por registrarte. Por favor, verifica tu cuenta utilizando el siguiente código:</p>
        <h2>${verificationCode}</h2>
        <p>Si no has solicitado esta verificación, por favor ignora este correo.</p>
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
                <h1>Password Reset Request</h1>
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
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Password recovery email sent to:', email);
    } catch (error) {
        console.error('Error sending password recovery email:', error);
        throw new Error('Error sending password recovery email');
    }
}
