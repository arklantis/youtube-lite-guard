const DEFAULTS = {
  enabled: true,
  hideChat: true,
  hideComments: true,
  hideRecommendations: true,
  hideShorts: true,
  compactWatch: true,
  hideHomeFeed: false,
  hidePlaylists: false,
  hideEndscreen: true,
  hideMiniplayer: false,
  hideNotifications: false,
  hideMerch: true,
  aggressiveCleanup: true,
  language: "en"
};

const TOGGLES = [
  "enabled",
  "hideChat",
  "hideComments",
  "hideRecommendations",
  "hideShorts",
  "compactWatch",
  "hideHomeFeed",
  "hidePlaylists",
  "hideEndscreen",
  "hideMiniplayer",
  "hideNotifications",
  "hideMerch",
  "aggressiveCleanup"
];

const TEXT = {
  en: {
    statsTitle: "Current YouTube Page",
    refreshStats: "Refresh",
    jsHeap: "JS heap estimate",
    domNodes: "DOM nodes",
    pageStatus: "Page status",
    statsNote: "This is page JS heap, not total Chrome task-manager memory.",
    enabled: "Enable lite mode",
    aggressiveCleanup: "Aggressive cleanup",
    watchPage: "Watch Page",
    hideChat: "Hide live chat",
    hideComments: "Hide comments",
    hideRecommendations: "Hide side recommendations",
    hidePlaylists: "Hide playlist panel",
    hideEndscreen: "Hide end screen cards",
    compactWatch: "Compact watch layout",
    siteWide: "Site Wide",
    hideShorts: "Hide Shorts sections",
    hideHomeFeed: "Hide home feed",
    hideMiniplayer: "Hide mini player",
    hideNotifications: "Hide notification button",
    hideMerch: "Hide merch and shopping",
    reloadNote: "Refresh YouTube tabs after changing options for the clearest memory reduction.",
    notYoutube: "Not a YouTube tab",
    unavailable: "Unavailable",
    cleaned: "Cleaned",
    active: "Active"
  },
  "zh-Hant": {
    statsTitle: "目前 YouTube 頁面",
    refreshStats: "重新抓取",
    jsHeap: "JS 記憶體估算",
    domNodes: "DOM 節點",
    pageStatus: "頁面狀態",
    statsNote: "這是頁面 JS heap，不是 Chrome 工作管理員的完整記憶體。",
    enabled: "啟用輕量模式",
    aggressiveCleanup: "積極清理",
    watchPage: "觀看頁",
    hideChat: "隱藏直播聊天室",
    hideComments: "隱藏留言",
    hideRecommendations: "隱藏右側推薦",
    hidePlaylists: "隱藏播放清單面板",
    hideEndscreen: "隱藏片尾推薦",
    compactWatch: "簡化觀看頁排版",
    siteWide: "全站",
    hideShorts: "隱藏 Shorts 區塊",
    hideHomeFeed: "隱藏首頁 feed",
    hideMiniplayer: "隱藏迷你播放器",
    hideNotifications: "隱藏通知按鈕",
    hideMerch: "隱藏商品/購物區塊",
    reloadNote: "變更選項後重新整理 YouTube 分頁，記憶體回收最明顯。",
    notYoutube: "目前不是 YouTube 分頁",
    unavailable: "無法取得",
    cleaned: "已清理",
    active: "仍存在"
  }
};

let currentLanguage = "en";

function t(key) {
  return (TEXT[currentLanguage] && TEXT[currentLanguage][key]) || TEXT.en[key] || key;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const mib = bytes / 1024 / 1024;
  if (mib < 1024) return `${mib.toFixed(1)} MB`;
  return `${(mib / 1024).toFixed(2)} GB`;
}

function applyLanguage(language) {
  currentLanguage = language in TEXT ? language : "en";
  document.documentElement.lang = currentLanguage;
  document.getElementById("language").value = currentLanguage;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
}

function setStatsLoading() {
  document.getElementById("memoryUsed").textContent = "...";
  document.getElementById("nodeCount").textContent = "...";
  document.getElementById("pageStatus").textContent = "...";
}

function setStatsUnavailable(messageKey) {
  document.getElementById("memoryUsed").textContent = "-";
  document.getElementById("nodeCount").textContent = "-";
  document.getElementById("pageStatus").textContent = t(messageKey);
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function refreshStats() {
  setStatsLoading();
  const tab = await getActiveTab();
  if (!tab || !tab.url || !tab.url.includes("youtube.com")) {
    setStatsUnavailable("notYoutube");
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "ytlg:getStats" }, (stats) => {
    if (chrome.runtime.lastError || !stats) {
      setStatsUnavailable("unavailable");
      return;
    }

    const memoryText = stats.memory
      ? `${formatBytes(stats.memory.usedJSHeapSize)} / ${formatBytes(stats.memory.totalJSHeapSize)}`
      : t("unavailable");
    const cleaned = [
      stats.liveChatPresent,
      stats.commentsPresent,
      stats.recommendationsPresent
    ].every((present) => present === false);

    document.getElementById("memoryUsed").textContent = memoryText;
    document.getElementById("nodeCount").textContent = String(stats.nodeCount || "-");
    document.getElementById("pageStatus").textContent = cleaned ? t("cleaned") : t("active");
  });
}

chrome.storage.sync.get(DEFAULTS, (items) => {
  applyLanguage(items.language);

  for (const key of TOGGLES) {
    const input = document.getElementById(key);
    input.checked = Boolean(items[key]);
    input.addEventListener("change", () => {
      chrome.storage.sync.set({ [key]: input.checked }, refreshStats);
    });
  }

  const language = document.getElementById("language");
  language.addEventListener("change", () => {
    applyLanguage(language.value);
    chrome.storage.sync.set({ language: language.value }, refreshStats);
  });

  document.getElementById("refreshStats").addEventListener("click", refreshStats);
  refreshStats();
});
