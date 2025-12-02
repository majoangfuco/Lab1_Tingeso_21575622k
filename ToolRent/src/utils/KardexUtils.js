/**
 * Maps the Kardex integer type to a readable string and a badge color.
 * 0 = register ; 1 = return ; 2 = Decommissioned ; 3 = in reparation ; 4 = rentend
 */
export const KARDEX_STATUS_MAP = {
    0: { label: 'Registered', color: 'bg-blue-100 text-blue-800' },
    1: { label: 'Returned', color: 'bg-green-100 text-green-800' },
    2: { label: 'Decommissioned', color: 'bg-red-100 text-red-800' },
    3: { label: 'In Reparation', color: 'bg-yellow-100 text-yellow-800' },
    4: { label: 'Rented (Out)', color: 'bg-orange-100 text-orange-800' },
    DEFAULT: { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
};

export const getKardexStatus = (type) => {
    return KARDEX_STATUS_MAP[type] || KARDEX_STATUS_MAP.DEFAULT;
};

/**
 * Formats ISO date string to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};