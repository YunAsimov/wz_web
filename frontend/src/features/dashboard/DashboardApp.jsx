import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Gamepad2, History, Terminal, Upload, Users } from 'lucide-react';
import {
  createGameAccount,
  createMatch,
  createMatchesBatch,
  createTeammate,
  deleteGameAccount,
  deleteMatch,
  deleteTeammate,
  fetchGameAccounts,
  fetchMatches,
  fetchTeammates,
  updateGameAccount,
  updateMatch
} from '../../shared/api/client.js';
import DashboardOverview from './components/DashboardOverview.jsx';
import GameAccountManager from './components/GameAccountManager.jsx';
import ImportPanel from './components/ImportPanel.jsx';
import LogsPanel from './components/LogsPanel.jsx';
import TeammateManager from './components/TeammateManager.jsx';
import {
  ALL_ACCOUNTS_LABEL,
  ALL_ACCOUNTS_VALUE,
  buildDefaultMatch,
  buildEditableAccountOptions,
  buildMatchFormFromMatch,
  buildScopeAccountNames,
  buildTeammateGroupLabel,
  buildToggleResult,
  clipPathButton,
  formatTeammateNames,
  matchHasAllTeammates,
  matchHasAnyTeammate,
  normalizeAccountName,
  pieColors,
  queueOptions,
  roleOptions,
  seasonOptions,
  resolvePrimaryAccountName,
  sortByName,
  sortGameAccounts,
  trimTeammatesForQueue,
  truncateLabel
} from './dashboardShared.js';

const createBatchRow = (accountName = '', suffix = 0) => ({
  ...buildDefaultMatch(accountName),
  id: Date.now() + suffix
});

const resolveDraftAccountName = (activeAccountName, managedAccountNames, primaryAccountName) => {
  if (activeAccountName !== ALL_ACCOUNTS_VALUE && managedAccountNames.includes(activeAccountName)) {
    return activeAccountName;
  }

  return primaryAccountName || managedAccountNames[0] || '';
};

