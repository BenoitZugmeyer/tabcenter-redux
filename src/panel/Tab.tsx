import * as React from "react"
import { observer } from "mobx-react"
import { autorun } from "mobx"
import { activate, remove, openMenu } from "./actions"
import loadingSpinnerImg from "./img/loading-spinner.svg"
import closeImg from "./img/close.svg"
import globe from "./img/globe.svg"
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

  pinned: {
    justifyContent: "center",
    width: 32
  },

  active: {
    "--tab-background": "#ccc",
  },

  over: {
    "--tab-background": "#e5e5e5",
  },

  favicon: {
    margin: "0 8px",
  },

  pinnedFavicon: {
    margin: 0
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
    width: 24 + 3,
  },
})

interface Props {
  tab: WebExt.Tab
}

function isScrollable(element: Element) {
  const overflow = getComputedStyle(element).overflow
  return overflow === "auto" || overflow === "scroll"
}

function scrollIntoViewIfNeeded(element: Element) {
  let scrollableParent: Element | null = element
  do {
    scrollableParent = scrollableParent.parentElement
  } while (scrollableParent && !isScrollable(scrollableParent))

  if (scrollableParent) {
    const parentRect = scrollableParent.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    if (elementRect.top < parentRect.top) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    } else if (elementRect.bottom > parentRect.bottom) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }
}

@observer
class Tab extends React.Component {
  props: Props
  _unsubscribe?: () => void
  base?: HTMLDivElement | null

  state = {
    over: false,
  }

  render() {
    const { tab } = this.props
    const { over } = this.state

    return (
      <div
        ref={el => {
          this.base = el
        }}
        className={style("root", over && "over", tab.active && "active", tab.pinned && "pinned")}
        onMouseDown={this.onMouseDown}
        onContextMenu={this.onContextMenu}
        onMouseEnter={() => this.setState({ over: true })}
        onMouseLeave={() => this.setState({ over: false })}
        title={tab.title}
        contextMenu="foo"
      >
        <img
          className={style("favicon", tab.pinned && "pinnedFavicon")}
          src={tab.status === "loading" ? loadingSpinnerImg : tab.favIconUrl || globe}
          width="16"
          height="16"
        />
        {!tab.pinned &&
          <div className={style("title")}>
            {tab.title || ""}
          </div>}
        {!tab.pinned && <div className={style("titleShadow")} />}
        {!tab.pinned &&
          <div className={style("actions", over && "actionsVisible")}>
            <div
              className={style("closeButton")}
              onClick={() => remove(tab)}
              title="Close"
            />
          </div>}
      </div>
    )
  }

  componentDidMount() {
    this._watchActive()
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.tab !== this.props.tab) this._watchActive()
  }

  _watchActive() {
    if (this._unsubscribe) this._unsubscribe()
    this._unsubscribe = autorun(() => {
      if (this.base && this.props.tab.active) {
        scrollIntoViewIfNeeded(this.base)
      }
    })
  }

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.button === 0) {
      activate(this.props.tab)
    } else if (event.button === 1) {
      // middle click
      remove(this.props.tab)
    }
  }

  onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    openMenu(this.props.tab, { x: event.pageX, y: event.pageY })
    event.preventDefault()
  }
}

export default Tab
