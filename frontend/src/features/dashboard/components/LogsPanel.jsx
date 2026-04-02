import React from 'react';
import { Filter, Pencil, Save, Terminal, Trash2, X } from 'lucide-react';
import TeammateSelector from './TeammateSelector.jsx';
import { clipPathButton, clipPathPanel, queueOptions, roleOptions, seasonOptions } from '../dashboardShared.js';

export default function LogsPanel({
  matches,
  totalMatches,
  activeAccountName,
  isLoading,
  isSubmitting,
  isUpdatingMatch,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onEditInputChange,
  onEditTeammateToggle,
  onUpdateMatch,
  editingMatchId,
  editFormData,
  formatTeammateNames,
  teammates,
  accountOptions,
  selectedTeammateIds,
  onToggleTeammateFilter,
  onClearTeammateFilters
}) {
  const hasActiveFilters = selectedTeammateIds.length > 0;
  const totalLabel = hasActiveFilters ? `${matches.length} / ${totalMatches}` : `${matches.length}`;
  const hasAccountOptions = accountOptions.length > 0;

  return (
    <div className="mx-auto max-w-7xl animate-[fadeIn_0.3s_ease-out] space-y-4 sm:space-y-5">
      {editingMatchId && editFormData && (
        <form onSubmit={onUpdateMatch} className="relative border border-[#00f0ff] bg-[#111] p-4 shadow-[0_0_24px_rgba(0,240,255,0.08)] sm:p-6" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-2 w-28 bg-[#fcee0a]" />
          <div className="flex flex-col gap-4 border-b border-[#222] pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-[#00f0ff]">
                <Pencil className="h-4 w-4" /> RECORD_PATCH // 编辑战绩 #{editingMatchId}
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
                直接修改账号、日期、赛季、队列、分路、结果和队友绑定，保存后会实时刷新统计面板。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex items-center gap-2 border border-[#ff003c]/50 bg-[#18060b] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#ff6f93] transition-colors hover:bg-[#250911]"
                style={clipPathButton}
              >
                <X className="h-4 w-4" /> 取消
              </button>
              <button
                type="submit"
                disabled={isUpdatingMatch || !hasAccountOptions}
                className="flex items-center gap-2 bg-[#fcee0a] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                style={clipPathButton}
              >
                <Save className="h-4 w-4" /> {isUpdatingMatch ? '保存中' : '保存修改'}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-6">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">日期</label>
              <input type="date" name="date" value={editFormData.date} onChange={onEditInputChange} className="w-full border border-[#333] bg-[#050505] px-3 py-2 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]" required />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">账号</label>
              <select name="accountName" value={editFormData.accountName} onChange={onEditInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff] disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasAccountOptions} required>
                {hasAccountOptions ? accountOptions.map((accountName) => <option key={accountName} value={accountName}>{accountName}</option>) : <option value="">请先添加账号</option>}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">赛季</label>
              <select name="season" value={editFormData.season} onChange={onEditInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">
                {seasonOptions.map((season) => <option key={season} value={season}>{season}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">类型</label>
              <select name="queueType" value={editFormData.queueType} onChange={onEditInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">
                {queueOptions.map((queueType) => <option key={queueType} value={queueType}>{queueType}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">分路</label>
              <select name="role" value={editFormData.role} onChange={onEditInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">结果</label>
              <div className="flex gap-2">
                <label className={`flex-1 cursor-pointer border px-3 py-2 text-center text-xs font-black uppercase tracking-[0.18em] transition-all ${editFormData.result === '胜利' ? 'border-[#00f0ff] bg-[#00f0ff] text-black' : 'border-[#333] bg-[#050505] text-[#00f0ff]/70 hover:border-[#00f0ff]/50'}`} style={clipPathButton}>
                  <input type="radio" className="hidden" name="result" value="胜利" checked={editFormData.result === '胜利'} onChange={onEditInputChange} />胜利
                </label>
                <label className={`flex-1 cursor-pointer border px-3 py-2 text-center text-xs font-black uppercase tracking-[0.18em] transition-all ${editFormData.result === '失败' ? 'border-[#ff003c] bg-[#ff003c] text-white' : 'border-[#333] bg-[#050505] text-[#ff6f93]/70 hover:border-[#ff003c]/50'}`} style={clipPathButton}>
                  <input type="radio" className="hidden" name="result" value="失败" checked={editFormData.result === '失败'} onChange={onEditInputChange} />失败
                </label>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[#222] pt-4">
            <TeammateSelector queueType={editFormData.queueType} teammates={teammates} selectedIds={editFormData.teammateIds || []} onToggle={onEditTeammateToggle} />
          </div>
        </form>
      )}

      <div className="relative border border-[#333] bg-[#111] p-1 shadow-[0_0_30px_rgba(252,238,10,0.05)]">
        <div className="mb-1 flex flex-col gap-3 bg-[#fcee0a] p-4 text-black sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-widest">
              <Terminal className="h-5 w-5" /> DATABASE_RECORDS // 详细档案
            </h3>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/65">当前账号视角 // {activeAccountName}</p>
          </div>
          <span className="self-start border border-black px-2 py-1 text-xs font-bold">TOTAL_RECORDS: {totalLabel}</span>
        </div>

        <div className="border-b border-[#222] bg-[#0c0c0c] px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#00f0ff]">
                <Filter className="h-4 w-4" /> 队友筛选器
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
                当前账号视角内，多选时显示包含任一已选队友的对局，便于快速回看固定搭档相关记录。
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearTeammateFilters}
                className="border border-[#ff003c]/50 bg-[#18060b] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff6f93] transition-colors hover:bg-[#250911]"
                style={clipPathButton}
              >
                清空筛选
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {teammates.length === 0 ? (
              <div className="border border-dashed border-[#333] bg-[#050505] px-4 py-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
                暂无可筛选队友
              </div>
            ) : (
              teammates.map((teammate) => {
                const selected = selectedTeammateIds.includes(teammate.id);
                return (
                  <button
                    key={teammate.id}
                    type="button"
                    onClick={() => onToggleTeammateFilter(teammate.id)}
                    className={`border px-4 py-3 text-sm font-bold transition-all ${selected ? 'border-[#00f0ff] bg-[#071318] text-[#00f0ff] shadow-[0_0_16px_rgba(0,240,255,0.12)]' : 'border-[#333] bg-[#050505] text-gray-300 hover:border-[#00f0ff]/50 hover:text-[#00f0ff]'}`}
                    style={clipPathButton}
                  >
                    {teammate.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {isLoading ? (
            <div className="border border-[#00f0ff] bg-[#071318] px-4 py-10 text-center text-sm font-black uppercase tracking-[0.18em] text-[#00f0ff] animate-pulse">
              LINKING_BACKEND // 数据载入中
            </div>
          ) : matches.length === 0 ? (
            <div className="border border-[#ff003c] bg-[#22020a] px-4 py-10 text-center text-sm font-black uppercase tracking-[0.18em] text-[#ff8aa3] animate-pulse">
              {hasActiveFilters ? 'FILTER_EMPTY // 没有命中所选队友的对局' : 'SYSTEM_EMPTY // 当前账号视角暂无数据'}
            </div>
          ) : (
            matches.map((match) => (
              <article key={match.id} className={`space-y-4 border border-[#333] bg-[#0c0c0c] p-4 transition-colors ${editingMatchId === match.id ? 'border-[#00f0ff] bg-[#101820]' : ''}`} style={clipPathPanel}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">{match.date}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00f0ff]">{match.accountName}</p>
                  </div>
                  <span className={`inline-flex items-center border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${match.result === '胜利' ? 'border-[#00f0ff] bg-[#00f0ff]/20 text-[#00f0ff]' : 'border-[#ff003c] bg-[#ff003c]/20 text-[#ff003c]'}`}>{match.result}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  <div className="border border-[#222] bg-[#050505] px-3 py-2">
                    <p className="text-gray-500">赛季</p>
                    <p className="mt-2 text-sm font-bold text-[#fcee0a]">{match.season || '-'}</p>
                  </div>
                  <div className="border border-[#222] bg-[#050505] px-3 py-2">
                    <p className="text-gray-500">类型</p>
                    <p className="mt-2 text-sm font-bold text-white">{match.queueType}</p>
                  </div>
                  <div className="border border-[#222] bg-[#050505] px-3 py-2 col-span-2">
                    <p className="text-gray-500">分路</p>
                    <p className="mt-2 text-sm font-bold text-white">{match.role}</p>
                  </div>
                </div>

                <div className="border border-[#222] bg-[#050505] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">队友</p>
                  <p className="mt-2 text-sm text-gray-300">{formatTeammateNames(match.teammates)}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onStartEdit(match)}
                    disabled={isSubmitting || isUpdatingMatch}
                    className={`flex flex-1 items-center justify-center gap-2 border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors ${editingMatchId === match.id ? 'border-[#00f0ff] bg-[#071318] text-[#00f0ff]' : 'border-[#333] bg-[#050505] text-gray-300 hover:border-[#00f0ff] hover:text-[#00f0ff]'}`}
                    style={clipPathButton}
                  >
                    <Pencil className="h-4 w-4" /> 编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(match.id)}
                    disabled={isSubmitting || isUpdatingMatch}
                    className="flex flex-1 items-center justify-center gap-2 border border-[#333] bg-[#050505] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-[#ff003c] hover:text-[#ff003c]"
                    style={clipPathButton}
                  >
                    <Trash2 className="h-4 w-4" /> 删除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto p-4 md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b-2 border-[#00f0ff] text-xs uppercase text-[#00f0ff]">
              <tr>
                <th className="px-4 py-4 font-bold tracking-widest">TIMESTAMP (日期)</th>
                <th className="px-4 py-4 font-bold tracking-widest">ACCOUNT (账号)</th>
                <th className="px-4 py-4 font-bold tracking-widest">SN (赛季)</th>
                <th className="px-4 py-4 font-bold tracking-widest">MODE (类型)</th>
                <th className="px-4 py-4 font-bold tracking-widest">ROLE (分路)</th>
                <th className="px-4 py-4 font-bold tracking-widest">ALLY (队友)</th>
                <th className="px-4 py-4 font-bold tracking-widest">STATUS (结果)</th>
                <th className="px-4 py-4 text-right font-bold tracking-widest">CMD (操作)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center text-lg font-black uppercase tracking-widest text-[#00f0ff] animate-pulse">
                    LINKING_BACKEND // 数据载入中
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center text-lg font-black uppercase tracking-widest text-[#ff003c] animate-pulse">
                    {hasActiveFilters ? 'FILTER_EMPTY // 没有命中所选队友的对局' : 'SYSTEM_EMPTY // 当前账号视角暂无数据'}
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className={`group border-b border-[#333] transition-colors hover:bg-[#1a1a1a] ${editingMatchId === match.id ? 'bg-[#12161b]' : ''}`}>
                    <td className="px-4 py-4 font-bold text-gray-300">{match.date}</td>
                    <td className="px-4 py-4 font-bold text-[#00f0ff]">{match.accountName}</td>
                    <td className="px-4 py-4 font-bold text-[#fcee0a]">{match.season || '-'}</td>
                    <td className="px-4 py-4 text-gray-400">{match.queueType}</td>
                    <td className="px-4 py-4 text-gray-400">{match.role}</td>
                    <td className="px-4 py-4 text-gray-300">{formatTeammateNames(match.teammates)}</td>
                    <td className="px-4 py-4"><span className={`inline-flex items-center border px-3 py-1 text-xs font-black uppercase tracking-widest ${match.result === '胜利' ? 'border-[#00f0ff] bg-[#00f0ff]/20 text-[#00f0ff]' : 'border-[#ff003c] bg-[#ff003c]/20 text-[#ff003c]'}`}>{match.result}</span></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onStartEdit(match)}
                          disabled={isSubmitting || isUpdatingMatch}
                          className={`border p-2 transition-colors ${editingMatchId === match.id ? 'border-[#00f0ff] bg-[#071318] text-[#00f0ff]' : 'border-transparent bg-[#050505] text-gray-600 hover:border-[#00f0ff] hover:text-[#00f0ff]'}`}
                          title="Edit record"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(match.id)}
                          disabled={isSubmitting || isUpdatingMatch}
                          className="border border-transparent bg-[#050505] p-2 text-gray-600 transition-colors hover:border-[#ff003c] hover:text-[#ff003c]"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


