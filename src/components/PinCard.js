import React, { useState } from 'react';
import useStore from '../store/useStore';
import { radii, colors } from '../theme';

export default function PinCard({ pin }) {
  const [showInfo, setShowInfo] = useState(false);
  const savedPins      = useStore((s) => s.savedPins);
  const toggleSavedPin = useStore((s) => s.toggleSavedPin);
  const showToast      = useStore((s) => s.showToast);

  const saved = savedPins.has(pin.id);

  const handleTap = () => {
    setShowInfo(true);
    setTimeout(() => setShowInfo(false), 2500);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    toggleSavedPin(pin.id);
    showToast(saved ? 'Removed from collection' : 'Saved to your collection! 🩷');
  };

  return (
    <div
      onClick={handleTap}
      style={{
        borderRadius: radii.lg,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        marginBottom: 6,
        background: colors.surface2,
      }}
    >
      <div style={{
        width: '100%',
        height: pin.height,
        background: pin.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 52,
        position: 'relative',
      }}>
        <span style={{ zIndex: 1 }}>{pin.emoji}</span>

        {/* gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, rgba(42,31,34,0.62), transparent)',
        }} />

        {/* info overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 12, opacity: showInfo ? 1 : 0, transition: 'opacity 0.22s',
        }}>
          <div style={{ fontSize: 9, color: '#f0dde0', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {pin.brand}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: '#fff', lineHeight: 1.2, marginTop: 1 }}>
            {pin.name}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.82)', marginTop: 3 }}>
            {pin.price} · Shop this look →
          </div>
        </div>

        {/* sale badge */}
        {pin.sale && (
          <div style={{
            position: 'absolute', top: 9, left: 9,
            background: colors.saleRed, color: '#fff',
            fontSize: 9, fontWeight: 500, padding: '3px 9px',
            borderRadius: radii.full, letterSpacing: '.04em',
          }}>
            {pin.sale}
          </div>
        )}

        {/* heart */}
        <button
          onClick={handleSave}
          style={{
            position: 'absolute', top: 9, right: 9,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', fontSize: 14, cursor: 'pointer',
            opacity: showInfo || saved ? 1 : 0,
            transition: 'opacity 0.18s',
          }}
        >
          {saved ? '🩷' : '🤍'}
        </button>
      </div>
    </div>
  );
}
