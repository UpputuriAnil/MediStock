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
  if (!expiryDateStr) return 999;
  const expiry = new Date(expiryDateStr).getTime();
  if (isNaN(expiry)) return 999;
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

export const formatNameFromEmail = (email?: string): string => {
  if (!email) return 'User';
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === 'admin@medistock.com' || cleanEmail === 'admin') return 'System Admin';
  if (cleanEmail === 'pharmacist@medistock.com' || cleanEmail === 'pharmacist') return 'Chief Pharmacist';
  if (cleanEmail === 'staff@medistock.com' || cleanEmail === 'staff') return 'Staff Member';

  const prefix = cleanEmail.split('@')[0];
  if (!prefix) return 'User';

  const parts = prefix.split(/[._\-\+]+/).filter(Boolean);
  if (parts.length === 0) return 'User';

  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
};
