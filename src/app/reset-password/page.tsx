"use client"

import ResetPasswordForm from '@/components/ResetPasswordForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      contextTitle="Recuperá el acceso manteniendo la trazabilidad intacta."
      contextDescription="Restablecé tu contraseña con un enlace seguro y seguí con tu flujo de laboratorio sin perder contexto."
    >
      <ResetPasswordForm />
    </AuthSplitLayout>
  );
}
