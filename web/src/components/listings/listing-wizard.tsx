'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WizardContext, type FormData, type MediaItem } from './wizard/wizard-context';
import { DescriptionStep } from './wizard/description-step';
import { MediaStep } from './wizard/media-step';
import { ContactStep } from './wizard/contact-step';
import { useAuthStore } from '@/stores/auth-store';
import type { Listing } from '@/types/api';

import {
  FileText, // Description
  Image as ImageIcon, // Media
  User, // Contacts
  CheckCircle2 // Success
} from 'lucide-react';

interface ListingWizardProps {
  listing?: Listing;
}

function initFormData(listing?: Listing): FormData {
  if (!listing) {
    return {
      title: '',
      description: '',
      categoryId: '',
      countryId: '',
      cityId: '',
      sellerName: '',
      sellerEmail: '',
      sellerPhones: '',
      companyId: '',
      dynamicAttributes: {},
    };
  }
  return {
    title: listing.title,
    description: listing.description ?? '',
    categoryId: listing.categoryId ?? '',
    countryId: listing.countryId ?? '',
    cityId: listing.cityId ?? '',
    sellerName: listing.sellerName ?? '',
    sellerEmail: listing.sellerEmail ?? '',
    sellerPhones: listing.sellerPhones?.join(', ') ?? '',
    companyId: listing.companyId,
    dynamicAttributes: listing.attributes?.reduce((acc, attr) => ({ ...acc, [attr.key]: attr.value }), {}) ?? {},
  };
}

function initMedia(listing?: Listing): MediaItem[] {
  if (!listing?.media?.length) return [];
  return listing.media.map((m) => ({
    id: m.id,
    url: m.url,
    type: m.type ?? 'PHOTO',
    isExisting: true,
  }));
}

export function ListingWizard({ listing }: ListingWizardProps) {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Initialize form with category from URL if present
  const initialForm = initFormData(listing);
  const urlCategoryId = searchParams.get('categoryId');
  if (urlCategoryId && !initialForm.categoryId) {
    initialForm.categoryId = urlCategoryId;
  }

  const [form, setForm] = useState<FormData>(initialForm);
  const [media, setMedia] = useState<MediaItem[]>(() => initMedia(listing));
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Restore draft effect
  useEffect(() => {
    if (!user && !listing) {
      const savedDraft = localStorage.getItem('listing_draft');
      if (savedDraft) {
        try {
          const { form: savedForm, media: savedMedia } = JSON.parse(savedDraft);
          setForm(prev => ({ ...prev, ...savedForm }));
          if (savedMedia) setMedia(savedMedia);
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [user, listing]);

  const steps = [
    { num: 0, label: 'Розділ', icon: CheckCircle2 },
    { num: 1, label: 'Опис', icon: FileText },
    { num: 2, label: 'Фото та відео', icon: ImageIcon },
    { num: 3, label: 'Контакти продавця', icon: User },
  ];

  return (
    <WizardContext.Provider value={{
      listing,
      form, setForm,
      media, setMedia,
      currentStep, setCurrentStep,
      isSubmitting, setIsSubmitting,
      error, setError,
      success, setSuccess
    }}>
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {currentStep === 1 && <DescriptionStep />}
          {currentStep === 2 && <MediaStep />}
          {currentStep === 3 && <ContactStep />}
        </div>

        {/* Right Sidebar - Steps (Sticky) */}
        <div className="hidden xl:block w-72 flex-shrink-0 sticky top-24">
          <div className="glass-card wizard-section-card animate-fade-up p-6">
            <h3 className="font-heading font-bold text-[var(--text-primary)] mb-6">Етапи подачі</h3>

            <div className="space-y-6 relative">
              {/* Connecting Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[var(--border-color)] -z-10" />

              {steps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = step.num === 0 ? true : currentStep > step.num;

                return (
                  <div key={step.num} className={`flex items-center gap-4 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10
                                ${isActive ? 'bg-blue-bright border-blue-bright text-white' :
                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                          'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'}
                            `}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-sm font-bold">{step.num}</span>}
                    </div>
                    <div>
                      <p className={`font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips Box */}
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                💡 <strong>Порада:</strong> Чим детальніше ви опишете техніку та додасте більше якісних фото, тим швидше знайдете покупця.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}
