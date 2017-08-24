import sansSel from "sans-sel"

export default sansSel().addRules({
  input: {
    transition: "border .2s, box-shadow .2s",
    border: "1px solid #b9babb",
    ":hover": {
      boxShadow: "0 0 5px rgba(0, 0, 0, .1)",
      borderColor: "#a1a2a3",
    },
  }
})
