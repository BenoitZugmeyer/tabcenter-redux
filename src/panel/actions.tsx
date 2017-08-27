import { extendObservable, runInAction } from "mobx"
import { insertAt } from "./util"
import { tabs, menu, Coordinates, search as searchStore, Tab, currentWindowId } from "./store"

export function activate(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.tabs.update(tab.id, { active: true })
}

export function remove(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.tabs.remove(tab.id)
}

export function pin(tab: WebExt.Tab, pinned: boolean): void {
  if (!tab.id) return
  browser.tabs.update(tab.id, { pinned: pinned })
}

export function mute(tab: WebExt.Tab, muted: boolean): void {
  if (!tab.id) return
  browser.tabs.update(tab.id, { muted: muted })
}

export function moveToWindow(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.windows.create({ tabId: tab.id })
}

export function create(): void {
  browser.tabs.create({})
}

export function openMenu(tab: WebExt.Tab, position: Coordinates): void {
  runInAction(() => {
    extendObservable(menu, { tab, position })
  })
}

export function closeMenu(): void {
  runInAction(() => {
    menu.tab = null
  })
}

export function search(query: string): void {
  runInAction(() => {
    searchStore.query = query
  })
}

export function startDrag(tab: Tab): void {
  runInAction(() => {
    tab.dragging = true
  })
}

export function stopDrag(): void {
  runInAction(() => {
    for (const tab of tabs) {
      tab.dragging = false
      tab.dragTarget = false
    }
  })
}

export function setDragTarget(target: Tab | null): void {
  runInAction(() => {
    for (const tab of tabs) {
      tab.dragTarget = target === tab
    }
  })
}

export function insertTabAt(tabId: number, targetTab: Tab) {
  runInAction(() => {
    const index = tabs.indexOf(targetTab)
    if (tabId !== targetTab.id && index >= 0) {

      // Optimist store update, because the browser.tabs.move can take a few ms
      const knownTabIndex = tabs.findIndex((tab) => tab.id === tabId)
      if (knownTabIndex >= 0) insertAt(tabs, knownTabIndex, index)

      browser.tabs.move(tabId, { index, windowId: currentWindowId });
    }
    stopDrag()
  })
}
