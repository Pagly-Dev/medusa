import { fireEvent, screen } from "@testing-library/react"

/** Opens the `index`th "..." action menu on screen, in document order. */
export const openActionMenu = (index = 0) => {
  const trigger = screen
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-haspopup") === "menu")[index]
  fireEvent.keyDown(trigger, { key: "Enter" })
}
