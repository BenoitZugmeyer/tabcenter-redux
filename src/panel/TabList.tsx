import * as React from "react"
import { observer } from "mobx-react"

import Tab from "./Tab"

interface Props {
  tabs: WebExt.Tab[]
}

@observer
class TabList extends React.Component {
  props: Props

  render() {
    return (
      <div>
        {this.props.tabs.map(tab => <Tab key={tab.id} tab={tab} />)}
      </div>
    )
  }
}

export default TabList
