import { Textarea } from "@medusajs/ui"
import { ComponentPropsWithoutRef, ComponentType, forwardRef } from "react"

type RichTextEditorComponent = ComponentType<{
  value: string
  onChange: (html: string) => void
  placeholder?: string
  title?: string
}>

/**
 * Pagly: the global a plugin sets to its rich text editor. Kept as a global so
 * core takes no dependency on the plugin or on its editor library.
 */
const EDITOR_KEY = "__paglyRichTextEditor"

type RichTextInputProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> & {
  value?: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  disabled?: boolean
  placeholder?: string
  /**
   * What the text is about, like the product title, for an editor that offers
   * a writing assistant.
   */
  title?: string
}

/**
 * Pagly: a long text field that is a rich text editor when a plugin registered
 * one, and the plain textarea otherwise.
 */
export const RichTextInput = forwardRef<HTMLDivElement, RichTextInputProps>(
  (
    { value, onChange, onBlur, name, disabled, placeholder, title, ...props },
    ref
  ) => {
    const Editor = (globalThis as Record<string, unknown>)[EDITOR_KEY] as
      | RichTextEditorComponent
      | undefined

    if (!Editor) {
      return (
        <Textarea
          {...(props as ComponentPropsWithoutRef<typeof Textarea>)}
          name={name}
          value={value ?? ""}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    }

    return (
      <div ref={ref} {...props} onBlur={onBlur}>
        <Editor
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          title={title}
        />
      </div>
    )
  }
)

RichTextInput.displayName = "RichTextInput"

/**
 * Pagly: a rich text value as plain text, with a line break where a block
 * ended. Plain text comes back unchanged.
 */
export const richTextToPlain = (value: string | null | undefined) => {
  if (!value || !/<\/?[a-z][^>]*>/i.test(value)) {
    return value
  }

  const html = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "$&\n")

  return (
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