export default function DashboardApp() {
  const [matches, setMatches] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [gameAccounts, setGameAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAccountName, setActiveAccountName] = useState(ALL_ACCOUNTS_VALUE);
  const [inputMode, setInputMode] = useState('single');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false);
  const [isSavingTeammate, setIsSavingTeammate] = useState(false);
  const [isSavingGameAccount, setIsSavingGameAccount] = useState(false);
  const [deletingTeammateId, setDeletingTeammateId] = useState(null);
  const [deletingGameAccountId, setDeletingGameAccountId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [teammateName, setTeammateName] = useState('');
  const [gameAccountName, setGameAccountName] = useState('');
  const [editingGameAccountId, setEditingGameAccountId] = useState(null);
  const [editingGameAccountName, setEditingGameAccountName] = useState('');
  const [isUpdatingGameAccount, setIsUpdatingGameAccount] = useState(false);
  const [selectedComboTeammateIds, setSelectedComboTeammateIds] = useState([]);
  const [logFilterTeammateIds, setLogFilterTeammateIds] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [formData, setFormData] = useState(buildDefaultMatch());
  const [batchRows, setBatchRows] = useState([createBatchRow()]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [matchData, teammateData, gameAccountData] = await Promise.all([fetchMatches(), fetchTeammates(), fetchGameAccounts()]);
        setMatches(matchData);
        setTeammates(sortByName(teammateData));
        setGameAccounts(sortGameAccounts(gameAccountData));
      } catch (error) {
        setErrorMessage(error.message || '读取后端数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedMatches = useMemo(
    () =>
      matches.map((match) => {
        const normalizedTeammates = sortByName(match.teammates || []);
        return {
          ...match,
          accountName: normalizeAccountName(match.accountName),
          teammates: normalizedTeammates,
          teammateIds: normalizedTeammates.map((teammate) => teammate.id)
        };
      }),
    [matches]
  );

  const managedAccountNames = useMemo(() => sortGameAccounts(gameAccounts).map((account) => account.name), [gameAccounts]);
  const primaryAccountName = useMemo(() => resolvePrimaryAccountName(gameAccounts), [gameAccounts]);
  const matchAccountNames = useMemo(
    () => [...new Set(normalizedMatches.map((match) => normalizeAccountName(match.accountName)))],
    [normalizedMatches]
  );
  const scopeAccountNames = useMemo(() => buildScopeAccountNames(gameAccounts, matchAccountNames), [gameAccounts, matchAccountNames]);
  const currentAccountLabel = activeAccountName === ALL_ACCOUNTS_VALUE ? ALL_ACCOUNTS_LABEL : activeAccountName;

  useEffect(() => {
    const nextDraftAccountName = resolveDraftAccountName(activeAccountName, managedAccountNames, primaryAccountName);

    setFormData((prev) => {
      const nextAccountName = managedAccountNames.length === 0
        ? ''
        : managedAccountNames.includes(prev.accountName)
          ? prev.accountName
          : nextDraftAccountName;

      if (prev.accountName === nextAccountName) {
        return prev;
      }

      return { ...prev, accountName: nextAccountName };
    });

    setBatchRows((rows) =>
      rows.map((row) => {
        const nextAccountName = managedAccountNames.length === 0
          ? ''
          : managedAccountNames.includes(row.accountName)
            ? row.accountName
            : nextDraftAccountName;

        return row.accountName === nextAccountName ? row : { ...row, accountName: nextAccountName };
      })
    );
  }, [activeAccountName, managedAccountNames, primaryAccountName]);

  useEffect(() => {
    if (activeAccountName !== ALL_ACCOUNTS_VALUE && !scopeAccountNames.includes(activeAccountName)) {
      setActiveAccountName(ALL_ACCOUNTS_VALUE);
    }
  }, [activeAccountName, scopeAccountNames]);

  const accountStats = useMemo(
    () =>
      scopeAccountNames.map((accountName) => {
        const accountMatches = normalizedMatches.filter((match) => match.accountName === accountName);
        const wins = accountMatches.filter((match) => match.result === '胜利').length;
        const queueCounts = accountMatches.reduce((accumulator, match) => {
          accumulator[match.queueType] = (accumulator[match.queueType] || 0) + 1;
          return accumulator;
        }, {});
        const accountRecord = gameAccounts.find((account) => account.name === accountName);

        return {
          id: accountRecord?.id || `scope-${accountName}`,
          name: accountName,
          isPrimary: accountRecord?.isPrimary || false,
          total: accountMatches.length,
          wins,
          winRate: accountMatches.length === 0 ? 0 : Math.round((wins / accountMatches.length) * 100),
          preferredQueue: Object.entries(queueCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || '未绑定'
        };
      }),
    [gameAccounts, normalizedMatches, scopeAccountNames]
  );

  const overallStats = useMemo(() => {
    const total = normalizedMatches.length;
    const wins = normalizedMatches.filter((match) => match.result === '胜利').length;
    return {
      total,
      wins,
      winRate: total === 0 ? 0 : Math.round((wins / total) * 100),
      accountCount: scopeAccountNames.length
    };
  }, [normalizedMatches, scopeAccountNames.length]);

  const scopedMatches = useMemo(() => {
    if (activeAccountName === ALL_ACCOUNTS_VALUE) {
      return normalizedMatches;
    }

    return normalizedMatches.filter((match) => match.accountName === activeAccountName);
  }, [activeAccountName, normalizedMatches]);

  const stats = useMemo(() => {
    const total = scopedMatches.length;
    const wins = scopedMatches.filter((match) => match.result === '胜利').length;
    const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

    const queueStats = queueOptions.map((queueType) => {
      const queueMatches = scopedMatches.filter((match) => match.queueType === queueType);
      const queueWins = queueMatches.filter((match) => match.result === '胜利').length;
      return {
        name: queueType,
        total: queueMatches.length,
        winRate: queueMatches.length === 0 ? 0 : Math.round((queueWins / queueMatches.length) * 100)
      };
    });

    const roleStats = roleOptions.map((role) => {
      const roleMatches = scopedMatches.filter((match) => match.role === role);
      const roleWins = roleMatches.filter((match) => match.result === '胜利').length;
      return {
        subject: role,
        A: roleMatches.length === 0 ? 0 : Math.round((roleWins / roleMatches.length) * 100),
        total: roleMatches.length,
        fullMark: 100
      };
    });

    const seasonStats = seasonOptions
      .map((season) => {
        const seasonMatches = scopedMatches.filter((match) => match.season === season);
        const seasonWins = seasonMatches.filter((match) => match.result === '胜利').length;
        return {
          name: season,
          total: seasonMatches.length,
          winRate: seasonMatches.length === 0 ? 0 : Math.round((seasonWins / seasonMatches.length) * 100)
        };
      })
      .filter((season) => season.total > 0);

    const dailyTimeline = Array.from(
      scopedMatches.reduce((accumulator, match) => {
        const current = accumulator.get(match.date) || {
          date: match.date,
          label: match.date.slice(5),
          total: 0,
          wins: 0
        };

        current.total += 1;
        if (match.result === '胜利') {
          current.wins += 1;
        }

        accumulator.set(match.date, current);
        return accumulator;
      }, new Map()).values()
    ).sort((left, right) => left.date.localeCompare(right.date));

    let cumulativeWins = 0;
    let cumulativeTotal = 0;
    const timeWinRateStats = dailyTimeline.map((item) => {
      cumulativeWins += item.wins;
      cumulativeTotal += item.total;

      return {
        ...item,
        losses: item.total - item.wins,
        winRate: item.total === 0 ? 0 : Math.round((item.wins / item.total) * 100),
        cumulativeWinRate: cumulativeTotal === 0 ? 0 : Math.round((cumulativeWins / cumulativeTotal) * 100)
      };
    });

    const rolePickStats = roleStats
      .map((item) => ({ name: item.subject, value: item.total }))
      .filter((item) => item.value > 0);

    const groupedMatches = scopedMatches.filter((match) => match.teammates.length > 0);
    const groupedWins = groupedMatches.filter((match) => match.result === '胜利').length;
    const groupedWinRate = groupedMatches.length === 0 ? 0 : Math.round((groupedWins / groupedMatches.length) * 100);
    const soloMatches = scopedMatches.filter((match) => match.teammates.length === 0);
    const soloWins = soloMatches.filter((match) => match.result === '胜利').length;
    const soloWinRate = soloMatches.length === 0 ? 0 : Math.round((soloWins / soloMatches.length) * 100);

    const teammateStatsMap = new Map();
    for (const match of scopedMatches) {
      for (const teammate of match.teammates) {
        const current = teammateStatsMap.get(teammate.id) || {
          id: teammate.id,
          name: teammate.name,
          total: 0,
          wins: 0,
          queues: {}
        };
        current.total += 1;
        if (match.result === '胜利') {
          current.wins += 1;
        }
        current.queues[match.queueType] = (current.queues[match.queueType] || 0) + 1;
        teammateStatsMap.set(teammate.id, current);
      }
    }

    const teammateStats = Array.from(teammateStatsMap.values()).map((item) => {
      const preferredQueue = Object.entries(item.queues).sort((left, right) => right[1] - left[1])[0]?.[0] || '未绑定';
      return {
        ...item,
        preferredQueue,
        winRate: item.total === 0 ? 0 : Math.round((item.wins / item.total) * 100)
      };
    });

    const teammateWinRateStats = [...teammateStats]
      .sort((left, right) => right.winRate - left.winRate || right.total - left.total)
      .slice(0, 6)
      .map((item) => ({ name: item.name, winRate: item.winRate, total: item.total }));

    const teammateFrequencyStats = [...teammateStats]
      .sort((left, right) => right.total - left.total || right.wins - left.wins)
      .slice(0, 6)
      .map((item) => ({ name: item.name, total: item.total, winRate: item.winRate }));

    const comboStatsMap = new Map();
    for (const match of groupedMatches) {
      const comboKey = match.teammateIds.join('-');
      const current = comboStatsMap.get(comboKey) || {
        key: comboKey,
        ids: match.teammateIds,
        label: buildTeammateGroupLabel(match.teammates),
        memberCount: match.teammates.length,
        total: 0,
        wins: 0,
        queues: {}
      };
      current.total += 1;
      if (match.result === '胜利') {
        current.wins += 1;
      }
      current.queues[match.queueType] = (current.queues[match.queueType] || 0) + 1;
      comboStatsMap.set(comboKey, current);
    }

    const comboStats = Array.from(comboStatsMap.values()).map((item) => {
      const preferredQueue = Object.entries(item.queues).sort((left, right) => right[1] - left[1])[0]?.[0] || '未绑定';
      return {
        ...item,
        preferredQueue,
        winRate: item.total === 0 ? 0 : Math.round((item.wins / item.total) * 100)
      };
    });

    const comboFrequencyStats = [...comboStats]
      .sort((left, right) => right.total - left.total || right.winRate - left.winRate || left.label.localeCompare(right.label, 'zh-CN'))
      .slice(0, 6)
      .map((item) => ({
        ...item,
        shortLabel: truncateLabel(item.label, 20)
      }));

    return {
      total,
      wins,
      winRate,
      queueStats,
      roleStats,
      seasonStats,
      timeWinRateStats,
      rolePickStats,
      groupedMatches: groupedMatches.length,
      groupedWinRate,
      soloMatches: soloMatches.length,
      soloWinRate,
      teammateStats,
      teammateWinRateStats,
      teammateFrequencyStats,
      comboStats,
      comboFrequencyStats,
      pieColors
    };
  }, [scopedMatches]);

  const selectedComboStats = useMemo(() => {
    const selectedTeammates = sortByName(teammates.filter((teammate) => selectedComboTeammateIds.includes(teammate.id)));

    if (!selectedTeammates.length) {
      return {
        label: '未选择组合',
        total: 0,
        wins: 0,
        winRate: 0,
        exactMatchCount: 0,
        preferredQueue: '未选择',
        queueSpread: 0,
        helperText: `选择 1-4 名队友后，统计他们在${currentAccountLabel}视角中的共同上场胜率`,
        selectedNames: []
      };
    }

    const selectedIds = selectedTeammates.map((teammate) => teammate.id);
    const relatedMatches = scopedMatches.filter((match) => matchHasAllTeammates(match, selectedIds));
    const wins = relatedMatches.filter((match) => match.result === '胜利').length;
    const queueCounts = relatedMatches.reduce((accumulator, match) => {
      accumulator[match.queueType] = (accumulator[match.queueType] || 0) + 1;
      return accumulator;
    }, {});
    const exactMatchCount = relatedMatches.filter((match) => match.teammateIds.length === selectedIds.length).length;
    const preferredQueue = Object.entries(queueCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || '暂无';
    const queueSpread = Object.values(queueCounts).filter((count) => count > 0).length;

    return {
      label: selectedTeammates.map((teammate) => teammate.name).join(' + '),
      total: relatedMatches.length,
      wins,
      winRate: relatedMatches.length === 0 ? 0 : Math.round((wins / relatedMatches.length) * 100),
      exactMatchCount,
      preferredQueue,
      queueSpread,
      helperText:
        relatedMatches.length === 0
          ? `在${currentAccountLabel}视角下未找到这些队友共同上场的记录`
          : `统计口径为${currentAccountLabel}视角下的共同上场，包含更大车队中的同时出现记录`,
      selectedNames: selectedTeammates.map((teammate) => teammate.name)
    };
  }, [currentAccountLabel, scopedMatches, selectedComboTeammateIds, teammates]);

  const teammateOverview = useMemo(
    () =>
      teammates.map((teammate) => {
        const teammateStat = stats.teammateStats.find((item) => item.id === teammate.id);
        return {
          ...teammate,
          matchCount: teammateStat?.total || 0,
          winRate: teammateStat?.winRate || 0,
          preferredQueue: teammateStat?.preferredQueue || '未绑定'
        };
      }),
    [stats.teammateStats, teammates]
  );

  const accountOverview = useMemo(
    () =>
      sortGameAccounts(gameAccounts).map((account) => {
        const accountStat = accountStats.find((item) => item.name === account.name);
        return {
          ...account,
          matchCount: accountStat?.total || 0,
          winRate: accountStat?.winRate || 0
        };
      }),
    [accountStats, gameAccounts]
  );

  const filteredLogMatches = useMemo(() => {
    if (!logFilterTeammateIds.length) {
      return scopedMatches;
    }

    return scopedMatches.filter((match) => matchHasAnyTeammate(match, logFilterTeammateIds));
  }, [logFilterTeammateIds, scopedMatches]);

  const editAccountOptions = useMemo(
    () => buildEditableAccountOptions(gameAccounts, editFormData?.accountName),
    [editFormData?.accountName, gameAccounts]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      if (name === 'queueType') {
        return { ...prev, queueType: value, teammateIds: trimTeammatesForQueue(value, prev.teammateIds) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSingleTeammateToggle = (teammateId) => {
    setFormData((prev) => {
      const { nextIds, error } = buildToggleResult(prev.queueType, prev.teammateIds, teammateId);
      if (error) {
        setErrorMessage(error);
        return prev;
      }
      setErrorMessage('');
      return { ...prev, teammateIds: nextIds };
    });
  };

  const handleAddMatch = async (event) => {
    event.preventDefault();
    if (!managedAccountNames.length) {
      setErrorMessage('请先在游戏账号模块中添加账号');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const newMatch = await createMatch(formData);
      setMatches((prev) => [newMatch, ...prev]);
      setFormData(buildDefaultMatch(resolveDraftAccountName(activeAccountName, managedAccountNames, primaryAccountName)));
      setActiveTab('logs');
    } catch (error) {
      setErrorMessage(error.message || '新增记录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchRowChange = (id, field, value) => {
    setBatchRows((rows) =>
      rows.map((row) => {
        if (row.id !== id) {
          return row;
        }
        if (field === 'queueType') {
          return { ...row, queueType: value, teammateIds: trimTeammatesForQueue(value, row.teammateIds) };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleBatchTeammateToggle = (rowId, teammateId) => {
    let nextError = '';
    setBatchRows((rows) =>
      rows.map((row, index) => {
        if (row.id !== rowId) {
          return row;
        }
        const { nextIds, error } = buildToggleResult(row.queueType, row.teammateIds, teammateId);
        if (error) {
          nextError = `第 ${index + 1} 行：${error}`;
          return row;
        }
        return { ...row, teammateIds: nextIds };
      })
    );
    setErrorMessage(nextError);
  };

  const handleAddBatchRow = () => {
    const fallbackAccountName = resolveDraftAccountName(activeAccountName, managedAccountNames, primaryAccountName);
    const lastRow = batchRows[batchRows.length - 1] || buildDefaultMatch(fallbackAccountName);
    setBatchRows((rows) => [...rows, { ...lastRow, teammateIds: [...(lastRow.teammateIds || [])], id: Date.now() + rows.length }]);
  };

  const handleRemoveBatchRow = (id) => {
    if (batchRows.length > 1) {
      setBatchRows((rows) => rows.filter((row) => row.id !== id));
    }
  };

  const handleBatchSubmit = async (event) => {
    event.preventDefault();
    if (!managedAccountNames.length) {
      setErrorMessage('请先在游戏账号模块中添加账号');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload = batchRows.map(({ id, ...row }) => row);
      const createdMatches = await createMatchesBatch(payload);
      setMatches((prev) => [...createdMatches, ...prev]);
      setBatchRows([createBatchRow(resolveDraftAccountName(activeAccountName, managedAccountNames, primaryAccountName))]);
      setInputMode('single');
      setActiveTab('logs');
    } catch (error) {
      setErrorMessage(error.message || '批量导入失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditMatch = (match) => {
    setEditingMatchId(match.id);
    setEditFormData(buildMatchFormFromMatch(match));
    setErrorMessage('');
  };

  const handleCancelEditMatch = () => {
    setEditingMatchId(null);
    setEditFormData(null);
    setErrorMessage('');
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => {
      if (!prev) {
        return prev;
      }
      if (name === 'queueType') {
        return { ...prev, queueType: value, teammateIds: trimTeammatesForQueue(value, prev.teammateIds) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditTeammateToggle = (teammateId) => {
    setEditFormData((prev) => {
      if (!prev) {
        return prev;
      }
      const { nextIds, error } = buildToggleResult(prev.queueType, prev.teammateIds, teammateId);
      if (error) {
        setErrorMessage(error);
        return prev;
      }
      setErrorMessage('');
      return { ...prev, teammateIds: nextIds };
    });
  };

  const handleUpdateMatch = async (event) => {
    event.preventDefault();
    if (!editingMatchId || !editFormData) {
      return;
    }

    setIsUpdatingMatch(true);
    setErrorMessage('');
    try {
      const updatedMatch = await updateMatch(editingMatchId, editFormData);
      setMatches((prev) => prev.map((match) => (match.id === editingMatchId ? updatedMatch : match)));
      setEditingMatchId(null);
      setEditFormData(null);
    } catch (error) {
      setErrorMessage(error.message || '更新记录失败');
    } finally {
      setIsUpdatingMatch(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    setErrorMessage('');
    try {
      await deleteMatch(id);
      setMatches((prev) => prev.filter((match) => match.id !== id));
      if (editingMatchId === id) {
        setEditingMatchId(null);
        setEditFormData(null);
      }
    } catch (error) {
      setErrorMessage(error.message || '删除记录失败');
    } finally {
      setSelectedComboTeammateIds((prev) => prev.filter((teammateId) => teammates.some((teammate) => teammate.id === teammateId)));
    }
  };

  const handleCreateTeammate = async (event) => {
    event.preventDefault();
    setIsSavingTeammate(true);
    setErrorMessage('');
    try {
      const savedTeammate = await createTeammate({ name: teammateName });
      setTeammates((prev) => sortByName([...prev, savedTeammate]));
      setTeammateName('');
    } catch (error) {
      setErrorMessage(error.message || '添加队友失败');
    } finally {
      setIsSavingTeammate(false);
    }
  };

  const handleDeleteTeammate = async (id) => {
    setDeletingTeammateId(id);
    setErrorMessage('');
    try {
      await deleteTeammate(id);
      setTeammates((prev) => prev.filter((teammate) => teammate.id !== id));
      setMatches((prev) => prev.map((match) => ({ ...match, teammates: (match.teammates || []).filter((teammate) => teammate.id !== id) })));
      setFormData((prev) => ({ ...prev, teammateIds: (prev.teammateIds || []).filter((teammateId) => teammateId !== id) }));
      setBatchRows((rows) => rows.map((row) => ({ ...row, teammateIds: (row.teammateIds || []).filter((teammateId) => teammateId !== id) })));
      setSelectedComboTeammateIds((prev) => prev.filter((teammateId) => teammateId !== id));
      setLogFilterTeammateIds((prev) => prev.filter((teammateId) => teammateId !== id));
      setEditFormData((prev) => (prev ? { ...prev, teammateIds: (prev.teammateIds || []).filter((teammateId) => teammateId !== id) } : prev));
    } catch (error) {
      setErrorMessage(error.message || '删除队友失败');
    } finally {
      setDeletingTeammateId(null);
    }
  };

  const handleStartEditGameAccount = (account) => {
    setEditingGameAccountId(account.id);
    setEditingGameAccountName(account.name);
    setErrorMessage('');
  };

  const handleCancelEditGameAccount = () => {
    setEditingGameAccountId(null);
    setEditingGameAccountName('');
    setIsUpdatingGameAccount(false);
  };

  const handleCreateGameAccount = async (event) => {
    event.preventDefault();
    setIsSavingGameAccount(true);
    setErrorMessage('');
    try {
      const savedAccount = await createGameAccount({ name: gameAccountName });
      setGameAccounts((prev) => sortGameAccounts([...prev, savedAccount]));
      setGameAccountName('');
    } catch (error) {
      setErrorMessage(error.message || '添加游戏账号失败');
    } finally {
      setIsSavingGameAccount(false);
    }
  };

  const handleUpdateGameAccount = async (event, id) => {
    event.preventDefault();
    setIsUpdatingGameAccount(true);
    setErrorMessage('');

    const currentAccount = gameAccounts.find((account) => account.id === id);
    if (!currentAccount) {
      setErrorMessage('游戏账号不存在');
      setIsUpdatingGameAccount(false);
      return;
    }

    try {
      const updatedAccount = await updateGameAccount(id, { name: editingGameAccountName });
      const previousName = currentAccount.name;
      const nextName = updatedAccount.name;

      setGameAccounts((prev) => sortGameAccounts(prev.map((account) => (account.id === id ? updatedAccount : account))));
      setMatches((prev) => prev.map((match) => (match.accountName === previousName ? { ...match, accountName: nextName } : match)));
      setFormData((prev) => (prev.accountName === previousName ? { ...prev, accountName: nextName } : prev));
      setBatchRows((rows) => rows.map((row) => (row.accountName === previousName ? { ...row, accountName: nextName } : row)));
      setEditFormData((prev) => (prev && prev.accountName === previousName ? { ...prev, accountName: nextName } : prev));
      setActiveAccountName((prev) => (prev === previousName ? nextName : prev));
      setEditingGameAccountId(null);
      setEditingGameAccountName('');
    } catch (error) {
      setErrorMessage(error.message || '更新游戏账号失败');
    } finally {
      setIsUpdatingGameAccount(false);
    }
  };

  const handleDeleteGameAccount = async (id) => {
    setDeletingGameAccountId(id);
    setErrorMessage('');
    try {
      await deleteGameAccount(id);
      setGameAccounts((prev) => sortGameAccounts(prev.filter((account) => account.id !== id)));
      if (editingGameAccountId === id) {
        handleCancelEditGameAccount();
      }
    } catch (error) {
      setErrorMessage(error.message || '删除游戏账号失败');
    } finally {
      setDeletingGameAccountId(null);
    }
  };

  const handleComboTeammateToggle = (teammateId) => {
    setSelectedComboTeammateIds((prev) => {
      if (prev.includes(teammateId)) {
        setErrorMessage('');
        return prev.filter((id) => id !== teammateId);
      }

      if (prev.length >= 4) {
        setErrorMessage('组合分析最多选择 4 名队友');
        return prev;
      }

      setErrorMessage('');
      return [...prev, teammateId];
    });
  };

  const handleClearComboSelection = () => {
    setSelectedComboTeammateIds([]);
  };

  const handleLogFilterToggle = (teammateId) => {
    setLogFilterTeammateIds((prev) => (prev.includes(teammateId) ? prev.filter((id) => id !== teammateId) : [...prev, teammateId]));
  };

  const handleClearLogFilters = () => {
    setLogFilterTeammateIds([]);
  };

  const accountTabs = [
    { value: ALL_ACCOUNTS_VALUE, label: ALL_ACCOUNTS_LABEL },
    ...scopeAccountNames.map((accountName) => ({ value: accountName, label: accountName }))
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-mono text-[#e0e0e0] selection:bg-[#00f0ff] selection:text-black">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10 mx-auto max-w-[1480px] space-y-5 px-3 pb-5 pt-32 sm:space-y-6 sm:px-4 sm:pb-6 sm:pt-36 md:px-8 md:pb-8 md:pt-40">
        <header className="relative flex flex-col gap-5 border-b-2 border-[#ff003c] pb-3 md:flex-row md:items-end md:justify-between">
          <div className="absolute right-0 top-0 h-2 w-24 bg-[#fcee0a] sm:w-32" />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-[#fcee0a] p-2 text-black shadow-[4px_4px_0px_#ff003c] sm:p-2.5">
              <Terminal className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[2rem] font-black uppercase leading-none tracking-tighter text-[#00f0ff] drop-shadow-[2px_2px_0_#ff003c] sm:text-4xl">HOK_NEXUS_OS</h1>
              <p className="mt-1 inline-block max-w-full break-words bg-black px-1 text-[10px] font-bold tracking-[0.24em] text-[#fcee0a] sm:text-xs sm:tracking-[0.3em]">SYSTEM.VERSION.2077 // TEAM_LINK_DASHBOARD</p>
            </div>
          </div>
          <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
            <nav className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">{[{ id: 'dashboard', label: '数据矩阵', icon: Activity }, { id: 'import', label: '接入端口', icon: Upload }, { id: 'logs', label: '作战档案', icon: History }, { id: 'teammates', label: '队友管理', icon: Users }, { id: 'accounts', label: '游戏账号', icon: Gamepad2 }].map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 border-l-2 border-r-2 border-t-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-all sm:px-6 sm:py-2.5 sm:text-sm sm:tracking-widest ${activeTab === tab.id ? 'border-[#fcee0a] bg-[#fcee0a] text-black shadow-[0_0_15px_rgba(252,238,10,0.4)]' : 'border-[#00f0ff]/30 bg-[#111] text-[#00f0ff] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10'}`} style={clipPathButton}><tab.icon className="h-4 w-4" />{tab.label}</button>)}</nav>
          </div>
        </header>

        <section className="relative border border-[#333] bg-[#0c0c0c] p-4 shadow-[0_0_20px_rgba(0,240,255,0.04)] sm:p-5" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
          <div className="absolute left-0 top-0 h-full w-1.5 bg-[#ff6f93] sm:w-2" />
          <div className="ml-3 flex flex-col gap-4 sm:ml-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6f93] sm:text-sm sm:tracking-[0.22em]">ACCOUNT_SCOPE // 游戏账号视角切换</div>
              <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-[0.14em] text-gray-500 sm:text-xs sm:tracking-[0.16em]">切换这里不会退出当前后台登录，只会改变战绩列表、统计图表和队友数据的查看范围。</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-gray-400 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
              <span className="border border-[#333] bg-[#050505] px-3 py-2">当前视角: {currentAccountLabel}</span>
              <span className="border border-[#333] bg-[#050505] px-3 py-2">账号总数: {scopeAccountNames.length}</span>
            </div>
          </div>
          <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
            <div className="ml-3 flex min-w-max gap-3 sm:ml-4 sm:min-w-0 sm:flex-wrap">
              {accountTabs.map((accountTab) => {
                const selected = activeAccountName === accountTab.value;
                return (
                  <button
                    key={accountTab.value}
                    type="button"
                    onClick={() => setActiveAccountName(accountTab.value)}
                    className={`shrink-0 border px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:py-3 sm:text-sm ${selected ? 'border-[#ff6f93] bg-[#1a0810] text-[#ff6f93] shadow-[0_0_16px_rgba(255,111,147,0.15)]' : 'border-[#333] bg-[#050505] text-gray-300 hover:border-[#ff6f93]/50 hover:text-[#ff6f93]'}`}
                    style={clipPathButton}
                  >
                    {accountTab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {errorMessage && <div className="border border-[#ff003c] bg-[#22020a] px-4 py-3 text-sm font-bold tracking-wide text-[#ff8aa3]">SYSTEM_ALERT // {errorMessage}</div>}
        {isLoading && <div className="border border-[#00f0ff] bg-[#071318] px-4 py-3 text-sm font-bold tracking-wide text-[#00f0ff]">SYNCING // 正在同步战绩、队友与账号数据库...</div>}

        {activeTab === 'dashboard' && <DashboardOverview overallStats={overallStats} stats={stats} activeAccountName={currentAccountLabel} teammatesCount={teammates.length} teammates={teammates} accountStats={accountStats} selectedComboTeammateIds={selectedComboTeammateIds} onComboToggle={handleComboTeammateToggle} onClearComboSelection={handleClearComboSelection} selectedComboStats={selectedComboStats} />}
        {activeTab === 'import' && <ImportPanel inputMode={inputMode} onModeChange={setInputMode} formData={formData} onInputChange={handleInputChange} onSingleTeammateToggle={handleSingleTeammateToggle} onSingleSubmit={handleAddMatch} batchRows={batchRows} onBatchRowChange={handleBatchRowChange} onBatchTeammateToggle={handleBatchTeammateToggle} onAddBatchRow={handleAddBatchRow} onRemoveBatchRow={handleRemoveBatchRow} onBatchSubmit={handleBatchSubmit} teammates={teammates} gameAccounts={sortGameAccounts(gameAccounts)} isSubmitting={isSubmitting} />}
        {activeTab === 'logs' && <LogsPanel matches={filteredLogMatches} totalMatches={scopedMatches.length} activeAccountName={currentAccountLabel} isLoading={isLoading} isSubmitting={isSubmitting} isUpdatingMatch={isUpdatingMatch} onDelete={handleDeleteMatch} onStartEdit={handleStartEditMatch} onCancelEdit={handleCancelEditMatch} onEditInputChange={handleEditInputChange} onEditTeammateToggle={handleEditTeammateToggle} onUpdateMatch={handleUpdateMatch} editingMatchId={editingMatchId} editFormData={editFormData} formatTeammateNames={formatTeammateNames} teammates={teammates} accountOptions={editAccountOptions} selectedTeammateIds={logFilterTeammateIds} onToggleTeammateFilter={handleLogFilterToggle} onClearTeammateFilters={handleClearLogFilters} />}
        {activeTab === 'teammates' && <TeammateManager teammateOverview={teammateOverview} teammateName={teammateName} onTeammateNameChange={setTeammateName} onCreate={handleCreateTeammate} onDelete={handleDeleteTeammate} isSavingTeammate={isSavingTeammate} deletingTeammateId={deletingTeammateId} activeAccountName={currentAccountLabel} />}
        {activeTab === 'accounts' && <GameAccountManager gameAccounts={sortGameAccounts(gameAccounts)} accountOverview={accountOverview} gameAccountName={gameAccountName} onGameAccountNameChange={setGameAccountName} onCreate={handleCreateGameAccount} onDelete={handleDeleteGameAccount} onStartEdit={handleStartEditGameAccount} editingGameAccountId={editingGameAccountId} editingGameAccountName={editingGameAccountName} onEditingGameAccountNameChange={setEditingGameAccountName} onCancelEdit={handleCancelEditGameAccount} onSaveEdit={handleUpdateGameAccount} isSavingGameAccount={isSavingGameAccount} isUpdatingGameAccount={isUpdatingGameAccount} deletingGameAccountId={deletingGameAccountId} />}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}








