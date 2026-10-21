import { useEffect } from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { usePricePreferences } from "../../../../../hooks/api/price-preferences"

/**
 * Pagly: an amount off follows its currency's prices, including tax where
 * they do, until the merchant sets it. Left off, "$500 off" took 22% more
 * off in a store whose prices include IVA.
 */
export const useTaxInclusiveDefault = (
  form: UseFormReturn<any>,
  enabled: boolean
) => {
  const currencyCode: string | undefined = useWatch({
    control: form.control,
    name: "application_method.currency_code",
  })

  const { price_preferences } = usePricePreferences(
    { attribute: "currency_code", value: currencyCode ? [currencyCode] : [] },
    { enabled: enabled && !!currencyCode }
  )

  const isTaxInclusive = price_preferences?.find(
    (preference) => preference.value === currencyCode
  )?.is_tax_inclusive

  useEffect(() => {
    // Touched counts too: a switch turned back to its default is not dirty.
    const { isDirty, isTouched } = form.getFieldState("is_tax_inclusive")

    if (!enabled || !currencyCode || isDirty || isTouched) {
      return
    }

    form.setValue("is_tax_inclusive", !!isTaxInclusive)
  }, [enabled, currencyCode, isTaxInclusive, form])
}
