import * as React from "react"
import { observer } from "mobx-react"
import { activate } from "./actions"
import loadingSpinner from "./img/loading-spinner.svg"

interface Props {
  tab: WebExt.Tab,
}

@observer
class Tab extends React.Component {
  props: Props

  render() {
    const { tab } = this.props

    console.log('render', tab.id, tab.favIconUrl, loadingSpinner)
    console.log('render', tab.id, tab.favIconUrl, loadingSpinner)
    return (
      <div onMouseDown={() => activate(tab)}>
        <img src={tab.status === "loading" ? loadingSpinner : tab.favIconUrl} width="16" height="16" />
        {tab.active ? "> " : " "} {tab.title}
      </div>
    )
  }
}

export default Tab
