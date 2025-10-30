
'use client';

import { AuthProvider } from '@/context/auth-context';
import { NotificationProvider } from '@/context/notification-context';
import { TaskProvider } from '@/context/task-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TaskProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </TaskProvider>
    </AuthProvider>
  );
}
