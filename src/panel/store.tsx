import { observable, autorun, action, runInAction, useStrict } from "mobx"

useStrict(true)

export const tabs = observable([] as WebExt.Tab[])

function refreshTab(newTab: WebExt.PartialTab) {
  if (!newTab.id) {
    console.warn(currentWindowId, "Tab doesn't have an id");
    return
  }

  const existingTab = tabs.find(({ id }) => id === newTab.id)
  if (!existingTab) {
    console.warn(currentWindowId, `Tab not found in store`, newTab)
    return
  }
  console.log("UPDATE", newTab.id, newTab.favIconUrl)

  Object.assign(existingTab, newTab)
}

let currentWindowId: number = -1;

function createTabObservable(tab: WebExt.Tab) {
  return observable(Object.assign({ favIconUrl: undefined }, tab))
}

browser.windows.getCurrent({ populate: true }).then(({ tabs: windowTabs, id }) => {
  currentWindowId = id || -1
  runInAction(() => {
    if (!windowTabs) return
    tabs.length = 0
    tabs.push(...windowTabs.map(createTabObservable))
  })
})

browser.tabs.onCreated.addListener((tab) => {
  if (tab.windowId !== currentWindowId) return
  runInAction(() => {
    tabs.push(createTabObservable(tab))
  })
})

browser.tabs.onActivated.addListener(async ({ windowId, tabId }) => {
  if (windowId !== currentWindowId) return
  const newTab = await browser.tabs.get(tabId)
  runInAction(() => {
    for (const tab of tabs) {
      tab.active = false
    }
    refreshTab(newTab)
  })
})

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.windowId !== currentWindowId) return
  runInAction(() => {
    refreshTab(tab)
  })
})

browser.tabs.onRemoved.addListener((tabId, { windowId }) => {
  if (windowId !== currentWindowId) return
  runInAction(() => {
    const index = tabs.findIndex(({ id }) => tabId === id)
    tabs.splice(index, 1)
  })
})

browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
  if (windowId !== currentWindowId) return
  runInAction(() => {
    const [ tab ] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, tab)
  })
})

browser.tabs.onDetached.addListener((tabId, { oldWindowId }) => {
  if (oldWindowId !== currentWindowId) return
  runInAction(() => {
    const index = tabs.findIndex(({ id }) => tabId === id)
    tabs.splice(index, 1)
  })
})

browser.tabs.onAttached.addListener(async (tabId, { newWindowId, newPosition }) => {
  if (newWindowId !== currentWindowId) return
  const newTab = await browser.tabs.get(tabId)
  runInAction(() => {
    tabs.splice(newPosition, 0, newTab)
  })
});
