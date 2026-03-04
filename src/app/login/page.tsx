'use client';

import { useMemo, useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RecoverPassword from '@/components/RecoverPassword';
import RegisterForm from '@/components/RegisterForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

type AuthView = 'login' | 'register' | 'recover';

const contextByView: Record<AuthView, { title: string; description: string }> = {
  login: {
    title: 'Protegé cada muestra con acceso controlado.',
    description: 'Iniciá sesión para continuar con la trazabilidad, el control de inventario y la operación diaria del laboratorio.',
  },
  register: {
    title: 'Creá un acceso seguro para tu equipo.',
    description: 'Configurá un nuevo perfil de trabajo y documentá cada movimiento de sueros desde el primer día.',
  },
  recover: {
    title: 'Recuperá el acceso sin frenar el flujo de trabajo.',
    description: 'Restablecé tus credenciales y volvé rápido a aprobaciones, etiquetas y asignaciones de gradillas.',
  },
};

export default function LoginPage() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const context = useMemo(() => contextByView[currentView], [currentView]);

  const renderForm = () => {
    switch (currentView) {
      case 'register':
        return <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />;
      case 'recover':
        return <RecoverPassword onBackToLogin={() => setCurrentView('login')} />;
      default:
        return (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToRecover={() => setCurrentView('recover')}
          />
        );
    }
  };

  return (
    <AuthSplitLayout contextTitle={context.title} contextDescription={context.description}>
      {renderForm()}
    </AuthSplitLayout>
  );
}
