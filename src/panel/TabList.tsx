import * as React from "react"
import { observer } from "mobx-react"

import Style from "./style"
import { insertAt } from "./util"
import { Tab as TabType } from "./store"
import Tab from "./Tab"

interface Props {
  tabs: TabType[]
  pinned?: boolean
}

const style = Style.namespace("TabList").addRules({
  root: {
    // flex: 1,
    // overflow: "auto",
    // minHeight: 0
  },

  pinned: {
    display: "flex",
  },
})

@observer
class TabList extends React.Component {
  props: Props

  render() {
    const { pinned } = this.props
    const tabs = this.props.tabs.filter(tab => tab.pinned === Boolean(pinned))
    if (!tabs.length) return null

    insertAt(
      tabs,
      tabs.findIndex(tab => tab.dragging),
      tabs.findIndex(tab => tab.dragTarget),
    )

    return (
      <div className={style("root", pinned && "pinned")}>
        {tabs.map(tab => <Tab key={tab.id} tab={tab} />)}
      </div>
    )
  }
}

export default TabList
