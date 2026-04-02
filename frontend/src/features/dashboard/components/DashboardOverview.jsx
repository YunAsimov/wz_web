import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Filter, Trophy, Users } from 'lucide-react';
import StatMiniCard from './StatMiniCard.jsx';
import { ALL_ACCOUNTS_LABEL, clipPathButton, clipPathPanel, pieColors } from '../dashboardShared.js';

function WinRateTooltip({ active, payload, label, accent, resolveTitle }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0];
  const title = resolveTitle ? resolveTitle(label, payload) : label;
  const value = point?.value ?? point?.payload?.winRate ?? point?.payload?.A ?? 0;

  return (
    <div className="border bg-[#050505] px-5 py-4 font-mono shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" style={{ borderColor: accent }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>{title}</p>
      <p className="mt-3 text-sm font-black text-white">胜率 {value}%</p>
    </div>
  );
}

export default function DashboardOverview({
  overallStats,
  stats,
  activeAccountName,
  teammatesCount,
  teammates,
  accountStats,
  selectedComboTeammateIds,
  onComboToggle,
  onClearComboSelection,
  selectedComboStats
}) {
  const hasComboSelection = selectedComboTeammateIds.length > 0;
  const selectedAccountLabel = activeAccountName || ALL_ACCOUNTS_LABEL;

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out] sm:space-y-6">
      <div className="relative flex flex-col justify-between gap-5 overflow-hidden border-l-4 border-[#fcee0a] bg-[#111] p-4 shadow-[8px_8px_0_rgba(255,0,60,0.2)] sm:gap-8 sm:p-6 md:flex-row md:items-center">
        <div className="absolute right-2 top-2 text-[10px] tracking-widest text-[#ff003c] opacity-50">OVERALL_STATS.EXE</div>
        <div className="flex items-center gap-6">
          <Trophy className="h-12 w-12 shrink-0 text-[#00f0ff] sm:h-16 sm:w-16" />
          <div>
            <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-500">账号胜率视图 (WIN RATE)</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#fcee0a] sm:text-6xl">{stats.winRate}%</span>
              <span className="break-all text-sm font-bold tracking-[0.18em] text-[#00f0ff] sm:text-base sm:tracking-widest">/ {stats.total}_MATCHES</span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ff6f93]">当前视角 // {selectedAccountLabel}</p>
          </div>
        </div>
        <div className="w-full max-w-md flex-1">
          <div className="mb-2 flex justify-between text-xs font-bold tracking-widest">
            <span className="text-[#00f0ff]">VICTORY: {stats.wins}</span>
            <span className="text-[#ff003c]">DEFEAT: {stats.total - stats.wins}</span>
          </div>
          <div className="flex h-3 w-full border border-[#333] bg-[#050505]">
            <div style={{ width: `${stats.winRate}%` }} className="h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            <div style={{ width: `${100 - stats.winRate}%` }} className="h-full bg-[#ff003c]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatMiniCard
          label="账号视角"
          value={selectedAccountLabel}
          hint={`已收录 ${accountStats.length} 个游戏账号`}
          accent="#ff6f93"
        />
        <StatMiniCard
          label="总体胜率"
          value={`${overallStats.winRate}%`}
          hint={`${overallStats.total} 局 / ${overallStats.accountCount} 个账号合并`}
          accent="#00ff66"
        />
        <StatMiniCard
          label="组队记录"
          value={`${stats.groupedMatches} 局`}
          hint={`占比 ${stats.total === 0 ? 0 : Math.round((stats.groupedMatches / stats.total) * 100)}%`}
          accent="#00f0ff"
        />
        <StatMiniCard
          label="组队胜率"
          value={`${stats.groupedWinRate}%`}
          hint={`单排/未标记 ${stats.soloWinRate}%`}
          accent="#fcee0a"
        />
        <StatMiniCard
          label="固定队档案"
          value={`${teammatesCount} 人`}
          hint={`${stats.teammateStats.length} 人已绑定对局`}
          accent="#ff003c"
        />
      </div>

      <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
        <div className="absolute left-0 top-0 h-full w-2 bg-[#ff6f93] transition-all group-hover:w-3" />
        <div className="ml-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#ff6f93]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#ff6f93]"># 多账号胜率扫描</h3>
        </div>
        <p className="ml-4 mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
          登录会话保持不变，只切换游戏账号视角；这里展示所有账号的局数和胜率对比。
        </p>
        <div className="ml-1 mt-4 h-80 sm:ml-2 sm:h-72">
          {accountStats.length === 0 ? (
            <div className="flex h-full items-center justify-center border border-dashed border-[#333] bg-[#050505] text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
              暂无账号战绩数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountStats} margin={{ top: 16, right: 20, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  cursor={{ fill: '#181818' }}
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #ff6f93', borderRadius: '0', color: '#ff6f93', fontFamily: 'monospace' }}
                  formatter={(value, name) => [name === 'winRate' ? `${value}%` : `${value} 局`, name === 'winRate' ? '胜率' : '局数']}
                  labelFormatter={(label, payload) => (payload?.[0] ? `${label} // 共 ${payload[0].payload.total} 局` : label)}
                />
                <Bar dataKey="winRate" barSize={28}>
                  {accountStats.map((item) => {
                    const isAllSelected = selectedAccountLabel === ALL_ACCOUNTS_LABEL;
                    const isActive = item.name === selectedAccountLabel;
                    const fill = isAllSelected ? '#ff6f93' : isActive ? '#fcee0a' : '#00f0ff';
                    return <Cell key={item.name} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
        <section className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#00ff66] transition-all group-hover:w-3" />
          <div className="ml-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00ff66]"># 指定队友组合胜率</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
                选择 1-4 名队友后，统计他们在当前账号视角里共同上场的对局表现；包含更大车队中的同时出现记录。
              </p>
            </div>
            {hasComboSelection && (
              <button
                type="button"
                onClick={onClearComboSelection}
                className="border border-[#ff003c]/50 bg-[#18060b] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff6f93] transition-colors hover:bg-[#250911]"
                style={clipPathButton}
              >
                清空组合
              </button>
            )}
          </div>

          <div className="ml-4 mt-5 flex flex-wrap gap-3">
            {teammates.length === 0 ? (
              <div className="border border-dashed border-[#333] bg-[#050505] px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
                暂无可选队友，先去队友管理录入名册
              </div>
            ) : (
              teammates.map((teammate) => {
                const selected = selectedComboTeammateIds.includes(teammate.id);
                return (
                  <button
                    key={teammate.id}
                    type="button"
                    onClick={() => onComboToggle(teammate.id)}
                    className={`border px-4 py-3 text-sm font-bold transition-all ${
                      selected
                        ? 'border-[#00ff66] bg-[#03130a] text-[#00ff66] shadow-[0_0_16px_rgba(0,255,102,0.12)]'
                        : 'border-[#333] bg-[#050505] text-gray-300 hover:border-[#00ff66]/50 hover:text-[#00ff66]'
                    }`}
                    style={clipPathButton}
                  >
                    {teammate.name}
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#fcee0a] transition-all group-hover:w-3" />
          <div className="ml-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#fcee0a]">
            <Users className="h-4 w-4" /> COMBO FEEDBACK
          </div>
          <div className="ml-4 mt-4 border border-[#222] bg-[#050505] p-4">
            <p className="text-sm font-black text-white">{selectedComboStats.label}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">{selectedComboStats.helperText}</p>
          </div>
          <div className="ml-4 mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.16em]">
            <div className="border border-[#222] bg-[#050505] px-3 py-3">
              <p className="text-gray-500">共同上场</p>
              <p className="mt-2 text-2xl font-black text-[#00ff66]">{selectedComboStats.total}</p>
            </div>
            <div className="border border-[#222] bg-[#050505] px-3 py-3">
              <p className="text-gray-500">组合胜率</p>
              <p className="mt-2 text-2xl font-black text-[#fcee0a]">{selectedComboStats.winRate}%</p>
            </div>
            <div className="border border-[#222] bg-[#050505] px-3 py-3">
              <p className="text-gray-500">精确阵容</p>
              <p className="mt-2 text-2xl font-black text-white">{selectedComboStats.exactMatchCount}</p>
            </div>
            <div className="border border-[#222] bg-[#050505] px-3 py-3">
              <p className="text-gray-500">主要队列</p>
              <p className="mt-2 text-2xl font-black text-[#ff6f93]">{selectedComboStats.preferredQueue}</p>
            </div>
          </div>
          <div className="ml-4 mt-4 flex items-center justify-between border-t border-[#222] pt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
            <span>已选人数: {selectedComboTeammateIds.length}</span>
            <span>覆盖队列: {selectedComboStats.queueSpread}</span>
          </div>
        </section>
      </div>

            <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
        <div className="absolute left-0 top-0 h-full w-2 bg-[#00f0ff] transition-all group-hover:w-3" />
        <div className="ml-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#00f0ff]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#00f0ff]"># 时间胜率趋势</h3>
        </div>
        <p className="ml-4 mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
          按日期展示当前账号视角下的单日胜率与累计胜率，便于观察近期波动和长期走势。
        </p>
        <div className="ml-1 mt-4 h-80 sm:ml-2 sm:h-72">
          {stats.timeWinRateStats.length === 0 ? (
            <div className="flex h-full items-center justify-center border border-dashed border-[#333] bg-[#050505] text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
              暂无时间维度战绩数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeWinRateStats} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="label" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #00f0ff', borderRadius: '0', color: '#00f0ff', fontFamily: 'monospace' }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'winRate' ? '单日胜率' : '累计胜率'
                  ]}
                  labelFormatter={(label, payload) => {
                    const point = payload?.[0]?.payload;
                    return point ? `${point.date} // ${point.total} 局 (${point.wins} 胜 / ${point.losses} 负)` : label;
                  }}
                />
                <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  name="单日胜率"
                  stroke="#00f0ff"
                  strokeWidth={3}
                  dot={{ fill: '#050505', stroke: '#00f0ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#00f0ff', stroke: '#050505' }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeWinRate"
                  name="累计胜率"
                  stroke="#fcee0a"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ fill: '#050505', stroke: '#fcee0a', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#fcee0a', stroke: '#050505' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">
        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#00f0ff] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-[#00f0ff]"># 赛季胜率矩阵</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.seasonStats} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={({ active, payload, label }) => <WinRateTooltip active={active} payload={payload} label={label} accent="#00f0ff" />} />
                <Line
                  type="step"
                  dataKey="winRate"
                  stroke="#00f0ff"
                  strokeWidth={3}
                  dot={{ fill: '#050505', stroke: '#00f0ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#fcee0a', stroke: '#050505' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#ff003c] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-[#ff003c]"># 分路效能雷达</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.roleStats}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="胜率" dataKey="A" stroke="#ff003c" strokeWidth={2} fill="#ff003c" fillOpacity={0.4} />
                <Tooltip content={({ active, payload, label }) => <WinRateTooltip active={active} payload={payload} label={label} accent="#ff003c" resolveTitle={(currentLabel, currentPayload) => currentPayload?.[0]?.payload?.subject || currentLabel} />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#fcee0a] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-[#fcee0a]"># 队列协议分析</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.queueStats} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip cursor={{ fill: '#222' }} content={({ active, payload, label }) => <WinRateTooltip active={active} payload={payload} label={label} accent="#fcee0a" />} />
                <Bar dataKey="winRate" fill="#fcee0a" barSize={30}>
                  {stats.queueStats.map((item, index) => (
                    <Cell
                      key={`queue-${item.name}-${index}`}
                      fill={item.winRate > 50 ? '#fcee0a' : item.winRate === 0 && item.total === 0 ? '#333' : '#ff003c'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#9d00ff] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-[#9d00ff]"># 分布占比扫描</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.rolePickStats} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                  {stats.rolePickStats.map((item, index) => (
                    <Cell key={`role-pick-${item.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #9d00ff', borderRadius: '0', color: '#fff', fontFamily: 'monospace' }} />
                <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#00ff66] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-[#00ff66]"># 队友胜率排行</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.teammateWinRateStats} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #00ff66', borderRadius: '0', color: '#00ff66', fontFamily: 'monospace' }}
                  formatter={(value, name) => [name === 'winRate' ? `${value}%` : value, name === 'winRate' ? '胜率' : '局数']}
                  labelFormatter={(label, payload) => (payload?.[0] ? `${label} // 共战 ${payload[0].payload.total} 局` : label)}
                />
                <Bar dataKey="winRate" fill="#00ff66" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#ffffff] transition-all group-hover:w-3" />
          <h3 className="ml-4 mb-4 text-sm font-bold uppercase tracking-widest text-white"># 共战频次排行</h3>
          <div className="ml-1 h-64 sm:ml-2 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.teammateFrequencyStats} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff', borderRadius: '0', color: '#ffffff', fontFamily: 'monospace' }}
                  formatter={(value, name) => [name === 'total' ? `${value} 局` : `${value}%`, name === 'total' ? '共战局数' : '胜率']}
                />
                <Bar dataKey="total" fill="#ffffff" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative border border-[#333] bg-[#111] p-4 sm:p-5 xl:col-span-2" style={clipPathPanel}>
          <div className="absolute left-0 top-0 h-full w-2 bg-[#00f0ff] transition-all group-hover:w-3" />
          <div className="ml-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#00f0ff]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#00f0ff]"># 常用队友组合排行</h3>
          </div>
          <p className="ml-4 mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">
            统计当前账号视角下每套固定队友组合出现的频次，适合观察最常一起排位的搭档结构。
          </p>
          <div className="ml-1 mt-4 h-80 sm:ml-2 sm:h-72">
            {stats.comboFrequencyStats.length === 0 ? (
              <div className="flex h-full items-center justify-center border border-dashed border-[#333] bg-[#050505] text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
                暂无组合记录
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.comboFrequencyStats} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="shortLabel" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} width={160} />
                  <Tooltip
                    cursor={{ fill: '#151515' }}
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #00f0ff', borderRadius: '0', color: '#00f0ff', fontFamily: 'monospace' }}
                    formatter={(value, name) => [name === 'total' ? `${value} 局` : `${value}%`, name === 'total' ? '共战频次' : '胜率']}
                    labelFormatter={(label, payload) => {
                      const combo = payload?.[0]?.payload;
                      return combo ? `${combo.label} // 常用 ${combo.preferredQueue}` : label;
                    }}
                  />
                  <Bar dataKey="total" fill="#00f0ff" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



