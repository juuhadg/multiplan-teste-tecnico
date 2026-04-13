export function getExpiryDisplay(iso: string): {
  line: string;
  urgencyClass: string;
  isUrgent: boolean;
} {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) {
    return {
      line: 'Data inválida',
      urgencyClass: 'text-slate-600',
      isUrgent: false,
    };
  }

  const diff = end - Date.now();
  if (diff <= 0) {
    return {
      line: 'Expirada',
      urgencyClass: 'text-slate-600',
      isUrgent: false,
    };
  }

  const minutes = Math.floor(diff / 60_000);

  if (minutes < 60) {
    return {
      line: `Expira em ${minutes} minuto${minutes !== 1 ? 's' : ''}`,
      urgencyClass: 'text-red-600',
      isUrgent: true,
    };
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return {
      line: `Expira em ${hours} hora${hours !== 1 ? 's' : ''}`,
      urgencyClass: 'text-amber-700',
      isUrgent: false,
    };
  }

  const days = Math.floor(hours / 24);
  return {
    line: `Expira em ${days} dia${days !== 1 ? 's' : ''}`,
    urgencyClass: 'text-amber-800',
    isUrgent: false,
  };
}
