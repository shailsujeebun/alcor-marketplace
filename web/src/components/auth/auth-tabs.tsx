'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

interface AuthTabsProps {
    defaultTab?: 'login' | 'register';
}

export function AuthTabs({ defaultTab = 'login' }: AuthTabsProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-8 text-center">
                <h1 className="font-heading font-bold text-3xl gradient-text mb-2">
                    АЛЬКОР
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Маркетплейс спецтехніки
                </p>
            </div>

            <div className="bg-[var(--bg-secondary)]/50 p-1.5 rounded-xl mb-6 flex justify-center">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="w-full grid w-full grid-cols-2 bg-transparent h-12 gap-2">
                        <TabsTrigger
                            value="login"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-[var(--text-secondary)] font-medium h-full"
                        >
                            Вхід
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-[var(--text-secondary)] font-medium h-full"
                        >
                            Реєстрація
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 glass-card p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TabsContent value="login" className="mt-0">
                            {/* We pass a prop to hide the bottom link if we wanted, but for now standard form */}
                            <LoginForm />
                        </TabsContent>
                        <TabsContent value="register" className="mt-0">
                            <RegisterForm />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
