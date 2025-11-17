export const SPACING = {
  // Navbar height and corresponding padding
  NAVBAR_HEIGHT: '64px', // h-16
  PAGE_TOP_PADDING: 'pt-24', // 96px - spacing from top to clear navbar
  PAGE_TOP_PADDING_COMPACT: 'pt-20', // 80px - for pages that need less spacing
  PAGE_TOP_PADDING_LARGE: 'pt-28', // 112px - for pages that need more spacing
  PAGE_TOP_PADDING_XLARGE: 'pt-32', // 128px - for pages that need extra spacing

  // Common paddings
  PAGE_HORIZONTAL_PADDING: 'px-6', // 24px
  PAGE_BOTTOM_PADDING: 'pb-12', // 48px

  // Container widths
  CONTAINER_MAX_WIDTH_SM: 'max-w-md', // 448px
  CONTAINER_MAX_WIDTH_MD: 'max-w-2xl', // 672px
  CONTAINER_MAX_WIDTH_LG: 'max-w-4xl', // 896px
  CONTAINER_MAX_WIDTH_XL: 'max-w-7xl', // 1280px

  // Common gaps
  GAP_SM: 'gap-2', // 8px
  GAP_MD: 'gap-4', // 16px
  GAP_LG: 'gap-6', // 24px
  GAP_XL: 'gap-8', // 32px

  // Common spacing
  SPACE_SM: 'space-y-2', // 8px vertical
  SPACE_MD: 'space-y-4', // 16px vertical
  SPACE_LG: 'space-y-6', // 24px vertical

  // Common margins
  MARGIN_BOTTOM_SM: 'mb-2', // 8px
  MARGIN_BOTTOM_MD: 'mb-4', // 16px
  MARGIN_BOTTOM_LG: 'mb-6', // 24px
  MARGIN_BOTTOM_XL: 'mb-8', // 32px
} as const;

export const LAYOUT = {
  // Common page wrapper
  PAGE: `min-h-screen bg-black ${SPACING.PAGE_TOP_PADDING_LARGE} ${SPACING.PAGE_HORIZONTAL_PADDING} ${SPACING.PAGE_BOTTOM_PADDING}`,
  PAGE_COMPACT: `min-h-screen bg-black ${SPACING.PAGE_TOP_PADDING} ${SPACING.PAGE_HORIZONTAL_PADDING} ${SPACING.PAGE_BOTTOM_PADDING}`,

  // Common container
  CONTAINER_LG: `${SPACING.CONTAINER_MAX_WIDTH_LG} mx-auto`,
  CONTAINER_MD: `${SPACING.CONTAINER_MAX_WIDTH_MD} mx-auto`,
  CONTAINER_SM: `${SPACING.CONTAINER_MAX_WIDTH_SM} mx-auto`,

  // Card styles
  CARD: 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8',
  CARD_COMPACT: 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6',
  CARD_SIMPLE: 'bg-gray-900 border border-gray-800 rounded-lg p-6',
} as const;

export const COLORS = {
  // Text colors
  TEXT_PRIMARY: 'text-white',
  TEXT_SECONDARY: 'text-gray-300',
  TEXT_MUTED: 'text-gray-400',
  TEXT_SUBTLE: 'text-gray-500',

  // Background colors
  BG_PRIMARY: 'bg-black',
  BG_CARD: 'bg-white/10',
  BG_CARD_DARK: 'bg-gray-900',
  BG_INPUT: 'bg-white/5',
  BG_INPUT_DARK: 'bg-gray-800',

  // Border colors
  BORDER_LIGHT: 'border-white/20',
  BORDER_DARK: 'border-gray-800',
  BORDER_DARKER: 'border-gray-700',
} as const;

export const BUTTONS = {
  // Primary button
  PRIMARY: 'px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all shadow-lg cursor-pointer',
  PRIMARY_DISABLED: 'opacity-50 cursor-not-allowed',

  // Secondary button
  SECONDARY: 'px-6 py-2.5 bg-gray-800 text-white font-medium rounded-full hover:bg-gray-700 transition-colors cursor-pointer',

  // Tab button (active)
  TAB_ACTIVE: 'px-4 py-2 rounded-full text-sm font-medium bg-white text-black transition-all cursor-pointer',

  // Tab button (inactive)
  TAB_INACTIVE: 'px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer',

  // Icon button
  ICON: 'p-2 text-gray-400 hover:text-white transition-colors cursor-pointer',
} as const;
