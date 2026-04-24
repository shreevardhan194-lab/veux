import React, { useState } from 'react';
import PinCard from '../components/PinCard';
import { PINS, CATEGORIES } from '../data/feedData';
import { colors, fonts, radii } from '../theme';

export default function InspoScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? PINS : PINS.filter((p) => p.category === activeCategory);
  const col1 = filtered.filter((_, i) => i % 2 === 0);
  const col2 = filtered.filter((_, i) => i % 2 !== 0);

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 4px', fontSize:11, fontWeight:600 }}>
        <span>9:41</span><span>●●●</span>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 18px 10px' }}>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:colors.text }}>
          v<i style={{ fontStyle:'italic', color:colors.rose }}>eux</i>
        </span>
        <div style={{ display:'flex', gap:12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </div>
      </div>

      <div style={{ margin:'0 18px 10px', background:colors.surface2, borderRadius:radii.full, display:'flex', alignItems:'center', gap:8, padding:'10px 16px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="search styles, brands, vibes…" readOnly style={{ border:'none', background:'transparent', fontSize:13, color:colors.text, width:'100%', outline:'none', fontFamily:fonts.body }} />
      </div>

      <div style={{ display:'flex', gap:8, padding:'0 18px 12px', overflowX:'auto' }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink:0, padding:'7px 16px', borderRadius:radii.full, fontSize:11, border:'1px solid', cursor:'pointer', fontFamily:fonts.body, borderColor: activeCategory===cat ? colors.rose : colors.border, background: activeCategory===cat ? colors.rose : colors.surface, color: activeCategory===cat ? '#fff' : colors.muted, transition:'all 0.18s' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display:'flex', gap:6, padding:'0 10px 90px' }}>
        <div style={{ flex:1 }}>{col1.map((pin) => <PinCard key={pin.id} pin={pin} />)}</div>
        <div style={{ flex:1 }}>{col2.map((pin) => <PinCard key={pin.id} pin={pin} />)}</div>
      </div>
    </div>
  );
}
