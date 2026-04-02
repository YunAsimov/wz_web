import React from 'react';
import { clipPathPanel } from '../dashboardShared.js';

export default function StatMiniCard({ label, value, hint, accent }) {
  return (
    <div className="relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: accent }} />
      <p className="ml-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500 sm:tracking-[0.28em]">{label}</p>
      <p className="ml-3 mt-3 break-words text-2xl font-black sm:text-3xl" style={{ color: accent }}>{value}</p>
      <p className="ml-3 mt-2 text-[11px] uppercase tracking-[0.16em] text-gray-400 sm:text-xs sm:tracking-[0.2em]">{hint}</p>
    </div>
  );
}
