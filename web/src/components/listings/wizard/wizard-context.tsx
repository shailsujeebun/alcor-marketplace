import { createContext, useContext, useState } from 'react';
import type { Listing } from '@/types/api';
import type { Dispatch, SetStateAction } from 'react';

// Unified types
export interface FormData {
    title: string;
    description: string;
    categoryId: string;
    brandId: string;
    listingType: string;
    condition: string;
    year: string;
    priceAmount: string;
    priceCurrency: string;
    priceType: string;
    hoursValue: string;
    hoursUnit: string;
    euroClass: string;
    countryId: string;
    cityId: string;
    sellerName: string;
    sellerEmail: string;
    sellerPhones: string;
    companyId: string;
    externalUrl: string;
    dynamicAttributes: Record<string, string>;
}

export interface MediaItem {
    id: string;
    url: string;
    key?: string;
    file?: File;
    isExisting?: boolean;
    type?: 'PHOTO' | 'VIDEO' | 'PDF' | 'GALLERY' | 'COVER' | 'LOGO';
}

interface WizardContextType {
    listing?: Listing;
    form: FormData;
    setForm: Dispatch<SetStateAction<FormData>>;
    media: MediaItem[];
    setMedia: Dispatch<SetStateAction<MediaItem[]>>;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isSubmitting: boolean;
    setIsSubmitting: (val: boolean) => void;
    error: string;
    setError: (err: string) => void;
    success: string;
    setSuccess: (msg: string) => void;
}

export const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
    const context = useContext(WizardContext);
    if (!context) throw new Error('useWizard must be used within WizardProvider');
    return context;
}
