export const formatValueForCard = (value: string | number | undefined | null): string => {
    if (!value) return 'TBD';
    if (value === 'TBD') return 'TBD';

    // If it's a string, try to parse it if it looks like a number
    let numValue: number;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.]/g, '');
        if (!cleaned) return 'TBD';
        numValue = parseFloat(cleaned);
    } else {
        numValue = value;
    }

    if (numValue >= 1000000000) {
        return `£${(numValue / 1000000000).toFixed(1)}B`;
    }
    if (numValue >= 1000000) {
        return `£${(numValue / 1000000).toFixed(1)}M`;
    }
    if (numValue >= 1000) {
        return `£${(numValue / 1000).toFixed(1)}K`;
    }

    return `£${numValue.toLocaleString()}`;
};
