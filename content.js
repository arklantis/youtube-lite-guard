(function () {
  "use strict";

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
    aggressiveCleanup: true
  };

  const SELECTORS = {
    hideChat: [
      "ytd-live-chat-frame",
      "#chat"
    ],
    hideComments: [
      "ytd-comments",
      "#comments"
    ],
    hideRecommendations: [
      "#secondary",
      "ytd-watch-next-secondary-results-renderer"
    ],
    hideShorts: [
      "ytd-rich-shelf-renderer[is-shorts]",
      "ytd-reel-shelf-renderer",
      "ytd-shorts",
      "a[href^='/shorts/']"
    ],
    hideHomeFeed: [
      "ytd-browse[page-subtype='home'] ytd-rich-grid-renderer",
      "ytd-browse[page-subtype='home'] #contents"
    ],
    hidePlaylists: [
      "ytd-playlist-panel-renderer",
      "#playlist"
    ],
    hideEndscreen: [
      ".ytp-endscreen-content",
      ".ytp-ce-element"
    ],
    hideMiniplayer: [
      "ytd-miniplayer"
    ],
    hideNotifications: [
      "ytd-notification-topbar-button-renderer",
      "#notification-button"
    ],
    hideMerch: [
      "ytd-merch-shelf-renderer",
      "ytd-product-shelf-renderer",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-shopping']"
    ]
  };

  let settings = { ...DEFAULTS };
  let observer = null;
  let sweepTimer = 0;
  let aggressiveTimer = 0;

  function readSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (items) => {
        resolve({ ...DEFAULTS, ...items });
      });
    });
  }

  function setClass(name, enabled) {
    document.documentElement.classList.toggle(name, Boolean(settings.enabled && enabled));
  }

  function applyClasses() {
    setClass("ytlg-hide-chat", settings.hideChat);
    setClass("ytlg-hide-comments", settings.hideComments);
    setClass("ytlg-hide-recommendations", settings.hideRecommendations);
    setClass("ytlg-hide-shorts", settings.hideShorts);
    setClass("ytlg-compact-watch", settings.compactWatch);
    setClass("ytlg-hide-home-feed", settings.hideHomeFeed);
    setClass("ytlg-hide-playlists", settings.hidePlaylists);
    setClass("ytlg-hide-endscreen", settings.hideEndscreen);
    setClass("ytlg-hide-miniplayer", settings.hideMiniplayer);
    setClass("ytlg-hide-notifications", settings.hideNotifications);
    setClass("ytlg-hide-merch", settings.hideMerch);
  }

  function removeMatching(selector) {
    for (const node of document.querySelectorAll(selector)) {
      if (node && node.parentNode) {
        node.remove();
      }
    }
  }

  function sweepHeavyNodes() {
    if (!settings.enabled) return;

    for (const [key, selectors] of Object.entries(SELECTORS)) {
      if (!settings[key]) continue;
      for (const selector of selectors) removeMatching(selector);
    }
  }

  function scheduleSweep() {
    if (sweepTimer) return;
    sweepTimer = window.setTimeout(() => {
      sweepTimer = 0;
      sweepHeavyNodes();
    }, 250);
  }

  function installObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(scheduleSweep);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function installAggressiveCleanup() {
    if (aggressiveTimer) {
      window.clearInterval(aggressiveTimer);
      aggressiveTimer = 0;
    }

    if (settings.enabled && settings.aggressiveCleanup) {
      aggressiveTimer = window.setInterval(sweepHeavyNodes, 3000);
    }
  }

  async function refresh() {
    settings = await readSettings();
    applyClasses();
    sweepHeavyNodes();
    installObserver();
    installAggressiveCleanup();
  }

  window.addEventListener("yt-navigate-finish", scheduleSweep, true);
  chrome.storage.onChanged.addListener(refresh);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== "ytlg:getStats") return false;

    const memory = performance && performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : null;

    sendResponse({
      url: location.href,
      title: document.title,
      memory,
      nodeCount: document.getElementsByTagName("*").length,
      videoCount: document.querySelectorAll("video").length,
      liveChatPresent: Boolean(document.querySelector("ytd-live-chat-frame, #chat")),
      commentsPresent: Boolean(document.querySelector("ytd-comments, #comments")),
      recommendationsPresent: Boolean(document.querySelector("#secondary, ytd-watch-next-secondary-results-renderer")),
      timestamp: Date.now()
    });

    return true;
  });

  refresh();
})();
