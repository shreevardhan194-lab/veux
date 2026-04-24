import React, { useState, useRef } from 'react';
import { colors, fonts, radii } from '../theme';
import useStore from '../store/useStore';
import { uploadWardrobeImage, addWardrobeItem, fetchWardrobe } from '../services/supabase';

const OUTFIT_GRID = [
  {emoji:'👗',likes:'2.1k'},{emoji:'🧥',likes:'891'},{emoji:'👟',likes:'3.4k'},
  {emoji:'👜',likes:'1.2k'},{emoji:'🕶️',likes:'567'},{emoji:'🩴',likes:'4.1k'},
  {emoji:'🧣',likes:'889'},{emoji:'🩱',likes:'2.7k'},{emoji:'💍',likes:'1.1k'},
  {emoji:'👖',likes:'432'},{emoji:'🌸',likes:'678'},{emoji:'🎀',likes:'3.2k'},
];

const WARDROBE_CATS = ['All','Tops','Bottoms','Dresses','Outerwear','Shoes','Bags','Accessories'];

export default function ProfileScreen() {
  const [activeTab,  setActiveTab]  = useState(0); // 0=Outfits, 1=Wardrobe, 2=Saved
  const [following,  setFollowing]  = useState(false);
  const [wardrobeFilter, setWardrobeFilter] = useState('All');
  const [uploading,  setUploading]  = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const wardrobeItems    = useStore((s) => s.wardrobeItems);
  const addWardrobeItem_ = useStore((s) => s.addWardrobeItem);
  const removeWardrobe   = useStore((s) => s.removeWardrobeItem);
  const user             = useStore((s) => s.user);
  const showToast        = useStore((s) => s.showToast);

  const tabs = ['Outfits','Wardrobe','Saved'];

  const filteredWardrobe = wardrobeFilter === 'All'
    ? wardrobeItems
    : wardrobeItems.filter((i) => i.category === wardrobeFilter);

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 0', fontSize:11, fontWeight:600 }}>
        <span>9:41</span><span>●●●</span>
      </div>

      {/* cover */}
      <div style={{ height:110, background:'linear-gradient(135deg,#f5dde2,#f2e8f5,#e8eef8)', position:'relative' }}>
        <div style={{ position:'absolute', bottom:-34, left:20, width:70, height:70, borderRadius:'50%', border:`3px solid ${colors.bg}`, background:colors.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>🌸</div>
        <button style={{ position:'absolute', top:12, right:12, padding:'7px 14px', background:'rgba(255,255,255,0.72)', borderRadius:radii.full, fontSize:11, color:colors.text, border:`1px solid ${colors.border}`, cursor:'pointer', fontFamily:fonts.body, backdropFilter:'blur(8px)' }}>
          Edit profile
        </button>
      </div>

      {/* name + follow */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'44px 20px 8px' }}>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:colors.text, fontWeight:500 }}>
            {user?.user_metadata?.username || 'Your Profile'}
          </div>
          <div style={{ fontSize:11, color:colors.muted, marginTop:2 }}>
            {user?.email || '@veux.user'} · Clean Girl
          </div>
        </div>
        <button onClick={() => { setFollowing(f => !f); showToast(following ? 'Unfollowed' : 'Following! 🌸'); }}
          style={{ padding:'9px 20px', border:`1.5px solid ${colors.rose}`, borderRadius:radii.full, fontSize:12, fontWeight:500, fontFamily:fonts.body, cursor:'pointer', transition:'all 0.2s', color: following ? '#fff' : colors.rose, background: following ? colors.rose : 'transparent' }}>
          {following ? 'Following ✓' : 'Follow'}
        </button>
      </div>

      <div style={{ padding:'0 20px 14px', fontSize:12, color:colors.muted, lineHeight:1.6 }}>
        "obsessed with quiet luxury & clean girl vibes 🤍"
      </div>

      {/* stats */}
      <div style={{ display:'flex', padding:'0 20px 16px' }}>
        {[['312','Outfits'],['14.2k','Followers'],['892','Following'],['$2.4k','Saved']].map(([n,l]) => (
          <div key={l} style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:19, fontWeight:500, color:colors.text }}>{n}</div>
            <div style={{ fontSize:9, color:colors.muted, textTransform:'uppercase', letterSpacing:'.07em', marginTop:1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${colors.border}` }}>
        {tabs.map((t, i) => (
          <div key={t} onClick={() => setActiveTab(i)} style={{ flex:1, textAlign:'center', padding:'11px 0', fontSize:10, color: activeTab===i ? colors.rose : colors.muted, cursor:'pointer', borderBottom:`2px solid ${activeTab===i ? colors.rose : 'transparent'}`, letterSpacing:'.05em', textTransform:'uppercase', fontFamily:fonts.body, transition:'all 0.18s', fontWeight: activeTab===i ? 500 : 400 }}>{t}</div>
        ))}
      </div>

      {/* ── OUTFITS tab ── */}
      {activeTab === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, paddingBottom:90 }}>
          {OUTFIT_GRID.map((item, i) => (
            <div key={i} onClick={() => showToast('Liked! 🩷')} style={{ aspectRatio:.75, background:colors.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, cursor:'pointer', position:'relative', overflow:'hidden' }}>
              {item.emoji}
              <div style={{ position:'absolute', bottom:6, right:7, fontSize:9, color:'#fff', background:'rgba(42,31,34,.45)', borderRadius:12, padding:'3px 7px' }}>🩷 {item.likes}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── WARDROBE tab ── */}
      {activeTab === 1 && (
        <div style={{ padding:'12px 18px 90px' }}>
          {/* category filter */}
          <div style={{ display:'flex', gap:7, overflowX:'auto', marginBottom:14, paddingBottom:2 }}>
            {WARDROBE_CATS.map((cat) => (
              <button key={cat} onClick={() => setWardrobeFilter(cat)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:radii.full, fontSize:10, border:'1px solid', cursor:'pointer', fontFamily:fonts.body, borderColor: wardrobeFilter===cat ? colors.rose : colors.border, background: wardrobeFilter===cat ? colors.rose : colors.surface, color: wardrobeFilter===cat ? '#fff' : colors.muted, transition:'all 0.18s' }}>{cat}</button>
            ))}
          </div>

          {/* add button */}
          <button onClick={() => setShowAddModal(true)} style={{ width:'100%', padding:'11px', background:colors.roseLight, border:`1px dashed ${colors.roseMid}`, borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, color:colors.roseDeep, cursor:'pointer', marginBottom:14 }}>
            + Add to wardrobe
          </button>

          {/* wardrobe grid */}
          {filteredWardrobe.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:colors.muted, fontSize:13 }}>
              Your wardrobe is empty.<br />Add items to get personalised outfit suggestions!
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {filteredWardrobe.map((item) => (
                <WardrobeItem key={item.id} item={item} onRemove={() => { removeWardrobe(item.id); showToast('Removed from wardrobe'); }} />
              ))}
            </div>
          )}

          {/* add modal */}
          {showAddModal && (
            <AddItemModal
              onClose={() => setShowAddModal(false)}
              onAdd={(item) => { addWardrobeItem_(item); showToast('Added to wardrobe! 🧺'); setShowAddModal(false); }}
              user={user}
              uploading={uploading}
              setUploading={setUploading}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* ── SAVED tab ── */}
      {activeTab === 2 && (
        <div style={{ padding:'20px 18px 90px', textAlign:'center', color:colors.muted, fontSize:13 }}>
          Items you save from the feed will appear here 🩷
        </div>
      )}
    </div>
  );
}

// ── Wardrobe item card ────────────────────────────────────────────────────────
function WardrobeItem({ item, onRemove }) {
  return (
    <div style={{ background:colors.surface, borderRadius:radii.md, border:`1px solid ${colors.border}`, overflow:'hidden', position:'relative' }}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} style={{ width:'100%', height:110, objectFit:'cover', display:'block' }} />
      ) : (
        <div style={{ width:'100%', height:110, background:colors.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>
          {catEmoji(item.category)}
        </div>
      )}
      <div style={{ padding:'8px 10px 10px' }}>
        <div style={{ fontSize:12, color:colors.text, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize:10, color:colors.muted, marginTop:2 }}>{item.color} · {item.category}</div>
      </div>
      <button onClick={onRemove} style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.88)', border:'none', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', color:colors.muted }}>×</button>
    </div>
  );
}

// ── Add item modal ────────────────────────────────────────────────────────────
function AddItemModal({ onClose, onAdd, user, uploading, setUploading, showToast }) {
  const [form, setForm] = useState({ name:'', category:'Tops', color:'', brand:'', size:'', notes:'' });
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  const CATS = ['Tops','Bottoms','Dresses','Outerwear','Shoes','Bags','Accessories','Jewellery'];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    if (user) {
      setUploading(true);
      const { url, error } = await uploadWardrobeImage(user.id, file);
      setUploading(false);
      if (!error && url) { setImageUrl(url); showToast('Photo uploaded! 📸'); }
      else { showToast('Using local preview (configure Supabase Storage to save)'); }
    } else {
      showToast('Sign in to save photos to your account');
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { showToast('Add a name for the item'); return; }
    onAdd({ ...form, image_url: imageUrl || imagePreview || '', id: Date.now().toString(), created_at: new Date().toISOString() });
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(42,31,34,0.5)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:colors.bg, borderRadius:'24px 24px 0 0', width:'100%', maxWidth:390, padding:'20px 20px 40px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:colors.text }}>Add to wardrobe</div>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:colors.muted }}>×</button>
        </div>

        {/* photo upload */}
        <div onClick={() => fileRef.current?.click()} style={{ width:'100%', height:130, background:colors.surface2, borderRadius:radii.lg, border:`1.5px dashed ${colors.roseMid}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:14, overflow:'hidden' }}>
          {imagePreview ? (
            <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <div style={{ textAlign:'center', color:colors.muted }}>
              <div style={{ fontSize:28, marginBottom:4 }}>📸</div>
              <div style={{ fontSize:12 }}>{uploading ? 'Uploading…' : 'Tap to add photo'}</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />

        {/* form fields */}
        {[
          ['Name', 'name',  'e.g. White oversized blazer'],
          ['Color','color', 'e.g. White, Cream, Black'],
          ['Brand','brand', 'e.g. Zara, H&M (optional)'],
          ['Size', 'size',  'e.g. S, M, UK 10'],
          ['Notes','notes', 'optional notes'],
        ].map(([label, key, ph]) => (
          <div key={key} style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:colors.muted, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
            <input value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]:e.target.value }))} placeholder={ph}
              style={{ width:'100%', padding:'10px 13px', borderRadius:radii.md, border:`1px solid ${colors.border}`, fontFamily:fonts.body, fontSize:13, color:colors.text, background:colors.surface, outline:'none' }} />
          </div>
        ))}

        {/* category */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:colors.muted, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:8 }}>Category</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {CATS.map((cat) => (
              <button key={cat} onClick={() => setForm(f => ({ ...f, category:cat }))} style={{ padding:'5px 12px', borderRadius:radii.full, fontSize:11, border:'1px solid', cursor:'pointer', fontFamily:fonts.body, borderColor: form.category===cat ? colors.rose : colors.border, background: form.category===cat ? colors.roseLight : colors.surface, color: form.category===cat ? colors.roseDeep : colors.muted, transition:'all 0.18s' }}>{cat}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} style={{ width:'100%', padding:14, background:colors.rose, border:'none', borderRadius:radii.md, fontFamily:fonts.body, fontSize:13, fontWeight:500, color:'#fff', cursor:'pointer' }}>
          Add to wardrobe 🧺
        </button>
      </div>
    </div>
  );
}

function catEmoji(cat) {
  const map = { Tops:'👚', Bottoms:'👖', Dresses:'👗', Outerwear:'🧥', Shoes:'👟', Bags:'👜', Accessories:'💍', Jewellery:'💍' };
  return map[cat] || '🧺';
}
