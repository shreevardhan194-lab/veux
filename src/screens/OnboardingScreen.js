import React, { useState } from 'react';
import { QUIZ_QUESTIONS, AVATAR_RECS } from '../data/quizData';
import { generateOutfit } from '../services/claude';
import { colors, fonts, radii } from '../theme';
import useStore from '../store/useStore';

const TOTAL = QUIZ_QUESTIONS.length;

export default function OnboardingScreen() {
  const [step,     setStep]    = useState(0);
  const [phase,    setPhase]   = useState('quiz'); // 'quiz' | 'done' | 'avatar'
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);

  const setQuizAnswer   = useStore((s) => s.setQuizAnswer);
  const quizAnswers     = useStore((s) => s.quizAnswers);
  const setStyleProfile = useStore((s) => s.setStyleProfile);
  const addGenerated    = useStore((s) => s.addGeneratedOutfit);
  const showToast       = useStore((s) => s.showToast);
  const setActiveTab    = useStore((s) => s.setActiveTab);

  const q        = QUIZ_QUESTIONS[step];
  const progress = Math.round(((step + 1) / (TOTAL + 1)) * 100);

  const pick = (label) => {
    if (!q) return;
    if (q.multi) {
      setSelected((prev) => prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]);
    } else {
      setSelected([label]);
    }
  };

  const handleNext = () => {
    if (q) setQuizAnswer(q.id, selected);
    setSelected([]);
    if (step + 1 >= TOTAL) { setPhase('done'); }
    else { setStep((s) => s + 1); }
  };

  const handleBack = () => {
    setSelected([]);
    setStep((s) => Math.max(0, s - 1));
    setPhase('quiz');
  };

  // When quiz done → save profile then auto-generate first outfit
  const handleShowAvatar = async () => {
    const profile = { ...quizAnswers };
    setStyleProfile(profile);
    setPhase('avatar');
    setGenerating(true);
    // auto-generate a first outfit silently
    const { outfit } = await generateOutfit(profile, '', []);
    if (outfit) addGenerated(outfit);
    setGenerating(false);
    showToast('Your first outfit is ready! ✨');
  };

  if (phase === 'avatar') return <AvatarView showToast={showToast} quizAnswers={quizAnswers} generating={generating} setActiveTab={setActiveTab} />;

  if (phase === 'done') {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🌸</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:colors.text, marginBottom:8 }}>Your profile is ready!</div>
        <div style={{ fontSize:13, color:colors.muted, marginBottom:28, lineHeight:1.7 }}>
          We're building your style avatar<br />and generating your first outfit ✨
        </div>
        <button onClick={handleShowAvatar} style={{ padding:'14px 32px', background:colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer' }}>
          Meet my avatar →
        </button>
      </div>
    );
  }

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 4px', fontSize:11, fontWeight:600 }}>
        <span>9:41</span>
        <span style={{ color:colors.muted, fontWeight:400 }}>Step {step + 1} of {TOTAL}</span>
      </div>

      <div style={{ padding:'0 18px 90px' }}>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, display:'block', marginBottom:16, color:colors.text }}>
          v<i style={{ color:colors.rose }}>eux</i>
        </span>

        {/* progress */}
        <div style={{ height:3, background:colors.roseLight, borderRadius:3, marginBottom:22, overflow:'hidden' }}>
          <div style={{ height:'100%', background:colors.rose, borderRadius:3, width:`${progress}%`, transition:'width 0.4s ease' }} />
        </div>

        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:colors.text, lineHeight:1.3, marginBottom:5 }}>{q.question}</div>
        <div style={{ fontSize:12, color:colors.muted, marginBottom:20, lineHeight:1.5 }}>{q.subtitle}</div>

        <div style={{ display: q.multi ? 'grid' : 'flex', gridTemplateColumns: q.multi ? '1fr 1fr' : undefined, flexDirection: q.multi ? undefined : 'column', gap:9 }}>
          {q.options.map((opt) => {
            const on = selected.includes(opt.label);
            return (
              <button key={opt.label} onClick={() => pick(opt.label)} style={{
                padding: q.multi ? 13 : '13px 16px',
                borderRadius:radii.md, border:`1px solid ${on ? colors.rose : colors.border}`,
                cursor:'pointer', fontSize:13,
                background: on ? colors.roseLight : colors.surface,
                color: on ? colors.roseDeep : colors.text,
                display:'flex', alignItems: q.multi ? 'flex-start' : 'center',
                flexDirection: q.multi ? 'column' : 'row',
                gap: q.multi ? 4 : 10, textAlign:'left',
                fontFamily:fonts.body, fontWeight: on ? 500 : 400,
                transition:'all 0.18s',
              }}>
                {opt.icon && <span style={{ fontSize:20 }}>{opt.icon}</span>}
                <div>
                  <div>{opt.label}</div>
                  {opt.desc && <div style={{ fontSize:10, color: on ? colors.roseDeep : colors.muted, lineHeight:1.4, marginTop:1 }}>{opt.desc}</div>}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleNext} style={{ width:'100%', padding:15, background:colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, letterSpacing:'.06em', color:'#fff', cursor:'pointer', marginTop:20, transition:'all 0.18s' }}>
          Continue →
        </button>
        {step > 0 && (
          <button onClick={handleBack} style={{ fontSize:12, color:colors.muted, textAlign:'center', marginTop:10, cursor:'pointer', fontFamily:fonts.body, background:'none', border:'none', display:'block', width:'100%' }}>
            ← go back
          </button>
        )}
      </div>
    </div>
  );
}

function AvatarView({ quizAnswers, showToast, generating, setActiveTab }) {
  const [outfit,      setOutfit]      = useState('👗');
  const [selectedRec, setSelectedRec] = useState(null);
  const wardrobeItems  = useStore((s) => s.wardrobeItems);

  const vibe    = quizAnswers.vibe?.[0]       || 'Clean Girl';
  const size    = quizAnswers.size?.[0]       || 'S / US 4–6';
  const budget  = quizAnswers.budget?.[0]     || '$30–$80';
  const skin    = quizAnswers.skinTone?.[0]   || 'Medium Warm';
  const climate = quizAnswers.climate?.[0]    || 'Four seasons';
  const hair    = quizAnswers.hairType?.[0]   || 'Wavy';

  const tryRandom = () => {
    const opts = ['👗','🧥','👘','🩱','🥻','✨'];
    setOutfit(opts[Math.floor(Math.random() * opts.length)]);
    showToast('New outfit tried on! 👗');
  };

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 4px', fontSize:11, fontWeight:600 }}>
        <span>9:41</span>
        <span style={{ color:colors.muted, fontWeight:400 }}>Your Avatar</span>
      </div>

      <div style={{ padding:'0 18px 90px' }}>
        {/* avatar card */}
        <div style={{ background:colors.surface, borderRadius:radii.xl, border:`1px solid ${colors.border}`, padding:20, marginBottom:14 }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:18 }}>
            {/* figure */}
            <div style={{ width:110, height:160, flexShrink:0, background:'linear-gradient(160deg,#f5e8ea,#ede0e3)', borderRadius:20, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:46, height:22, borderRadius:'23px 23px 0 0', background:'#8b6055' }} />
              <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', width:42, height:42, borderRadius:'50%', background:'#dab9bd' }} />
              <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', width:62, height:66, background:'#c9b0b4', borderRadius:'16px 16px 0 0' }} />
              <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:50, height:28, background:'#b8949a' }} />
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:42, opacity:.75 }}>{outfit}</div>
            </div>

            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:colors.text, marginBottom:4 }}>Your Style Avatar</div>
              <div style={{ display:'inline-block', padding:'4px 12px', background:colors.roseLight, borderRadius:radii.full, fontSize:11, color:colors.roseDeep, marginBottom:12, fontWeight:500 }}>{vibe} ✦</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {[['Size',size],['Budget',budget],['Skin',skin],['Climate',climate],['Hair',hair]].map(([k,v]) => (
                  <div key={k} style={{ fontSize:12, color:colors.muted }}>{k} <span style={{ color:colors.text, fontWeight:500 }}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* actions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['📸','Upload closet', () => setActiveTab('profile')],
              ['✏️','Edit profile',  () => showToast('Edit profile coming soon!')],
              ['👗','Try on outfit', tryRandom],
              ['✨','Get outfit',    () => setActiveTab('designer')],
            ].map(([icon, label, fn]) => (
              <div key={label} onClick={fn} style={{ padding:12, borderRadius:radii.md, border:`1px solid ${colors.border}`, fontSize:12, color:colors.text, cursor:'pointer', background:colors.surface, textAlign:'center', fontFamily:fonts.body, transition:'all 0.18s' }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        {/* generating spinner */}
        {generating && (
          <div style={{ textAlign:'center', padding:'20px 0', color:colors.muted, fontSize:13 }}>
            Generating your first outfit… ✨
          </div>
        )}

        {/* recs */}
        <div style={{ fontSize:10, color:colors.muted, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Try on a look</div>
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>
          {AVATAR_RECS.map((r) => (
            <div key={r.label} style={{ flexShrink:0, width:94, cursor:'pointer', textAlign:'center' }}
              onClick={() => { setSelectedRec(r.label); setOutfit(r.emoji); showToast('Trying on look… ✨'); }}>
              <div style={{ width:94, height:118, borderRadius:radii.md, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, border:`${selectedRec===r.label ? 2 : 1.5}px solid ${selectedRec===r.label ? colors.rose : colors.border}`, background: selectedRec===r.label ? colors.roseLight : colors.warm, transition:'all 0.18s' }}>{r.emoji}</div>
              <div style={{ fontSize:10, color:colors.muted, marginTop:5 }}>{r.label}</div>
            </div>
          ))}
        </div>

        <button onClick={() => setActiveTab('designer')} style={{ width:'100%', padding:15, background:colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer', marginTop:16 }}>
          ✨ Design outfits with AI
        </button>
      </div>
    </div>
  );
}
