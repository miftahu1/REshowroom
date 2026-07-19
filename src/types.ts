import { FieldValue } from 'firebase/firestore';

// Type definitions
export type Spec = { value: string; label: string };

export interface ProductData {
    id?: string;
    name: string;
    engine: string;
    price: string;
    financeEnabled: boolean;
    imageUrl: string; // Cloudinary Public ID
    badge: string;
    specs: Spec[];
    category: string;
    createdAt?: FieldValue;
    offer?: {
        enabled: boolean;
        type: 'percentage' | 'fixed';
        value: number;
        title: string;
        startDate: string;
        endDate: string;
        countdownEnabled: boolean;
        badgeColor: string;
    };
}

export interface CampaignData {
    id?: string;
    campaignName: string;
    enabled: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    applyTo: 'all' | 'selected';
    selectedProducts: string[];
    createdAt?: FieldValue;
}
