import type { ReactNode } from "react"
import { FormProvider, type UseFormReturn } from "react-hook-form"

/**
 * Stand-ins for the plugin's route and stacked modals: they render their
 * children in place, so a page's content is on screen without a modal stack.
 */
const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>

/** The modals' `Form`: the form's context, without the leave-page prompt. */
const Form = ({
  form,
  children,
}: {
  form: UseFormReturn<any>
  children?: ReactNode
}) => <FormProvider {...form}>{children}</FormProvider>

const modal = Object.assign(Pass, {
  Header: Pass,
  Body: Pass,
  Footer: Pass,
  Title: Pass,
  Description: Pass,
  Close: Pass,
  Trigger: Pass,
  Content: Pass,
  Form,
})

export const modalsMock = () => ({
  RouteDrawer: modal,
  RouteFocusModal: modal,
  StackedDrawer: modal,
  StackedFocusModal: modal,
  useRouteModal: () => ({ handleSuccess: () => {} }),
  useStackedModal: () => ({ setIsOpen: () => {}, getIsOpen: () => false }),
})
