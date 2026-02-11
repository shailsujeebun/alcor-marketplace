import type { Metadata } from 'next';
import { ListingWizard } from '@/components/listings/listing-wizard';

export const metadata: Metadata = {
    title: 'Деталі оголошення — АЛЬКОР',
};

export default function AdDetailsPage() {
    return (
        <div className="container-main py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-bright text-white flex items-center justify-center font-bold">
                        2
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                        Деталі оголошення
                    </h1>
                </div>
            </div>
            <ListingWizard />
        </div>
    );
}
