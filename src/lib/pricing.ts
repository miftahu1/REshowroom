import { ProductData, CampaignData } from '@/types';
import { formatPrice } from '@/utils/format';

export const getEffectivePrice = (product: ProductData, campaigns: CampaignData[]) => {
    const now = new Date();
    let effectiveDiscount = null;

    // Check for individual product offer
    if (product.offer && product.offer.enabled) {
        const startDate = new Date(product.offer.startDate);
        const endDate = new Date(product.offer.endDate);
        if (now >= startDate && now <= endDate) {
            effectiveDiscount = {
                ...product.offer,
                source: 'product'
            };
        }
    }

    // Check for global campaigns
    const applicableCampaigns = campaigns.filter(c => {
        if (!c.enabled) return false;
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        if (now < startDate || now > endDate) return false;
        if (c.applyTo === 'all') return true;
        if (c.applyTo === 'selected' && c.selectedProducts.includes(product.id!)) return true;
        // Add logic for categories and excluded models here if needed
        return false;
    });

    for (const campaign of applicableCampaigns) {
        let campaignDiscountValue = 0;
        if (campaign.discountType === 'percentage') {
            campaignDiscountValue = (product.price * campaign.discountValue) / 100;
        } else {
            campaignDiscountValue = campaign.discountValue;
        }

        let currentDiscountValue = 0;
        if (effectiveDiscount) {
            if (effectiveDiscount.type === 'percentage') {
                currentDiscountValue = (product.price * effectiveDiscount.value) / 100;
            } else {
                currentDiscountValue = effectiveDiscount.value;
            }
        }

        if (campaignDiscountValue > currentDiscountValue) {
            effectiveDiscount = {
                ...campaign,
                value: campaign.discountValue,
                type: campaign.discountType,
                title: campaign.campaignName,
                source: 'campaign'
            };
        }
    }

    if (!effectiveDiscount) {
        return {
            originalPrice: product.price,
            finalPrice: product.price,
            discountPercentage: 0,
            offerTitle: null,
            offerSource: null,
            countdown: null,
            badge: null,
            formattedOriginalPrice: formatPrice(product.price),
            formattedFinalPrice: formatPrice(product.price)
        };
    }

    let finalPrice = product.price;
    let discountPercentage = 0;
    if (effectiveDiscount.type === 'percentage') {
        discountPercentage = effectiveDiscount.value;
        finalPrice -= (finalPrice * discountPercentage) / 100;
    } else {
        finalPrice -= effectiveDiscount.value;
        discountPercentage = (effectiveDiscount.value / product.price) * 100;
    }

    return {
        originalPrice: product.price,
        finalPrice: finalPrice,
        discountPercentage: Math.round(discountPercentage),
        offerTitle: effectiveDiscount.title,
        offerSource: effectiveDiscount.source,
        countdown: effectiveDiscount.countdownEnabled ? effectiveDiscount.endDate : null,
        badge: {
            text: `${Math.round(discountPercentage)}% OFF`,
            color: effectiveDiscount.badgeColor || '#FF0000'
        },
        formattedOriginalPrice: formatPrice(product.price),
        formattedFinalPrice: formatPrice(finalPrice)
    };
};