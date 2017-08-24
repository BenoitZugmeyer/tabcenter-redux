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
    ":not(:first-child)": {
      borderTop: "1px solid #eceeef",
    }
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
    }
  }
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
          <button className={style("newButton")} type="button" onClick={() => create()} />
          <Search />
        </div>
      </div>
    )
  }
}

render(<Panel />, document.getElementById("root"))
