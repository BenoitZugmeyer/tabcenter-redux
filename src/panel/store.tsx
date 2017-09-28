import {
  observable,
  extendObservable,
  reaction,
  runInAction,
  useStrict,
} from "mobx"

import { insertAt } from "./util"

useStrict(true)

export interface Tab extends WebExt.Tab {
  titleChanged: boolean
  hidden: boolean
  dragging: boolean
  dragTarget: boolean
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

const resolvedIcons = new WeakMap()

async function resolveFavicon(tab: WebExt.Tab) {
  if (!tab.id) return

  const favIconUrl = tab.favIconUrl
  if (!favIconUrl || !favIconUrl.startsWith("blob:")) return

  // This is a special hack for WhatsApp but it could be usefull for other website too.  This code
  // is quite ugly, should be cleaned sometime.

  tab.favIconUrl = undefined

  let map = resolvedIcons.get(tab)
  if (!map) {
    map = new Map()
    resolvedIcons.set(tab, map)
  }

  if (!map.has(favIconUrl)) {
    const promise = browser.tabs
      .executeScript(tab.id, {
        code: `
      fetch(${JSON.stringify(favIconUrl)})
        .then(res => res.blob())
        .then(res => {
          return new Promise((resolve, reject) => {
            var reader = new window.FileReader()
            reader.onload = () => {
              resolve(reader.result)
            }
            reader.onerror = reject
            reader.readAsDataURL(res)
          })
        })
      `,
      })
      .then(results => results[0])
    map.set(favIconUrl, promise)
  }

  const resolved = await map.get(favIconUrl)

  const observableTab = tabs.find(({ id }) => id === tab.id)
  runInAction(() => {
    if (observableTab && !observableTab.favIconUrl) {
      observableTab.favIconUrl = resolved
    }
  })
}

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

  if (newTab.active) {
    existingTab.titleChanged = false
  } else if (
    existingTab.title !== newTab.title &&
    existingTab.status === "complete"
  ) {
    existingTab.titleChanged = true
  }

  resolveFavicon(newTab)

  extendObservable(existingTab, newTab)
}

function updateTabIndexes() {
  tabs.forEach((tab, index) => (tab.index = index))
}

export let currentWindowId: number = -1

function makeTab(tab: WebExt.Tab) {
  resolveFavicon(tab)

  return {
    ...tab,
    titleChanged: false,
    hidden: false,
    dragging: false,
    dragTarget: false,
  }
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

browser.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
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
    updateTabIndexes()
  })
})

browser.tabs.onMoved.addListener((tabId, { windowId, toIndex }) => {
  if (windowId !== currentWindowId) return
  runInAction(() => {
    insertAt(tabs, tabs.findIndex(({ id }) => tabId === id), toIndex)
    updateTabIndexes()
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
      updateTabIndexes()
    })
  },
)
