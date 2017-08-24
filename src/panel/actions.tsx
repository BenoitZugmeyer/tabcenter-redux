import { extendObservable, runInAction } from "mobx"
import { menu, Coordinates, search as searchStore } from "./store"

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
