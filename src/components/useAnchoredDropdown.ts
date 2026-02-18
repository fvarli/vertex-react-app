import { type CSSProperties, type RefObject, useLayoutEffect, useState } from 'react'

const VIEWPORT_GUTTER = 8
const MENU_VERTICAL_GAP = 8
const MIN_MENU_WIDTH = 140
const ESTIMATED_MENU_HEIGHT = 180

type MenuStyle = CSSProperties

export function useAnchoredDropdown(open: boolean, anchorRef: RefObject<HTMLElement | null>): MenuStyle {
  const [menuStyle, setMenuStyle] = useState<MenuStyle>({})

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuWidth = Math.max(MIN_MENU_WIDTH, rect.width)

      const maxLeft = viewportWidth - menuWidth - VIEWPORT_GUTTER
      const left = Math.min(Math.max(VIEWPORT_GUTTER, rect.right - menuWidth), Math.max(VIEWPORT_GUTTER, maxLeft))

      const spaceBelow = viewportHeight - rect.bottom
      const shouldOpenUpward = spaceBelow < ESTIMATED_MENU_HEIGHT && rect.top > ESTIMATED_MENU_HEIGHT
      const top = shouldOpenUpward
        ? Math.max(VIEWPORT_GUTTER, rect.top - ESTIMATED_MENU_HEIGHT - MENU_VERTICAL_GAP)
        : rect.bottom + MENU_VERTICAL_GAP

      setMenuStyle({
        left,
        top,
        minWidth: menuWidth,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, open])

  return menuStyle
}
