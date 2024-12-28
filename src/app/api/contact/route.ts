import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        // Obtener datos del formulario
        const { name, email, message } = await req.json();

        // Validar datos de entrada
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'All fields are required' }, 
                { status: 400 }
            );
        }

        // Configurar transporte de correo
        let transporter: nodemailer.Transporter;

        if (process.env.NODE_ENV === 'production') {
            // Configuración para producción usando Gmail SMTP
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465, // Puerto seguro para SSL
                secure: true, // Usar SSL
                auth: {
                    user: process.env.EMAIL_SERVER_USER_GMAIL, // Tu email de Gmail
                    pass: process.env.EMAIL_SERVER_PASSWORD_GMAIL // Contraseña de aplicación
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

        // Configurar opciones de correo
        const mailOptions = {
            from: `"Serum Box Contact" <${process.env.EMAIL_FROM}>`,
            to: process.env.CONTACT_EMAIL || 'contact@serum-box.com',
            subject: 'Nueva Consulta de Serum Box',
            text: `
Nombre: ${name}
Email: ${email}

Mensaje:
${message}
            `,
            html: `
<html>
<body>
    <h2>Nueva Consulta de Serum Box</h2>
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Email de contacto:</strong> ${email}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${message}</p>
    <hr>
    <small>Recibido a través del formulario de contacto de Serum Box</small>
</body>
</html>
            `
        };

        // Enviar correo
        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: 'Message sent successfully' }, 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Error sending message' }, 
            { status: 500 }
        );
    }
} 