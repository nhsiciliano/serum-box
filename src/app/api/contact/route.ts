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

        // Configurar transporte de Mailtrap
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || '2525'),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
        });

        // Configurar opciones de correo
        const mailOptions = {
            from: `"Serum Box Contact" <${email}>`,
            to: process.env.CONTACT_EMAIL || 'contact@serum-box.com',
            subject: 'New Serum Box Contact',
            text: `
Nombre: ${name}
Email: ${email}

Mensaje:
${message}
            `,
            html: `
<html>
<body>
    <h2>New Serum Box Contact</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
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