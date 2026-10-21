import type { ReactNode } from "react"

/**
 * Stand-ins for the plugin's route and stacked modals: they render their
 * children in place, so a page's content is on screen without a modal stack.
 */
const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>

const modal = Object.assign(Pass, {
  Header: Pass,
  Body: Pass,
  Footer: Pass,
  Title: Pass,
  Description: Pass,
  Close: Pass,
  Trigger: Pass,
  Content: Pass,
})

export const modalsMock = () => ({
  RouteFocusModal: modal,
  StackedFocusModal: modal,
  useRouteModal: () => ({ handleSuccess: () => {} }),
  useStackedModal: () => ({ setIsOpen: () => {}, getIsOpen: () => false }),
})
