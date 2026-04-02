import React from 'react';
import { Link2, Plus, PlusCircle, Trash2, Upload, Users } from 'lucide-react';
import { clipPathButton, clipPathPanel, queueOptions, roleOptions, seasonOptions } from '../dashboardShared.js';
import TeammateSelector from './TeammateSelector.jsx';

function AccountSelect({ value, onChange, gameAccounts, disabled = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || gameAccounts.length === 0}
      className="w-full appearance-none border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff] disabled:cursor-not-allowed disabled:opacity-50"
      required
    >
      {gameAccounts.length === 0 ? (
        <option value="">请先在账号管理中添加账号</option>
      ) : (
        gameAccounts.map((account) => (
          <option key={account.id} value={account.name}>
            {account.name}
          </option>
        ))
      )}
    </select>
  );
}

export default function ImportPanel({
  inputMode,
  onModeChange,
  formData,
  onInputChange,
  onSingleTeammateToggle,
  onSingleSubmit,
  batchRows,
  onBatchRowChange,
  onBatchTeammateToggle,
  onAddBatchRow,
  onRemoveBatchRow,
  onBatchSubmit,
  teammates,
  gameAccounts,
  isSubmitting
}) {
  const hasGameAccounts = gameAccounts.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5 animate-[fadeIn_0.3s_ease-out] sm:space-y-6">
      <div className="relative border border-[#00f0ff] bg-[#111] p-4 shadow-[0_0_20px_rgba(0,240,255,0.1)] sm:p-8">
        <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#00f0ff]" />

        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold uppercase tracking-[0.18em] text-[#00f0ff] sm:mb-6 sm:text-xl sm:tracking-[0.2em]">
          <Plus className="h-5 w-5" /> // 数据流注入协议
        </h2>

        {!hasGameAccounts && (
          <div className="mb-6 border border-[#ff003c] bg-[#22020a] px-4 py-3 text-sm font-bold tracking-wide text-[#ff8aa3]">
            SYSTEM_ALERT // 请先在“游戏账号”模块中添加账号，再录入战绩
          </div>
        )}

        <div className="mb-6 flex gap-2 border border-[#333] bg-[#050505] p-1 sm:mb-8 sm:gap-4">
          <button type="button" onClick={() => onModeChange('single')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors sm:py-3 sm:text-sm sm:tracking-widest ${inputMode === 'single' ? 'bg-[#fcee0a] text-black' : 'text-gray-500 hover:text-white'}`}>单行覆盖 (SINGLE)</button>
          <button type="button" onClick={() => onModeChange('batch')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors sm:py-3 sm:text-sm sm:tracking-widest ${inputMode === 'batch' ? 'bg-[#fcee0a] text-black' : 'text-gray-500 hover:text-white'}`}>矩阵列阵 (BATCH)</button>
        </div>

        {inputMode === 'batch' ? (
          <form onSubmit={onBatchSubmit} className="space-y-6">
            <div className="space-y-4">
              {batchRows.map((row, index) => (
                <div key={row.id} className="border border-[#222] bg-[#050505] p-4" style={clipPathPanel}>
                  <div className="mb-4 flex flex-col gap-4 border-b border-[#222] pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#fcee0a]">BATCH_ROW // {index + 1}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">为每一局单独绑定账号与队友信息</p>
                    </div>
                    <button type="button" onClick={() => onRemoveBatchRow(row.id)} disabled={batchRows.length === 1} className="flex w-full items-center justify-center gap-2 border border-[#ff003c]/50 bg-[#18060b] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ff6f93] transition-colors hover:bg-[#250911] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto" style={clipPathButton}><Trash2 className="h-4 w-4" /> 删除行</button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">日期</label>
                      <input type="date" value={row.date} onChange={(event) => onBatchRowChange(row.id, 'date', event.target.value)} className="w-full border border-[#333] bg-[#111] px-3 py-2 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">账号</label>
                      <AccountSelect value={row.accountName} onChange={(event) => onBatchRowChange(row.id, 'accountName', event.target.value)} gameAccounts={gameAccounts} />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">赛季</label>
                      <select value={row.season} onChange={(event) => onBatchRowChange(row.id, 'season', event.target.value)} className="w-full appearance-none border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{seasonOptions.map((season) => <option key={season} value={season}>{season}</option>)}</select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">类型</label>
                      <select value={row.queueType} onChange={(event) => onBatchRowChange(row.id, 'queueType', event.target.value)} className="w-full appearance-none border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{queueOptions.map((queueType) => <option key={queueType} value={queueType}>{queueType}</option>)}</select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">分路</label>
                      <select value={row.role} onChange={(event) => onBatchRowChange(row.id, 'role', event.target.value)} className="w-full appearance-none border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}</select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">结果</label>
                      <div className="flex gap-2">
                        <label className={`flex-1 cursor-pointer border px-3 py-2 text-center text-xs font-black uppercase tracking-[0.18em] transition-all ${row.result === '胜利' ? 'border-[#00f0ff] bg-[#00f0ff] text-black' : 'border-[#333] bg-[#111] text-[#00f0ff]/70 hover:border-[#00f0ff]/50'}`} style={clipPathButton}><input type="radio" className="hidden" name={`result-${row.id}`} value="胜利" checked={row.result === '胜利'} onChange={(event) => onBatchRowChange(row.id, 'result', event.target.value)} />胜利</label>
                        <label className={`flex-1 cursor-pointer border px-3 py-2 text-center text-xs font-black uppercase tracking-[0.18em] transition-all ${row.result === '失败' ? 'border-[#ff003c] bg-[#ff003c] text-white' : 'border-[#333] bg-[#111] text-[#ff6f93]/70 hover:border-[#ff003c]/50'}`} style={clipPathButton}><input type="radio" className="hidden" name={`result-${row.id}`} value="失败" checked={row.result === '失败'} onChange={(event) => onBatchRowChange(row.id, 'result', event.target.value)} />失败</label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#222] pt-4">
                    <TeammateSelector queueType={row.queueType} teammates={teammates} selectedIds={row.teammateIds || []} onToggle={(teammateId) => onBatchTeammateToggle(row.id, teammateId)} compact />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button type="button" onClick={onAddBatchRow} className="flex flex-1 items-center justify-center gap-2 border border-dashed border-[#00f0ff] bg-transparent py-3 text-xs font-bold uppercase tracking-widest text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/10"><PlusCircle className="h-4 w-4" /> 新增协议行 (ADD_ROW)</button>
              <button type="submit" disabled={isSubmitting || !hasGameAccounts} className="flex flex-1 items-center justify-center gap-2 bg-[#fcee0a] py-3 font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70" style={clipPathButton}><Upload className="h-4 w-4" /> 注入 {batchRows.length} 条数据</button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSingleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">TIMESTAMP_日期</label>
                <input type="date" name="date" value={formData.date} onChange={onInputChange} className="w-full border border-[#333] bg-[#050505] p-3 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]" required />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">ACCOUNT_游戏账号</label>
                <AccountSelect value={formData.accountName} onChange={(event) => onInputChange({ target: { name: 'accountName', value: event.target.value } })} gameAccounts={gameAccounts} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">SEASON_赛季</label>
                <select name="season" value={formData.season} onChange={onInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] p-3 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{seasonOptions.map((season) => <option key={season} value={season}>{season}</option>)}</select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">MODE_排位类型</label>
                <select name="queueType" value={formData.queueType} onChange={onInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] p-3 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{queueOptions.map((queueType) => <option key={queueType} value={queueType}>{queueType}</option>)}</select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">ROLE_分路</label>
                <select name="role" value={formData.role} onChange={onInputChange} className="w-full appearance-none border border-[#333] bg-[#050505] p-3 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]">{roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}</select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">STATUS_最终结果</label>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <label className={`flex-1 cursor-pointer border-2 py-4 text-center font-black uppercase tracking-widest transition-all ${formData.result === '胜利' ? 'border-[#00f0ff] bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'border-[#333] bg-[#050505] text-gray-600 hover:border-[#00f0ff]/50'}`} style={clipPathButton}><input type="radio" className="hidden" name="single-result" value="胜利" checked={formData.result === '胜利'} onChange={() => onInputChange({ target: { name: 'result', value: '胜利' } })} />VICTORY</label>
                <label className={`flex-1 cursor-pointer border-2 py-4 text-center font-black uppercase tracking-widest transition-all ${formData.result === '失败' ? 'border-[#ff003c] bg-[#ff003c] text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]' : 'border-[#333] bg-[#050505] text-gray-600 hover:border-[#ff003c]/50'}`} style={clipPathButton}><input type="radio" className="hidden" name="single-result" value="失败" checked={formData.result === '失败'} onChange={() => onInputChange({ target: { name: 'result', value: '失败' } })} />DEFEAT</label>
              </div>
            </div>

            <div className="border border-[#333] bg-[#0c0c0c] p-4" style={clipPathPanel}>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-[#00f0ff]"><Link2 className="h-4 w-4" /> 组队链路绑定</div>
              <TeammateSelector queueType={formData.queueType} teammates={teammates} selectedIds={formData.teammateIds || []} onToggle={onSingleTeammateToggle} />
            </div>

            <button type="submit" disabled={isSubmitting || !hasGameAccounts} className="mt-4 flex w-full items-center justify-center gap-2 bg-[#fcee0a] py-4 font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70" style={clipPathButton}><Users className="h-5 w-5" /> 写入数据库 (EXECUTE)</button>
          </form>
        )}
      </div>
    </div>
  );
}



