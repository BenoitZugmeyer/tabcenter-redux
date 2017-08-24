import {
  observable,
  extendObservable,
  reaction,
  action,
  runInAction,
  useStrict,
} from "mobx"

useStrict(true)

export interface Tab extends WebExt.Tab {
  titleChanged: boolean
  hidden: boolean
}

export type Coordinates = { x: number; y: number }
export const tabs = observable([] as Tab[])
export const menu = observable({
  tab: null as Tab | null,
  position: null as Coordinates | null,
})
export const search = observable({
  query: "",
})

/** Search */

function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
}

function compileFilter(str: string) {
  return new RegExp(escapeRegExp(str).replace(/\s+/g, ".*"), "i")
}

function setsEquals<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false
  for (const item of a) if (!b.has(item)) return false
  return true
}

reaction(
  () => {
    const filter = compileFilter(search.query)
    return new Set(tabs.filter(tab => tab.title && !filter.test(tab.title)))
  },
  tabsToHide => {
    for (const tab of tabs) tab.hidden = tabsToHide.has(tab)
  },
  {
    equals: setsEquals,
  },
)

/** Tabs sync */

function refreshTab(newTab: WebExt.Tab) {
  if (!newTab.id) {
    console.warn(currentWindowId, "Tab doesn't have an id")
    return
  }

  const existingTab = tabs.find(({ id }) => id === newTab.id)
  if (!existingTab) {
    console.warn(currentWindowId, `Tab not found in store`, newTab)
    return
  }
  console.log("UPDATE", newTab.id)

  if (newTab.active) {
    existingTab.titleChanged = false
  } else if (
    existingTab.title !== newTab.title &&
    existingTab.status === "complete"
  ) {
    existingTab.titleChanged = true
  }

  extendObservable(existingTab, newTab)
}

let currentWindowId: number = -1

function makeTab(tab: WebExt.Tab) {
  return { ...tab, titleChanged: false, hidden: false }
}

browser.windows
  .getCurrent({ populate: true })
  .then(({ tabs: windowTabs, id }) => {
    currentWindowId = id || -1
    runInAction(() => {
      if (!windowTabs) return
      tabs.length = 0
      tabs.push(...windowTabs.map(makeTab))
    })
  })

browser.tabs.onCreated.addListener(tab => {
  if (tab.windowId !== currentWindowId) return
  runInAction(() => {
    tabs.splice(tab.index, 0, makeTab(tab))
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
    const [tab] = tabs.splice(fromIndex, 1)
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

browser.tabs.onAttached.addListener(
  async (tabId, { newWindowId, newPosition }) => {
    if (newWindowId !== currentWindowId) return
    const newTab = await browser.tabs.get(tabId)
    runInAction(() => {
      tabs.splice(newPosition, 0, makeTab(newTab))
    })
  },
)
