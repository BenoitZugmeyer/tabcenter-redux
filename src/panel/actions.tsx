export function activate(tab: WebExt.Tab): void {
  if (!tab.id) return
  browser.tabs.update(tab.id, { active: true })
}
