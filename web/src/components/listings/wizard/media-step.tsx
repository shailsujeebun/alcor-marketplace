'use client';

import { useWizard } from './wizard-context';
import { MediaUploader } from '../media-uploader';

export function MediaStep() {
    const { media, setMedia, setCurrentStep } = useWizard();

    const handleNext = () => {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleBack = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="glass-card p-6 sm:p-8 space-y-6">
            <div>
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-2">Фото та Відео</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                    Завантажте якісні фото вашої техніки. Максимум 20 фото. Перше фото буде головним.
                </p>

                <MediaUploader media={media} onChange={setMedia} maxFiles={20} />
            </div>

            <div className="flex justify-between pt-6 border-t border-[var(--border-color)]">
                <button
                    onClick={handleBack}
                    className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    ← Назад
                </button>
                <button
                    onClick={handleNext}
                    className="px-8 py-2.5 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity"
                >
                    Далі: Контакти →
                </button>
            </div>
        </div>
    );
}
