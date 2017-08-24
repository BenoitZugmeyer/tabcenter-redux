import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react"

import { tabs } from "./store"
import { create, search } from "./actions"
import Style from "./style"
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
    borderTop: "1px solid #eceeef",
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
})

function preventNativeMenu(e: React.MouseEvent<HTMLDivElement>) {
  const target = e.target as HTMLInputElement
  if (target.tagName !== "INPUT" || target.type !== "text") {
    e.preventDefault()
  }
}

@observer
class Panel extends React.Component {
  render() {
    const hiddenTabsCount = tabs.reduce(
      (total, tab) => total + (tab.hidden ? 1 : 0),
      0,
    )

    return (
      <div className={style("root")} onContextMenu={preventNativeMenu}>
        <Menu />
        <TabList tabs={tabs} pinned />
        <div className={style("scroll")}>
          <TabList tabs={tabs} />
        </div>
        {Boolean(hiddenTabsCount) &&
          <div className={style("hiddenTabsCount")} onClick={() => search("")}>
            {hiddenTabsCount} hidden {hiddenTabsCount === 1 ? "tab" : "tabs"}
          </div>}
        <div className={style("freeSpace")} onDoubleClick={() => create()} />
        <div className={style("actions")}>
          <button type="button" onClick={() => create()}>
            New
          </button>
          <Search />
        </div>
      </div>
    )
  }
}

render(<Panel />, document.getElementById("root"))
