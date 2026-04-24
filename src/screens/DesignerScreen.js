import React, { useState } from 'react';
import { generateOutfit, generateWeekPlan } from '../services/claude';
import { colors, fonts, radii } from '../theme';
import useStore from '../store/useStore';

const MOODS    = ['Casual day 🌤️','School / uni 📚','Work 💼','Going out 🎉','First date 🌸','Gym 🏋️','Brunch ☕','Interview 👔','Shopping 🛍️','Beach 🌊'];
const CLIMATES = ['Hot & sunny ☀️','Warm & mild 🌤️','Cool & breezy 🍃','Cold & layered ❄️','Rainy 🌧️'];

function StatusBar({ right = '' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 4px', fontSize:11, fontWeight:600, color:colors.text }}>
      <span>9:41</span>
      <span style={{ color:colors.muted, fontWeight:400 }}>{right}</span>
    </div>
  );
}

export default function DesignerScreen() {
  const styleProfile      = useStore((s) => s.styleProfile);
  const quizComplete      = useStore((s) => s.quizComplete);
  const wardrobeItems     = useStore((s) => s.wardrobeItems);
  const generatedOutfits  = useStore((s) => s.generatedOutfits);
  const addGenerated      = useStore((s) => s.addGeneratedOutfit);
  const clearGenerated    = useStore((s) => s.clearGeneratedOutfits);
  const showToast         = useStore((s) => s.showToast);
  const setActiveTab      = useStore((s) => s.setActiveTab);

  const [mode,        setMode]        = useState('today');
  const [mood,        setMood]        = useState('');
  const [climate,     setClimate]     = useState('');
  const [extraNote,   setExtraNote]   = useState('');
  const [useWardrobe, setUseWardrobe] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [viewOutfit,  setViewOutfit]  = useState(null);

  const handleGenerate = async () => {
    if (!quizComplete) {
      showToast('Complete your style quiz first 🎀');
      setActiveTab('style');
      return;
    }
    setLoading(true);
    clearGenerated();
    const context  = [mood, climate, extraNote].filter(Boolean).join(' · ');
    const wardrobe = useWardrobe ? wardrobeItems : [];

    if (mode === 'today') {
      const { outfit } = await generateOutfit(styleProfile, context, wardrobe);
      if (outfit) addGenerated(outfit);
    } else {
      const { plan } = await generateWeekPlan(styleProfile, context, wardrobe);
      if (plan) plan.forEach((o) => addGenerated(o));
    }
    setLoading(false);
    showToast('✨ Your look is ready!');
  };

  if (viewOutfit) {
    return <OutfitDetail outfit={viewOutfit} onBack={() => setViewOutfit(null)} showToast={showToast} />;
  }

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <StatusBar right="AI Stylist" />
      <div style={{ padding:'0 18px 90px' }}>

        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:colors.text, marginBottom:2 }}>
          v<i style={{ color:colors.rose }}>eux</i> Designer
        </div>
        <div style={{ fontSize:12, color:colors.muted, marginBottom:18 }}>Tell me what's happening — I'll dress you</div>

        {/* profile badge */}
        {quizComplete ? (
          <div style={{ background:colors.roseLight, borderRadius:radii.lg, padding:'10px 14px', marginBottom:16, border:`1px solid ${colors.roseMid}`, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:16 }}>🎀</span>
            <div>
              <div style={{ fontSize:9, color:colors.roseDeep, letterSpacing:'.07em', textTransform:'uppercase' }}>Style profile active</div>
              <div style={{ fontSize:13, color:colors.text, fontWeight:500, marginTop:1 }}>
                {styleProfile?.vibe?.[0] || 'Clean Girl'} · {styleProfile?.size?.[0] || 'M'} · {styleProfile?.budget?.[0] || '$30–$80'}
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => setActiveTab('style')} style={{ background:colors.surface2, borderRadius:radii.lg, padding:'12px 16px', marginBottom:16, border:`1px solid ${colors.border}`, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:colors.muted }}>Complete style quiz to unlock AI outfits</span>
            <span style={{ color:colors.rose }}>→</span>
          </div>
        )}

        {/* mode toggle */}
        <div style={{ display:'flex', background:colors.surface2, borderRadius:radii.full, padding:3, marginBottom:18, border:`1px solid ${colors.border}` }}>
          {[['today',"Today's Outfit 🌤️"],['week','Week Plan 📅']].map(([m, lbl]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'9px 0', borderRadius:radii.full, border:'none', cursor:'pointer', fontFamily:fonts.body, fontSize:12, fontWeight: mode===m ? 500 : 400, background: mode===m ? colors.rose : 'transparent', color: mode===m ? '#fff' : colors.muted, transition:'all 0.2s' }}>{lbl}</button>
          ))}
        </div>

        {/* mood */}
        <Label>What's happening {mode==='week' ? 'this week?' : 'today?'}</Label>
        <ChipRow items={MOODS} selected={mood} onSelect={(v) => setMood(mood===v ? '' : v)} />

        {/* climate */}
        <Label style={{ marginTop:14 }}>Today's weather</Label>
        <ChipRow items={CLIMATES} selected={climate} onSelect={(v) => setClimate(climate===v ? '' : v)} />

        {/* free text */}
        <input
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
          placeholder="Anything else? (e.g. 'presentation at 2pm')"
          style={{ width:'100%', padding:'11px 14px', borderRadius:radii.md, border:`1px solid ${colors.border}`, fontFamily:fonts.body, fontSize:13, color:colors.text, background:colors.surface, outline:'none', marginTop:14, marginBottom:14 }}
        />

        {/* wardrobe toggle */}
        {wardrobeItems.length > 0 && (
          <div onClick={() => setUseWardrobe((v) => !v)} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, cursor:'pointer' }}>
            <Toggle on={useWardrobe} />
            <div style={{ fontSize:12, color:colors.text }}>Include my wardrobe <span style={{ color:colors.muted }}>({wardrobeItems.length} items)</span></div>
          </div>
        )}

        {/* generate */}
        <button onClick={handleGenerate} disabled={loading} style={{ width:'100%', padding:15, background: loading ? colors.roseMid : colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, color:'#fff', cursor: loading ? 'wait' : 'pointer', transition:'all 0.2s', letterSpacing:'.04em' }}>
          {loading ? (mode==='week' ? 'Planning your week… 📅' : 'Styling you… ✨') : (mode==='week' ? '📅 Plan my week' : '✨ Style me for today')}
        </button>

        {/* results */}
        {!loading && generatedOutfits.length > 0 && (
          <div style={{ marginTop:24 }}>
            <Label>{mode==='week' ? `Your week — ${generatedOutfits.length} outfits` : 'Your outfit'}</Label>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:10 }}>
              {generatedOutfits.map((outfit, i) => (
                <OutfitCard key={i} outfit={outfit} onClick={() => setViewOutfit(outfit)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, style = {} }) {
  return <div style={{ fontSize:11, color:colors.muted, letterSpacing:'.07em', textTransform:'uppercase', ...style }}>{children}</div>;
}

function Toggle({ on }) {
  return (
    <div style={{ width:38, height:22, borderRadius:radii.full, background: on ? colors.rose : colors.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: on ? 18 : 2, transition:'left 0.2s' }} />
    </div>
  );
}

function ChipRow({ items, selected, onSelect }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:8 }}>
      {items.map((item) => {
        const on = selected === item;
        return (
          <button key={item} onClick={() => onSelect(item)} style={{ padding:'6px 12px', borderRadius:radii.full, fontSize:11, border:`1px solid ${on ? colors.rose : colors.border}`, cursor:'pointer', fontFamily:fonts.body, background: on ? colors.roseLight : colors.surface, color: on ? colors.roseDeep : colors.muted, transition:'all 0.18s' }}>{item}</button>
        );
      })}
    </div>
  );
}

