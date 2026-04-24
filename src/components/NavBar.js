import React from 'react';
import useStore from '../store/useStore';
import { colors, fonts } from '../theme';

const TABS = [
  { id:'feed',     label:'Feed',    emoji:'⊞'  },
  { id:'shop',     label:'Shop',    emoji:'🛍' },
  { id:'designer', label:'Outfit',  emoji:'✨' },
  { id:'style',    label:'Quiz',    emoji:'🎀' },
  { id:'profile',  label:'Me',      emoji:'👤' },
];

export default function NavBar() {
  const activeTab    = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  return (
    <nav style={{
      display:'flex', justifyContent:'space-around', alignItems:'center',
      height:72, borderTop:`1px solid ${colors.border}`,
      background:'rgba(250,248,246,0.97)', backdropFilter:'blur(20px)',
      paddingBottom:8, flexShrink:0, zIndex:100,
    }}>
      {TABS.map(({ id, label, emoji }) => {
        const on = activeTab === id;
        return (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            border:'none', background:'none', cursor:'pointer', padding:'6px 10px',
            color: on ? colors.rose : colors.muted,
            fontFamily:fonts.body, fontSize:9, letterSpacing:'.07em',
            textTransform:'uppercase', transition:'color 0.2s',
          }}>
            <span style={{ fontSize:18 }}>{emoji}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
