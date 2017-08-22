declare namespace WebExt {
  interface Emitter<A> {
    addListener(listener: (arg: A) => void): void
  }

  interface Emitter2<A1, A2> {
    addListener(listener: (arg1: A1, arg2: A2) => void): void
  }

  interface Emitter3<A1, A2, A3> {
    addListener(listener: (arg1: A1, arg2: A2, arg3: A3) => void): void
  }

  interface Tab {
    id?: number
    windowId: number
    favIconUrl?: string
    status?: "complete" | "loading"
    index: number
    active: boolean
    pinned: boolean
    mutedInfo?: {
      extensionId?: string
      muted: boolean
      reason?: "capture" | "extension" | "user"
    }
    selected: boolean
    title?: string
  }

  interface Window {
    id?: number
    tabs?: Tab[]
  }

  type PartialTab = {
    id?: number
    favIconUrl?: string
    muted?: boolean
    active?: boolean
    pinned?: boolean
    title?: string
  }

  interface TabInfo {
    tabId: number
    windowId: number
  }

  interface TabRemoveInfo {
    windowId: number
    isWindowClosing: boolean
  }

  interface TabMoveInfo {
    windowId: number
    fromIndex: number
    toIndex: number
  }

  interface TabDetachInfo {
    oldWindowId: number
    oldPosition: number
  }

  interface TabAttachInfo {
    newWindowId: number
    newPosition: number
  }

  interface TabQueryInfo {
    currentWindow?: boolean
  }

  interface WindowGetInfo {
    populate?: boolean
    // TODO windowTypes
  }

  interface WindowCreateData {
    tabId?: number
  }

  interface Tabs {
    get(tabId: number): Promise<Tab>
    query(queryInfo: TabQueryInfo): Promise<Tab[]>
    update(tabId: number, updateProperties: PartialTab): Promise<Tab>
    remove(tabIds: number | number[]): Promise<void>
    create(createProperties: PartialTab): Promise<Tab>

    onCreated: Emitter<Tab>
    onActivated: Emitter<TabInfo>
    onUpdated: Emitter3<number, PartialTab, Tab>
    onRemoved: Emitter2<number, TabRemoveInfo>
    onMoved: Emitter2<number, TabMoveInfo>
    onAttached: Emitter2<number, TabAttachInfo>
    onDetached: Emitter2<number, TabDetachInfo>
  }

  interface Windows {
    getCurrent(getInfo?: WindowGetInfo): Promise<Window>
    create(createData: WindowCreateData): Promise<Window>
  }

  interface Browser {
    tabs: Tabs
    windows: Windows
  }
}

declare const browser: WebExt.Browser
