import { useEffect } from "react"

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T|null>,
  isActive: boolean,
  onOutsideClick: () => void
) {
  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, isActive, onOutsideClick])
}
