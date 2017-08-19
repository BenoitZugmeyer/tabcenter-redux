import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react"

import { tabs } from "./store"
import { create } from "./actions"
import Style from "./style"
import TabList from "./TabList"
import Menu from "./Menu"

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
})

function preventNativeMenu(e: React.MouseEvent<HTMLDivElement>) {
  e.preventDefault()
  // TODO handle text inputs
}

class Panel extends React.Component {
  render() {
    return (
      <div className={style("root")} onContextMenu={preventNativeMenu}>
        <Menu />
        <TabList tabs={tabs} pinned />
        <div className={style("scroll")}>
          <TabList tabs={tabs} />
        </div>
        <div className={style("freeSpace")} onDoubleClick={() => create()} />
        <button type="button" onClick={() => create()}>
          New
        </button>
      </div>
    )
  }
}

render(<Panel />, document.getElementById("root"))
