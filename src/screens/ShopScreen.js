import React, { useState, useEffect } from 'react';
import { BRANDS, PRODUCTS as FALLBACK_PRODUCTS } from '../data/shopData';
import { fetchProducts } from '../services/supabase';
import { colors, fonts, radii } from '../theme';
import useStore from '../store/useStore';

export default function ShopScreen() {
  const [activeBrand, setActiveBrand] = useState('all');
  const [products,    setProducts]    = useState(FALLBACK_PRODUCTS);
  const [loading,     setLoading]     = useState(false);
  const showToast = useStore((s) => s.showToast);

  // Try to load real products from Supabase; fall back to local data if not configured
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await fetchProducts({ brandId: activeBrand === 'all' ? null : activeBrand });
      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        // Use local fallback data
        const filtered = activeBrand === 'all' ? FALLBACK_PRODUCTS : FALLBACK_PRODUCTS.filter((p) => p.brandId === activeBrand);
        setProducts(filtered);
      }
      setLoading(false);
    };
    load();
  }, [activeBrand]);

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'32px 24px 4px', fontSize:11, fontWeight:600 }}>
        <span>9:41</span><span>●●●</span>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 18px 10px' }}>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:colors.text }}>v<i style={{ color:colors.rose }}>eux</i></span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </div>

      <div style={{ margin:'0 18px 14px', background:colors.surface2, borderRadius:radii.full, display:'flex', padding:'10px 16px', gap:8 }}>
        <input placeholder="search brands & items…" readOnly style={{ border:'none', background:'transparent', fontSize:13, width:'100%', outline:'none', fontFamily:fonts.body, color:colors.text }} />
      </div>

      {/* live banner */}
      <div style={{ margin:'0 18px 14px', padding:'14px 18px', background:'linear-gradient(135deg,#f7e6ea,#faeee8)', borderRadius:radii.lg, display:'flex', alignItems:'center', gap:12, border:`1px solid ${colors.roseLight}` }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:colors.rose, flexShrink:0, animation:'pulse 1.6s infinite' }} />
        <div>
          <div style={{ fontSize:10, color:colors.roseDeep, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:500 }}>Live Deals</div>
          <div style={{ fontSize:13, color:colors.text, marginTop:2 }}>Sales updated daily ✦</div>
        </div>
      </div>

      {/* brand filter */}
      <div style={{ display:'flex', gap:10, padding:'0 18px 14px', overflowX:'auto' }}>
        {BRANDS.map((b) => (
          <div key={b.id} onClick={() => setActiveBrand(b.id)} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:7, padding:'7px 16px 7px 8px', borderRadius:radii.full, border:'1px solid', cursor:'pointer', borderColor: activeBrand===b.id ? colors.roseMid : colors.border, background: activeBrand===b.id ? colors.roseLight : colors.surface, transition:'all 0.18s' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:colors.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:colors.roseDeep }}>{b.icon}</div>
            <span style={{ fontSize:11, color:colors.text }}>{b.name}</span>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 18px 10px', fontSize:10, color:colors.muted, letterSpacing:'.1em', textTransform:'uppercase' }}>
        {loading ? 'Loading deals…' : 'Trending sales'}
      </div>

      <div style={{ padding:'0 18px 90px', display:'flex', flexDirection:'column', gap:10 }}>
        {products.map((p, i) => (
          <ProductCard key={p.id || i} product={p} showToast={showToast} />
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

function ProductCard({ product: p, showToast }) {
  const handleBuy = () => {
    // If product has a real shop URL, open it
    if (p.shop_url || p.affiliate_url) {
      window.open(p.shop_url || p.affiliate_url, '_blank');
    } else {
      showToast('Shop link coming soon 🛍️');
    }
  };

  return (
    <div onClick={handleBuy} style={{ background:colors.surface, borderRadius:radii.lg, border:`1px solid ${colors.border}`, display:'flex', gap:12, padding:14, cursor:'pointer', position:'relative', transition:'border-color 0.2s' }}>
      {/* image or emoji */}
      {p.image_url ? (
        <img src={p.image_url} alt={p.name} style={{ width:80, height:80, borderRadius:radii.md, objectFit:'cover', flexShrink:0 }} />
      ) : (
        <div style={{ width:80, height:80, borderRadius:radii.md, background:colors.warm, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:34 }}>{p.emoji}</div>
      )}

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:9, color:colors.rose, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:3 }}>{p.brand}</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, lineHeight:1.3, color:colors.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
          <span style={{ fontSize:14, fontWeight:500 }}>{p.price}</span>
          <span style={{ fontSize:11, color:colors.muted, textDecoration:'line-through' }}>{p.original_price || p.originalPrice}</span>
          <span style={{ fontSize:10, color:colors.saleRed, fontWeight:500 }}>Save {p.save_pct || p.savePct}</span>
        </div>
      </div>

      <div style={{ position:'absolute', top:12, right:12, background:colors.saleBg, color:colors.saleRed, border:`1px solid ${colors.saleBorder}`, fontSize:9, padding:'3px 9px', borderRadius:radii.full, fontWeight:500 }}>SALE</div>
    </div>
  );
}
