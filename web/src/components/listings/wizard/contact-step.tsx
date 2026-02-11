'use client';

import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { useWizard } from './wizard-context';
import { useAuthStore } from '@/stores/auth-store';
import { useCompanies, useCreateListing, useUpdateListing } from '@/lib/queries';
import type { CreateListingPayload, Listing } from '@/types/api';

export function ContactStep() {
    const {
        form, setForm,
        media,
        setCurrentStep,
        isSubmitting, setIsSubmitting,
        error, setError,
        success, setSuccess,
        listing // if editing
    } = useWizard();

    const router = useRouter();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
    const isEditing = !!listing;

    const { data: companiesData } = useCompanies({ limit: '200' });
    const companies = companiesData?.data ?? [];

    const createMutation = useCreateListing();
    const updateMutation = useUpdateListing();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, companyId: e.target.value }));
    };

    const handleBack = () => {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const mediaPayload = media.map((m, i) => ({
                url: m.url,
                key: m.key,
                sortOrder: i,
            }));

            const attributesArray = Object.entries(form.dynamicAttributes)
                .filter(([key, value]) => key && value)
                .map(([key, value]) => ({ key, value }));

            const payload: CreateListingPayload = {
                companyId: form.companyId,
                title: form.title,
                description: form.description || undefined,
                categoryId: form.categoryId || undefined,
                brandId: form.brandId || undefined,
                condition: (form.condition as any) || undefined,
                year: form.year ? parseInt(form.year) : undefined,
                priceAmount: form.priceAmount ? parseFloat(form.priceAmount) : undefined,
                priceCurrency: form.priceCurrency || undefined,
                priceType: (form.priceType as any) || undefined,
                countryId: form.countryId || undefined,
                cityId: form.cityId || undefined,
                sellerName: form.sellerName || undefined,
                sellerEmail: form.sellerEmail || undefined,
                sellerPhones: form.sellerPhones ? form.sellerPhones.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                listingType: (form.listingType as any) || undefined,
                euroClass: form.euroClass || undefined,
                hoursValue: form.hoursValue ? parseInt(form.hoursValue) : undefined,
                hoursUnit: form.hoursUnit || undefined,
                externalUrl: form.externalUrl || undefined,
                media: mediaPayload.length > 0 ? mediaPayload : undefined,
                attributes: attributesArray.length > 0 ? attributesArray : undefined,
            };

            // GUEST FLOW
            if (!user) {
                const draftState = {
                    form,
                    media,
                    timestamp: Date.now()
                };
                localStorage.setItem('listing_draft', JSON.stringify(draftState));
                router.push('/register?redirect=/ad-placement/details&action=create_listing');
                return;
            }

            // AUTHENTICATED FLOW
            if (isEditing && listing) {
                const { companyId, ...updateData } = payload;
                await updateMutation.mutateAsync({ id: listing.id, data: updateData });
            } else {
                await createMutation.mutateAsync(payload);
            }

            setSuccess('Оголошення успішно збережено!');
            localStorage.removeItem('listing_draft');

            const redirectTo = isAdmin ? '/admin/moderation' : '/cabinet/listings';
            setTimeout(() => router.push(redirectTo), 1500);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Помилка: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
    const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
    const selectClass = `${inputClass} appearance-none`;

    return (
        <div className="space-y-6">
            {!user && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Вже зареєстровані?</h3>
                    <p className="text-[var(--text-secondary)] mb-4">Увійдіть, щоб ваші дані заповнились автоматично</p>
                    <button
                        onClick={() => router.push('/login?redirect=/ad-placement/details')}
                        className="px-6 py-2 rounded-full bg-blue-bright text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Увійти
                    </button>
                </div>
            )}

            <div className="glass-card p-6 sm:p-8 space-y-5">
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">Контактна інформація</h2>

                {user && !isEditing && (
                    <div>
                        <label className={labelClass}>Компанія (Від кого розміщуємо)</label>
                        <select name="companyId" value={form.companyId} onChange={handleCompanyChange} className={selectClass}>
                            <option value="">Оберіть компанію</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Ім&apos;я контактної особи</label>
                        <input type="text" name="sellerName" value={form.sellerName} onChange={handleChange} className={inputClass} placeholder="Ваше ім'я" />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" name="sellerEmail" value={form.sellerEmail} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Телефон</label>
                    <input type="text" name="sellerPhones" value={form.sellerPhones} onChange={handleChange} className={inputClass} placeholder="+380..." />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                    <Check size={18} />
                    {success}
                </div>
            )}

            <div className="flex justify-between pt-6">
                <button
                    onClick={handleBack}
                    className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    ← Назад
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-lg gradient-cta text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    {!isSubmitting && <Check size={18} />}
                    <span>
                        {isSubmitting ? 'Публікація...' : !user ? 'Продовжити та зареєструватись' : 'Опублікувати'}
                    </span>
                </button>
            </div>
        </div>
    );
}
