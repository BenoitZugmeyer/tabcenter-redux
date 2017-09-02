import * as React from "react"
import { observer } from "mobx-react"

import { search } from "./actions"
import Style from "./style"
import { search as searchStore } from "./store"

interface Props {}

const style = Style.namespace("Search").addRules({
  root: {
    display: "flex",
    flex: 1,
    alignItems: "center",
  },

  input: {
    inherit: "input",
    flex: 1,
    width: 0,
    minWidth: 0,
    backgroundColor: "#fcfcfc",
    height: 30,
    borderRadius: 4,
    padding: "0 6px",
  },
})

@observer
class Search extends React.Component {
  props: Props

  render() {
    return (
      <div className={style("root")}>
        <input
          className={style("input")}
          placeholder="Search"
          value={searchStore.query}
          onChange={this.onChange}
        />
      </div>
    )
  }

  onChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    search(value)
  }
}

export default Search
