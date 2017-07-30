import * as React from "react"
import { observer } from "mobx-react"
import { activate, remove } from "./actions"
import loadingSpinnerImg from "./img/loading-spinner.svg"
import closeImg from "./img/close.svg"
import Style from "./style"

const style = Style.namespace("Tab").addRules({
  root: {
    display: "flex",
    height: 32,
    "--tab-background": "#fff",
    // "--tab-background-delay": "0.2s",
    backgroundColor: "var(--tab-background)",
    overflow: "hidden",
    alignItems: "center",
    // transition: "background-color var(--tab-background-delay)"
  },

  active: {
    "--tab-background": "#ccc",
  },

  over: {
    "--tab-background": "#e5e5e5",
  },

  favicon: {
    margin: "0 3px",
  },

  title: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },

  titleShadow: {
    boxShadow: "0 0 10px 15px var(--tab-background)",
    // transition: "box-shadow var(--tab-background-delay)",
    alignSelf: "stretch",
  },

  closeButton: {
    backgroundImage: `url(${closeImg})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    width: 24,
    height: 24,
    margin: "0 3px 0 0",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(0, 0, 0, .1)",
    },
  },

  actions: {
    transition: "width .2s",
    marginLeft: 3,
    width: 0,
    display: "flex",
    alignItems: "center",
  },

  actionsVisible: {
    width: 27,
  },
})

interface Props {
  tab: WebExt.Tab
}

@observer
class Tab extends React.Component {
  props: Props

  state = {
    over: false,
  }

  render() {
    const { tab } = this.props
    const { over } = this.state

    return (
      <div
        className={style("root", over && "over", tab.active && "active")}
        onMouseDown={() => activate(tab)}
        onMouseEnter={() => this.setState({ over: true })}
        onMouseLeave={() => this.setState({ over: false })}
      >
        <img
          className={style("favicon")}
          src={tab.status === "loading" ? loadingSpinnerImg : tab.favIconUrl}
          width="16"
          height="16"
        />
        <div className={style("title")}>
          {tab.title || ""}
        </div>
        <div className={style("titleShadow")} />
        <div className={style("actions", over && "actionsVisible")}>
          <div className={style("closeButton")} onClick={() => remove(tab)} />
        </div>
      </div>
    )
  }
}

export default Tab
