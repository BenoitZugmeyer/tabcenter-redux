import * as React from "react"
import { observer } from "mobx-react"
import { closeMenu, remove, pin, mute, moveToWindow } from "./actions"
import { menu } from "./store"
import Style from "./style"

const style = Style.namespace("Menu").addRules({
  root: {
    position: "fixed",
    backgroundColor: "#eff0f1",
    border: "1px solid #c0c2c4",
    borderRadius: "2px",
    zIndex: 1,
  },

  menuItem: {
    padding: "4px 8px",
    whiteSpace: "nowrap",
    ":hover": {
      backgroundColor: "#3daee9",
      color: "#eff0f1",
    },
  },
})

interface Props {}

interface MenuItemProps {
  label: string
  action: () => void
}
const MenuItem = ({ label, action }: MenuItemProps) =>
  <div
    className={style("menuItem")}
    onClick={() => {
      action()
      closeMenu()
    }}
  >
    {label}
  </div>

interface State {
  size: {
    width: number
    height: number
  } | null
}

@observer
class Menu extends React.Component {
  props: Props
  base: HTMLDivElement | null

  state: State = {
    size: null,
  }

  render() {
    const { tab, position } = menu
    if (!tab || !position) return null

    const { size } = this.state
    const mutedInfo = tab.mutedInfo

    const margin = 5
    return (
      <div
        ref={el => {
          this.base = el
        }}
        className={style("root")}
        style={
          size
            ? {
                top: Math.min(
                  window.innerHeight - size.height - margin,
                  position.y,
                ),
                left: Math.min(
                  window.innerWidth - size.width - margin,
                  position.x,
                ),
              }
            : { visibility: "hidden", width: 0, height: 0 }
        }
      >
        <MenuItem label={"Close"} action={() => remove(tab)} />
        <MenuItem
          label={tab.pinned ? "Unpin" : "Pin"}
          action={() => pin(tab, !tab.pinned)}
        />
        {mutedInfo &&
          <MenuItem
            label={mutedInfo.muted ? "Unmute" : "Mute"}
            action={() => mute(tab, !mutedInfo.muted)}
          />}
        <MenuItem
          label={"Move to New Window"}
          action={() => moveToWindow(tab)}
        />
      </div>
    )
  }

  componentDidMount() {
    this._updateSize()
    this._toggleEvents(Boolean(menu.tab))
  }

  componentDidUpdate() {
    this._updateSize()
    this._toggleEvents(Boolean(menu.tab))
  }

  componentWillUnmount() {
    this._toggleEvents(false)
  }

  _toggleEvents(attach: boolean) {
    if (menu.tab) {
      addEventListener("mousedown", this.onGlobalMouseDown, true)
      addEventListener("blur", this.onGlobalBlur, true)
    } else {
      removeEventListener("mousedown", this.onGlobalMouseDown, true)
      removeEventListener("blur", this.onGlobalBlur, true)
    }
  }

  _updateSize() {
    if (this.base && menu.tab) {
      const size = this.state.size
      if (
        !size ||
        size.width !== this.base.scrollWidth ||
        size.height !== this.base.scrollHeight
      ) {
        this.setState({
          size: {
            width: this.base.scrollWidth,
            height: this.base.scrollHeight,
          },
        })
      }
    }
  }

  onGlobalMouseDown = (event: MouseEvent) => {
    if (this.base && !this.base.contains(event.target as Element)) {
      closeMenu()
    }
  }

  onGlobalBlur = () => {
    closeMenu()
  }
}

export default Menu
