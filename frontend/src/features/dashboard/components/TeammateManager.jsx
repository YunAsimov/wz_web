import React from 'react';
import { Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { clipPathButton, clipPathPanel } from '../dashboardShared.js';

export default function TeammateManager({
  teammateOverview,
  teammateName,
  onTeammateNameChange,
  onCreate,
  onDelete,
  isSavingTeammate,
  deletingTeammateId,
  activeAccountName
}) {
  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <section className="relative border border-[#00f0ff] bg-[#111] p-6 shadow-[0_0_20px_rgba(0,240,255,0.08)]" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-2 w-28 bg-[#ff003c]" />
          <h2 className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-[0.22em] text-[#00f0ff]"><UserPlus className="h-5 w-5" /> 队友档案录入</h2>
          <form onSubmit={onCreate} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-gray-500">队友名称</label>
              <input type="text" value={teammateName} onChange={(event) => onTeammateNameChange(event.target.value)} className="w-full border border-[#333] bg-[#050505] px-4 py-3 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]" placeholder="输入经常一起组队的队友名" maxLength={50} required />
            </div>
            <button type="submit" disabled={isSavingTeammate} className="flex w-full items-center justify-center gap-2 bg-[#fcee0a] py-3 font-black uppercase tracking-[0.24em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70" style={clipPathButton}><Plus className="h-4 w-4" /> {isSavingTeammate ? '写入中' : '添加队友'}</button>
          </form>
          <div className="mt-6 border-t border-[#222] pt-4 text-xs uppercase tracking-[0.18em] text-gray-500">已登记的队友会出现在不同游戏账号的双排 / 三排 / 五排战绩录入复选框中。</div>
        </section>

        <section className="relative border border-[#333] bg-[#111] p-6" style={clipPathPanel}>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#222] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.22em] text-[#fcee0a]"><Users className="h-5 w-5" /> 固定队名册</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">查看当前账号视角内，每位队友的共战局数、胜率和常见组队队列</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00f0ff]">账号视角 // {activeAccountName}</p>
            </div>
            <div className="border border-[#333] bg-[#050505] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00f0ff]">TEAMMATES: {teammateOverview.length}</div>
          </div>

          {teammateOverview.length === 0 ? (
            <div className="border border-dashed border-[#333] bg-[#050505] px-4 py-10 text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-500">尚未登记固定队友</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {teammateOverview.map((teammate) => (
                <div key={teammate.id} className="border border-[#222] bg-[#050505] p-4" style={clipPathButton}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-white">{teammate.name}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#00f0ff]">常用队列 // {teammate.preferredQueue}</p>
                    </div>
                    <button type="button" onClick={() => onDelete(teammate.id)} disabled={deletingTeammateId === teammate.id} className="border border-[#ff003c]/40 bg-[#18060b] p-2 text-[#ff6f93] transition-colors hover:bg-[#250911] disabled:cursor-not-allowed disabled:opacity-50" title="删除队友"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.16em]">
                    <div className="border border-[#222] bg-[#111] px-3 py-3"><p className="text-gray-500">共战局数</p><p className="mt-2 text-2xl font-black text-[#fcee0a]">{teammate.matchCount}</p></div>
                    <div className="border border-[#222] bg-[#111] px-3 py-3"><p className="text-gray-500">绑定胜率</p><p className="mt-2 text-2xl font-black text-[#00f0ff]">{teammate.winRate}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
