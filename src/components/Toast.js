import React from 'react';
import useStore from '../store/useStore';
import { colors, fonts, radii } from '../theme';

export default function Toast() {
  const { message, visible } = useStore((s) => s.toast);

  return (
    <div style={{
      position: 'fixed',
      bottom: 100,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)`,
      background: colors.roseDeep,
      color: '#fff',
      padding: '11px 22px',
      borderRadius: radii.full,
      fontSize: 12,
      fontWeight: 500,
      fontFamily: fonts.body,
      zIndex: 9999,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      whiteSpace: 'nowrap',
      transition: 'all 0.28s ease',
      boxShadow: '0 4px 20px rgba(168,104,115,0.35)',
    }}>
      {message}
    </div>
  );
}
