import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || '').toUpperCase().trim();

  let colorClasses = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let dotColor = 'bg-zinc-400';

  if (['CONFIRMED', 'NEW', 'ACTIVE'].includes(norm)) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    dotColor = 'bg-blue-400';
  } else if (['DISPATCHED', 'IN_TRANSIT'].includes(norm)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotColor = 'bg-amber-400 animate-pulse';
  } else if (['DELIVERED', 'COMPLETED', 'IN_STOCK'].includes(norm)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (['LOW_STOCK', 'CRITICAL', 'OUT_OF_STOCK'].includes(norm)) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dotColor = 'bg-rose-400';
  }

  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{norm.replace('_', ' ')}</span>
    </span>
  );
}

