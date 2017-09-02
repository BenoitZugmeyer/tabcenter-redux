import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react"

import { tabs } from "./store"
import {
  create,
  search,
  startDrag,
  stopDrag,
  insertTabAt,
  setDragTarget,
} from "./actions"
import Style from "./style"
import { fromElement } from "./Tab"
import TabList from "./TabList"
import Menu from "./Menu"
import Search from "./Search"

const style = Style.namespace("Panel").addRules({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  freeSpace: {
    flex: 1,
  },
  scroll: {
    flexShrink: 1,
    minHeight: 0,
    overflow: "auto",
    ":not(:first-child)": {
      borderTop: "1px solid #eceeef",
    },
  },
  hiddenTabsCount: {
    minHeight: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    borderTop: "1px solid #c0c2c4",
    backgroundColor: "#f1f2f3",
    height: 44,
    padding: 6,
  },

  newButton: {
    inherit: "input",
    backgroundColor: "#fcfcfc",
    ":active": {
      backgroundColor: "#cecfd0",
    },
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4c4c4c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `)}')`,
    borderRadius: "100px",
    width: "32px",
    height: "32px",
    padding: 0,
    textAlign: "center",
    marginRight: 6,
    outline: "none",
    "::-moz-focus-inner": {
      border: "none",
    },
  },
})

function preventNativeMenu(event: React.MouseEvent<HTMLDivElement>) {
  const target = event.target as HTMLInputElement
  if (target.tagName !== "INPUT" || target.type !== "text") {
    event.preventDefault()
  }
}

const blankImage = new Image()
blankImage.src =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

type DragInfos = {
  windowId: number,
  tabId: number,
}

function setDragInfos(event: React.DragEvent<Element>, infos: DragInfos) {
  event.dataTransfer.setData("text/x-yatab-tab", JSON.stringify(infos))
}

function getDragInfos(event: React.DragEvent<Element>): DragInfos | undefined {
  const rawInfos = event.dataTransfer.getData("text/x-yatab-tab")
  return rawInfos && JSON.parse(rawInfos)
}

@observer
class Panel extends React.Component {
  render() {
    const hiddenTabsCount = tabs.reduce(
      (total, tab) => total + (tab.hidden ? 1 : 0),
      0,
    )

    return (
      <div
        className={style("root")}
        onContextMenu={preventNativeMenu}
        onDragEnd={this._onDragEnd}
        onDragOver={this._onDragOver}
        onDragStart={this._onDragStart}
        onDrop={this._onDrop}
      >
        <TabList tabs={tabs} pinned />
        <div className={style("scroll")}>
          <TabList tabs={tabs} />
        </div>
        {Boolean(hiddenTabsCount) &&
          <div className={style("hiddenTabsCount")} onClick={() => search("")}>
            {hiddenTabsCount} hidden {hiddenTabsCount === 1 ? "tab" : "tabs"}
          </div>}
        <div className={style("freeSpace")} onDoubleClick={() => create()} />
        <Menu />
        <div className={style("actions")}>
          <button
            className={style("newButton")}
            type="button"
            onClick={() => create()}
          />
          <Search />
        </div>
      </div>
    )
  }

  _onDragStart = (event: React.DragEvent<Element>) => {
    const tab = fromElement(event.target as Node)
    if (tab) {
      startDrag(tab)
      setDragInfos(event, {
        tabId: tab.id,
        windowId: tab.windowId,
      })
      event.dataTransfer.setData("Text", tab.url || "about:blank")
      event.dataTransfer.setDragImage(blankImage, 0, 0)
    }
  }

  _onDrop = async (event: React.DragEvent<Element>) => {
    const targetTab = tabs.find(t => t.dragTarget)
    if (targetTab) {
      const infos = getDragInfos(event)
      if (infos) insertTabAt(infos.tabId, targetTab)
    }
  }

  _onDragEnd = () => {
    stopDrag()
  }

  _onDragOver = (event: React.DragEvent<Element>) => {
    event.preventDefault()
    const targetTab = fromElement(event.target as Node)
    if (!targetTab || targetTab.dragging) return
    const targetIndex = tabs.indexOf(targetTab)
    const currentTargetIndex = tabs.findIndex(tab => tab.dragTarget)
    const draggingIndex = tabs.findIndex(tab => tab.dragging)
    const draggingTab = tabs[draggingIndex]

    if (!draggingTab) {
      // TODO
    } else if (draggingTab.pinned !== targetTab.pinned) {
      return;
    } else if (currentTargetIndex !== targetIndex) {
      setDragTarget(targetTab)
    } else if (draggingIndex < targetIndex) {
      setDragTarget(tabs[targetIndex - 1])
    } else if (draggingIndex > targetIndex) {
      setDragTarget(tabs[targetIndex + 1])
    }
  }
}

render(<Panel />, document.getElementById("root"))
