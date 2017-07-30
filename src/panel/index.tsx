import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react"

import { tabs } from "./store"
import { create } from "./actions"
import TabList from "./TabList"

render(
  <div>
    <button type="button" onClick={() => create()}>New</button>
    <TabList tabs={tabs} />
  </div>,
  document.getElementById("root"),
)
