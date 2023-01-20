import { globalCss } from ".";

export const globalStyles = globalCss({
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  body: {
    "-webkit-font-smoothing": "antialiased",
    color: "$gray100",
    backgroundColor: "$gray900",
  },
  "body, input, button, textarea": {
    fontFamily: "Roboto",
    fontweight: 400,
  },
});
