import { ComponentType, useEffect } from "react"
import { useNavigate } from "react-router-dom"

/**
 * Pagly: the global a plugin sets to its home page. Kept as a global so core
 * takes no dependency on the plugin.
 */
const HOME_KEY = "__paglyHome"

/**
 * Pagly: the plugin's home page when one is registered, and the stock
 * redirect to orders otherwise.
 */
export const Home = () => {
  const PluginHome = (globalThis as Record<string, unknown>)[HOME_KEY] as
    | ComponentType
    | undefined

  return PluginHome ? <PluginHome /> : <RedirectToOrders />
}

const RedirectToOrders = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/orders", { replace: true })
  }, [navigate])

  return <div />
}
