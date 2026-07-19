export const formatPrice = (price: number): string => {
    if (price >= 100000) {
        return `${(price / 100000).toFixed(2)} L`;
    }
    return price.toString();
};
