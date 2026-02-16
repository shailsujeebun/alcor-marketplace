import { createContext, useContext, useState } from 'react';
import type { Listing } from '@/types/api';
import type { Dispatch, SetStateAction } from 'react';

// Unified types
export interface FormData {
    // Universal fields (always present)
    title: string;
    description: string;
    categoryId: string;

    // Location (universal)
    countryId: string;
    cityId: string;

    // Core listing details (optional by category)
    brandId: string;
    condition: string;
    year: string;
    priceAmount: string;
    priceCurrency: string;
    priceType: string;
    listingType: string;
    euroClass: string;
    hoursValue: string;
    hoursUnit: string;
    externalUrl: string;

    // Seller information (universal)
    sellerName: string;
    sellerEmail: string;
    sellerPhones: string;
    companyId: string;

    // Category-specific fields (from template)
    // This includes: brand, year, condition, price, etc.
    dynamicAttributes: Record<string, any>;
}

export interface MediaItem {
    id?: string;
    url: string;
    key?: string;
    file?: File;
    isExisting?: boolean;
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
