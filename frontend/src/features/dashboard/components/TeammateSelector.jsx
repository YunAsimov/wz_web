import React from 'react';
import { buildQueueTeammateHint, clipPathButton, getMaxTeammates } from '../dashboardShared.js';

export default function TeammateSelector({ queueType, teammates, selectedIds, onToggle, compact = false }) {
  const max = getMaxTeammates(queueType);

  if (max === 0) {
    return (
      <div className="border border-dashed border-[#333] bg-[#0a0a0a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-gray-500">
        {buildQueueTeammateHint(queueType)}
      </div>
    );
  }

  if (!teammates.length) {
    return (
      <div className="border border-dashed border-[#333] bg-[#0a0a0a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-gray-500">
        暂无已登记队友，请先在队友管理中添加
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.2em] text-[#00f0ff] sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.22em]">
        <span>ALLY LINK // {buildQueueTeammateHint(queueType)}</span>
        <span className="text-[#fcee0a]">{selectedIds.length}/{max}</span>
      </div>

      <div className={compact ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
        {teammates.map((teammate) => {
          const checked = selectedIds.includes(teammate.id);
          const disabled = !checked && selectedIds.length >= max;

          return (
            <label
              key={teammate.id}
              className={`cursor-pointer border px-3 py-3 text-xs font-bold transition-all sm:text-sm ${checked
                ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.12)]'
                : 'border-[#333] bg-[#050505] text-gray-300 hover:border-[#00f0ff]/50'} ${disabled ? 'cursor-not-allowed opacity-35' : ''}`}
              style={clipPathButton}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(teammate.id)}
              />
              <span className="flex items-center justify-between gap-3">
                <span className="truncate">{teammate.name}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${checked ? 'bg-[#fcee0a]' : 'bg-[#333]'}`} />
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
