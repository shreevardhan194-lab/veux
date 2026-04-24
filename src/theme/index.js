// ─────────────────────────────────────────────────────────
//  veux design system — all tokens in one place
//  Import { colors, fonts, radii, shadows } from '../theme'
// ─────────────────────────────────────────────────────────

export const colors = {
  bg:         '#faf8f6',
  surface:    '#ffffff',
  surface2:   '#f5f1ee',
  warm:       '#f7f0ee',

  rose:       '#c9919a',
  roseLight:  '#f0dde0',
  roseMid:    '#e8c5cb',
  roseDeep:   '#a86873',

  text:       '#2a1f22',
  muted:      '#9e8c8f',
  border:     '#ede4e6',

  saleRed:    '#c06b6b',
  saleBg:     '#fde8e8',
  saleBorder: '#f5c0c0',
};

export const fonts = {
  display: "'Cormorant Garamond', serif",
  body:    "'DM Sans', sans-serif",
};

export const radii = {
  sm:   '10px',
  md:   '14px',
  lg:   '18px',
  xl:   '24px',
  full: '9999px',
};

export const shadows = {
  card:  '0 2px 16px rgba(201,145,154,0.10)',
  phone: '0 0 0 10px #d4c8ca, 0 30px 80px rgba(160,100,110,0.25)',
};

// Inline style helpers — use these instead of repeating styles
export const styleHelpers = {
  card: {
    background:   colors.surface,
    borderRadius: radii.lg,
    border:       `1px solid ${colors.border}`,
    padding:      '14px',
  },
  chip: {
    padding:      '7px 16px',
    borderRadius: radii.full,
    border:       `1px solid ${colors.border}`,
    fontSize:     '11px',
    cursor:       'pointer',
    fontFamily:   fonts.body,
    background:   colors.surface,
    color:        colors.muted,
    transition:   'all 0.18s',
  },
  chipActive: {
    background:   colors.rose,
    borderColor:  colors.rose,
    color:        '#fff',
  },
  btn: {
    width:        '100%',
    padding:      '15px',
    background:   colors.rose,
    border:       'none',
    borderRadius: radii.md,
    fontFamily:   fonts.body,
    fontSize:     '13px',
    fontWeight:   500,
    letterSpacing: '0.06em',
    color:        '#fff',
    cursor:       'pointer',
    marginTop:    '20px',
    transition:   'all 0.18s',
  },
};
