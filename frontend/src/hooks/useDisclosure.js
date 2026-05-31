import { useCallback, useState } from 'react'

/**
 * Boolean open/close state for modals, drawers, menus, etc.
 * const { isOpen, open, close, toggle } = useDisclosure()
 */
export default function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, open, close, toggle, setIsOpen }
}
