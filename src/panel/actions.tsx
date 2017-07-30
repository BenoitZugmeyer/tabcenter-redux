export function activate(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.tabs.update(tab.id, { active: true })
}

export function remove(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.tabs.remove(tab.id)
}

export function create(): void {
  browser.tabs.create({})
}
