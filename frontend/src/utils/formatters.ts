export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getDaysRemaining = (expiryDateStr: string): number => {
  const expiry = new Date(expiryDateStr).getTime();
  const today = new Date().getTime();
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDateStr: string) => {
  const days = getDaysRemaining(expiryDateStr);
  if (days < 0) return { label: 'Expired', color: 'danger', days };
  if (days <= 30) return { label: `Critical (${days}d)`, color: 'danger', days };
  if (days <= 90) return { label: `Warning (${days}d)`, color: 'warning', days };
  return { label: `Good (${days}d)`, color: 'success', days };
};
