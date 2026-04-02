import React from 'react';
import { Check, PencilLine, Plus, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { clipPathButton, clipPathPanel } from '../dashboardShared.js';

export default function GameAccountManager({
  gameAccounts,
  accountOverview,
  gameAccountName,
  onGameAccountNameChange,
  onCreate,
  onDelete,
  onStartEdit,
  editingGameAccountId,
  editingGameAccountName,
  onEditingGameAccountNameChange,
  onCancelEdit,
  onSaveEdit,
  isSavingGameAccount,
  isUpdatingGameAccount,
  deletingGameAccountId
}) {
  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <section className="relative border border-[#00f0ff] bg-[#111] p-6 shadow-[0_0_20px_rgba(0,240,255,0.08)]" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-2 w-28 bg-[#ff6f93]" />
          <h2 className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-[0.22em] text-[#00f0ff]"><UserRound className="h-5 w-5" /> 游戏账号录入</h2>
          <form onSubmit={onCreate} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-gray-500">账号名称</label>
              <input type="text" value={gameAccountName} onChange={(event) => onGameAccountNameChange(event.target.value)} className="w-full border border-[#333] bg-[#050505] px-4 py-3 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]" placeholder="输入游戏内账号名称" maxLength={80} required />
            </div>
            <button type="submit" disabled={isSavingGameAccount} className="flex w-full items-center justify-center gap-2 bg-[#fcee0a] py-3 font-black uppercase tracking-[0.24em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70" style={clipPathButton}><Plus className="h-4 w-4" /> {isSavingGameAccount ? '写入中' : '添加账号'}</button>
          </form>
          <div className="mt-6 border-t border-[#222] pt-4 text-xs uppercase tracking-[0.18em] text-gray-500">第一个添加的账号会自动标记为主账号，录入战绩时会优先默认选中。</div>
        </section>

        <section className="relative border border-[#333] bg-[#111] p-6" style={clipPathPanel}>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#222] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.22em] text-[#fcee0a]"><ShieldCheck className="h-5 w-5" /> 游戏账号名册</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">管理你常用的游戏账号，战绩录入和账号视角切换都会从这里读取。</p>
            </div>
            <div className="border border-[#333] bg-[#050505] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00f0ff]">ACCOUNTS: {gameAccounts.length}</div>
          </div>

          {accountOverview.length === 0 ? (
            <div className="border border-dashed border-[#333] bg-[#050505] px-4 py-10 text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-500">尚未登记游戏账号</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {accountOverview.map((account) => {
                const isEditing = editingGameAccountId === account.id;

                return (
                  <div key={account.id} className="border border-[#222] bg-[#050505] p-4" style={clipPathButton}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <form onSubmit={(event) => onSaveEdit(event, account.id)} className="space-y-3">
                            <input
                              type="text"
                              value={editingGameAccountName}
                              onChange={(event) => onEditingGameAccountNameChange(event.target.value)}
                              className="w-full border border-[#00f0ff] bg-[#111] px-3 py-2 text-base font-black text-white outline-none transition-colors focus:border-[#fcee0a]"
                              maxLength={80}
                              required
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button type="submit" disabled={isUpdatingGameAccount} className="flex items-center gap-2 border border-[#00f0ff] bg-[#03131a] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00f0ff] transition-colors hover:bg-[#08212c] disabled:cursor-not-allowed disabled:opacity-60" style={clipPathButton}><Check className="h-4 w-4" /> {isUpdatingGameAccount ? '保存中' : '保存'}</button>
                              <button type="button" onClick={onCancelEdit} disabled={isUpdatingGameAccount} className="flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-[#666] hover:text-white disabled:cursor-not-allowed disabled:opacity-60" style={clipPathButton}><X className="h-4 w-4" /> 取消</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-lg font-black text-white">{account.name}</p>
                              {account.isPrimary && <span className="border border-[#fcee0a] bg-[#fcee0a]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#fcee0a]">主账号</span>}
                            </div>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#00f0ff]">账号视角已启用</p>
                          </>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => onStartEdit(account)} className="border border-[#00f0ff]/40 bg-[#07131a] p-2 text-[#00f0ff] transition-colors hover:bg-[#0d1f29]" title="编辑账号"><PencilLine className="h-4 w-4" /></button>
                          <button type="button" onClick={() => onDelete(account.id)} disabled={deletingGameAccountId === account.id} className="border border-[#ff003c]/40 bg-[#18060b] p-2 text-[#ff6f93] transition-colors hover:bg-[#250911] disabled:cursor-not-allowed disabled:opacity-50" title="删除账号"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.16em]">
                      <div className="border border-[#222] bg-[#111] px-3 py-3"><p className="text-gray-500">战绩局数</p><p className="mt-2 text-2xl font-black text-[#fcee0a]">{account.matchCount}</p></div>
                      <div className="border border-[#222] bg-[#111] px-3 py-3"><p className="text-gray-500">账号胜率</p><p className="mt-2 text-2xl font-black text-[#00f0ff]">{account.winRate}%</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
