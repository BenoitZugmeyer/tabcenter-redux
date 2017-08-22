import * as React from "react"
import { observer } from "mobx-react"

import Style from "./style"
import Tab from "./Tab"

interface Props {
  tabs: WebExt.Tab[]
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
    return (
      <div className={style("root", pinned && "pinned")}>
        {this.props.tabs.map(
          tab =>
            tab.pinned === Boolean(pinned) && <Tab key={tab.id} tab={tab} />,
        )}
      </div>
    )
  }
}

export default TabList
