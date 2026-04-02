export const queueOptions = ['单排', '双排', '三排', '五排'];
export const roleOptions = ['对抗路', '打野', '中路', '发育路', '游走'];
export const seasonOptions = ['S43', 'S44', 'S45', 'S46', 'S47', 'S48'];
export const pieColors = ['#00f0ff', '#fcee0a', '#ff003c', '#9d00ff', '#00ff66', '#ffffff'];
export const DEFAULT_ACCOUNT_NAME = '主账号';
export const LEGACY_ACCOUNT_NAME = '未命名账号';
export const ALL_ACCOUNTS_VALUE = '__ALL_ACCOUNTS__';
export const ALL_ACCOUNTS_LABEL = '全部账号';

export const clipPathButton = {
  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
};

export const clipPathPanel = {
  clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
};

export const buildTodayString = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().split('T')[0];
};

export const normalizeAccountName = (accountName, fallback = LEGACY_ACCOUNT_NAME) => {
  const normalized = `${accountName ?? ''}`.trim();
  return normalized || fallback;
};

export const buildDefaultMatch = (accountName = '') => ({
  date: buildTodayString(),
  accountName,
  season: 'S43',
  queueType: '单排',
  role: '对抗路',
  result: '胜利',
  teammateIds: []
});

export const buildMatchFormFromMatch = (match) => ({
  date: match.date,
  accountName: normalizeAccountName(match.accountName),
  season: match.season,
  queueType: match.queueType,
  role: match.role,
  result: match.result,
  teammateIds: [...(match.teammateIds || match.teammates?.map((teammate) => teammate.id) || [])]
});

export const getMaxTeammates = (queueType) => {
  switch (queueType) {
    case '双排':
      return 1;
    case '三排':
      return 2;
    case '五排':
      return 4;
    default:
      return 0;
  }
};

export const buildQueueTeammateHint = (queueType) => {
  const max = getMaxTeammates(queueType);
  if (max === 0) {
    return '单排模式不记录组队队友';
  }

  return `${queueType}模式最多可选择 ${max} 名队友，也可以不选`;
};

export const trimTeammatesForQueue = (queueType, teammateIds = []) => teammateIds.slice(0, getMaxTeammates(queueType));

export const formatTeammateNames = (teammates = []) => {
  if (!teammates.length) {
    return '无';
  }

  return teammates.map((teammate) => teammate.name).join(' / ');
};

export const sortByName = (items) => [...items].sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));

export const sortAccountNames = (names) => [...names].sort((left, right) => left.localeCompare(right, 'zh-CN'));

export const sortGameAccounts = (accounts) => [...accounts].sort((left, right) => {
  if (left.isPrimary !== right.isPrimary) {
    return left.isPrimary ? -1 : 1;
  }
  return left.name.localeCompare(right.name, 'zh-CN');
});

export const buildScopeAccountNames = (gameAccounts, matchAccountNames) => {
  const names = [];
  const seen = new Set();

  for (const account of sortGameAccounts(gameAccounts)) {
    if (!seen.has(account.name)) {
      names.push(account.name);
      seen.add(account.name);
    }
  }

  for (const accountName of sortAccountNames(matchAccountNames)) {
    if (!seen.has(accountName)) {
      names.push(accountName);
      seen.add(accountName);
    }
  }

  return names;
};

export const buildEditableAccountOptions = (gameAccounts, currentValue) => {
  const options = sortGameAccounts(gameAccounts).map((account) => account.name);
  const normalizedCurrentValue = normalizeAccountName(currentValue);
  if (normalizedCurrentValue && !options.includes(normalizedCurrentValue)) {
    options.push(normalizedCurrentValue);
  }
  return options;
};

export const resolvePrimaryAccountName = (gameAccounts) => sortGameAccounts(gameAccounts).find((account) => account.isPrimary)?.name || sortGameAccounts(gameAccounts)[0]?.name || '';

export const buildTeammateGroupLabel = (teammates = []) => {
  const normalized = sortByName(teammates);
  if (!normalized.length) {
    return '未绑定队友';
  }

  return normalized.map((teammate) => teammate.name).join(' + ');
};

export const truncateLabel = (label, maxLength = 22) => {
  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, Math.max(0, maxLength - 3))}...`;
};

export const matchHasAnyTeammate = (match, teammateIds = []) => {
  if (!teammateIds.length) {
    return true;
  }

  return teammateIds.some((teammateId) => (match.teammateIds || []).includes(teammateId));
};

export const matchHasAllTeammates = (match, teammateIds = []) => {
  if (!teammateIds.length) {
    return true;
  }

  return teammateIds.every((teammateId) => (match.teammateIds || []).includes(teammateId));
};

export const buildToggleResult = (queueType, selectedIds, teammateId) => {
  const max = getMaxTeammates(queueType);
  const normalizedIds = selectedIds ?? [];

  if (normalizedIds.includes(teammateId)) {
    return {
      nextIds: normalizedIds.filter((id) => id !== teammateId),
      error: ''
    };
  }

  if (max === 0) {
    return {
      nextIds: [],
      error: '当前排位类型不需要选择队友'
    };
  }

  if (normalizedIds.length >= max) {
    return {
      nextIds: normalizedIds,
      error: `${queueType}最多只能选择 ${max} 名队友`
    };
  }

  return {
    nextIds: [...normalizedIds, teammateId],
    error: ''
  };
};
