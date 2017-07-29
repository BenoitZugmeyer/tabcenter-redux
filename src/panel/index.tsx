import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react"

import { tabs } from "./store"
import TabList from "./TabList"

render(<TabList tabs={tabs} />, document.getElementById("root"))