function OutfitCard({ outfit, onClick }) {
  return (
    <div onClick={onClick} style={{ background:colors.surface, borderRadius:radii.lg, border:`1px solid ${colors.border}`, padding:'14px 16px', cursor:'pointer' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          {outfit.day && <div style={{ fontSize:9, color:colors.muted, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:2 }}>{outfit.day}</div>}
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:colors.text }}>{outfit.outfitName}</div>
          <div style={{ fontSize:11, color:colors.muted, marginTop:1 }}>{outfit.occasion}</div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {(outfit.colorPalette || []).map((hex, i) => <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:hex, border:`1px solid ${colors.border}` }} />)}
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
        {(outfit.pieces || []).slice(0,3).map((p, i) => (
          <span key={i} style={{ padding:'3px 9px', background:colors.surface2, borderRadius:radii.full, fontSize:10, color:colors.muted, border:`1px solid ${colors.border}` }}>{p.item}</span>
        ))}
        {outfit.pieces?.length > 3 && <span style={{ padding:'3px 9px', background:colors.surface2, borderRadius:radii.full, fontSize:10, color:colors.muted }}>+{outfit.pieces.length-3}</span>}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}><span style={{ fontSize:12, color:colors.rose }}>View full look →</span></div>
    </div>
  );
}

function OutfitDetail({ outfit, onBack, showToast }) {
  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'32px 18px 0' }}>
        <button onClick={onBack} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:colors.muted, padding:0, lineHeight:1 }}>←</button>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:colors.text }}>{outfit.outfitName}</div>
      </div>
      <div style={{ padding:'16px 18px 90px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ display:'inline-block', padding:'4px 12px', background:colors.roseLight, borderRadius:radii.full, fontSize:11, color:colors.roseDeep, fontWeight:500 }}>{outfit.vibe}</div>
          <div style={{ fontSize:11, color:colors.muted }}>{outfit.occasion}</div>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          {(outfit.colorPalette || []).map((hex, i) => <div key={i} style={{ width:32, height:32, borderRadius:'50%', background:hex, border:`1px solid ${colors.border}` }} />)}
        </div>

        <div style={{ fontSize:10, color:colors.muted, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:10 }}>The look</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
          {(outfit.pieces || []).map((piece, i) => (
            <div key={i} style={{ background:colors.surface, borderRadius:radii.md, border:`1px solid ${colors.border}`, padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:9, color:colors.rose, letterSpacing:'.09em', textTransform:'uppercase', marginBottom:2 }}>{piece.category}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:colors.text }}>{piece.item}</div>
                  <div style={{ fontSize:11, color:colors.muted, marginTop:2 }}>{piece.color} · {piece.fit}</div>
                  <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                    {(piece.searchKeywords || []).map((kw, j) => (
                      <span key={j} style={{ fontSize:9, padding:'2px 8px', background:colors.surface2, borderRadius:radii.full, color:colors.muted, border:`1px solid ${colors.border}` }}>{kw}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize:12, color:colors.roseDeep, fontWeight:500, marginLeft:10, flexShrink:0 }}>{piece.budgetRange}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:colors.roseLight, borderRadius:radii.lg, padding:'14px 16px', marginBottom:18, border:`1px solid ${colors.roseMid}` }}>
          <div style={{ fontSize:9, color:colors.roseDeep, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Styling tip ✦</div>
          <div style={{ fontSize:13, color:colors.text, lineHeight:1.6 }}>{outfit.stylingTip}</div>
        </div>

        {outfit.wardrobePieces?.length > 0 && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:10, color:colors.muted, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>From your wardrobe</div>
            {outfit.wardrobePieces.map((p, i) => (
              <div key={i} style={{ fontSize:12, color:colors.text, padding:'6px 0', borderBottom:`1px solid ${colors.border}` }}>🧺 {p}</div>
            ))}
          </div>
        )}

        <button onClick={() => showToast('🛍️ Shop look — coming soon!')} style={{ width:'100%', padding:14, background:colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer' }}>🛍️ Shop this look</button>
      </div>
    </div>
  );
}
