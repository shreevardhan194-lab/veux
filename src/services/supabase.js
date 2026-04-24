import { createClient } from '@supabase/supabase-js';

// ── These values come from your .env file ──────────────────
// Put your Supabase URL and anon key in .env (see that file for instructions)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL  || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const db = () => {
  if (!supabase) { console.warn('Supabase not configured — add keys to .env'); return null; }
  return supabase;
};

// ── AUTH ───────────────────────────────────────────────────
export const signUp = async (email, password, username) => {
  const client = db(); if (!client) return { error: 'Not configured' };
  return client.auth.signUp({ email, password, options: { data: { username } } });
};

export const signIn = async (email, password) => {
  const client = db(); if (!client) return { error: 'Not configured' };
  return client.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  const client = db(); if (!client) return;
  return client.auth.signOut();
};

// ── OUTFITS (feed) ─────────────────────────────────────────
// Table: outfits (id, user_id, title, image_url, emoji, price, sale_price,
//                 sale_pct, category, brand, shop_url, likes_count, created_at)
export const fetchOutfits = async ({ category = null, limit = 30 } = {}) => {
  const client = db(); if (!client) return { data: null, error: 'Not configured' };
  let q = client
    .from('outfits')
    .select('id,title,image_url,emoji,price,sale_price,sale_pct,category,brand,shop_url,likes_count,profiles(username,avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (category && category !== 'All') q = q.eq('category', category);
  return q;
};

export const toggleLike = async (outfitId, userId) => {
  const client = db(); if (!client) return { liked: false };
  const { data: ex } = await client.from('likes').select('id').eq('outfit_id', outfitId).eq('user_id', userId).single();
  if (ex) { await client.from('likes').delete().eq('id', ex.id); return { liked: false }; }
  await client.from('likes').insert({ outfit_id: outfitId, user_id: userId });
  return { liked: true };
};

export const toggleSave = async (outfitId, userId) => {
  const client = db(); if (!client) return { saved: false };
  const { data: ex } = await client.from('saves').select('id').eq('outfit_id', outfitId).eq('user_id', userId).single();
  if (ex) { await client.from('saves').delete().eq('id', ex.id); return { saved: false }; }
  await client.from('saves').insert({ outfit_id: outfitId, user_id: userId });
  return { saved: true };
};

// ── PRODUCTS (shop) ────────────────────────────────────────
// Table: products (id, name, brand, brand_id, emoji, image_url, price,
//                  original_price, save_pct, on_sale, shop_url, affiliate_url, in_stock)
export const fetchProducts = async ({ brandId = null, limit = 40 } = {}) => {
  const client = db(); if (!client) return { data: null, error: 'Not configured' };
  let q = client
    .from('products')
    .select('id,name,brand,brand_id,emoji,image_url,price,original_price,save_pct,shop_url,affiliate_url,in_stock')
    .eq('on_sale', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (brandId && brandId !== 'all') q = q.eq('brand_id', brandId);
  return q;
};

export const fetchAllProducts = async ({ limit = 60 } = {}) => {
  const client = db(); if (!client) return { data: null, error: 'Not configured' };
  return client.from('products').select('id,name,brand,brand_id,emoji,image_url,price,original_price,save_pct,shop_url').limit(limit);
};

// ── STYLE PROFILE ──────────────────────────────────────────
// Table: style_profiles (user_id, vibe, body_shape, fit_preference[],
//   budget, climate, occasions[], hair_type, skin_tone, color_palette[], size, updated_at)
export const saveStyleProfile = async (userId, answers) => {
  const client = db(); if (!client) return { error: 'Not configured' };
  return client.from('style_profiles').upsert({
    user_id: userId,
    vibe:           answers.vibe?.[0]        || null,
    body_shape:     answers.bodyShape?.[0]   || null,
    fit_preference: answers.fitPreference     || [],
    budget:         answers.budget?.[0]      || null,
    climate:        answers.climate?.[0]     || null,
    occasions:      answers.occasion         || [],
    hair_type:      answers.hairType?.[0]    || null,
    skin_tone:      answers.skinTone?.[0]    || null,
    color_palette:  answers.colorPalette     || [],
    size:           answers.size?.[0]        || null,
    updated_at:     new Date().toISOString(),
  }, { onConflict: 'user_id' });
};

export const fetchStyleProfile = async (userId) => {
  const client = db(); if (!client) return { data: null, error: 'Not configured' };
  return client.from('style_profiles').select('*').eq('user_id', userId).single();
};

// ── WARDROBE / CLOSET ──────────────────────────────────────
// Table: wardrobe_items (id, user_id, name, category, sub_category,
//   color, size, brand, image_url, notes, created_at)
export const fetchWardrobe = async (userId) => {
  const client = db(); if (!client) return { data: [], error: null };
  return client.from('wardrobe_items')
    .select('id,name,category,sub_category,color,size,brand,image_url,notes,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const addWardrobeItem = async (userId, item) => {
  const client = db(); if (!client) return { error: 'Not configured' };
  return client.from('wardrobe_items').insert({ user_id: userId, ...item });
};

export const deleteWardrobeItem = async (itemId) => {
  const client = db(); if (!client) return { error: 'Not configured' };
  return client.from('wardrobe_items').delete().eq('id', itemId);
};

// ── IMAGE UPLOAD (wardrobe photos) ────────────────────────
// Bucket name in Supabase Storage: "wardrobe"
// Make sure the bucket exists and has public read access enabled
export const uploadWardrobeImage = async (userId, file) => {
  const client = db(); if (!client) return { url: null, error: 'Not configured' };
  const ext  = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await client.storage.from('wardrobe').upload(path, file);
  if (error) return { url: null, error };
  const { data } = client.storage.from('wardrobe').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
};

// ── PROFILE ────────────────────────────────────────────────
// Table: profiles (id, username, avatar_url, bio, location, vibe,
//                  followers_count, following_count, outfits_count)
export const fetchProfile = async (userId) => {
  const client = db(); if (!client) return { data: null, error: 'Not configured' };
  return client.from('profiles').select('*').eq('id', userId).single();
};

export const fetchUserOutfits = async (userId) => {
  const client = db(); if (!client) return { data: [], error: null };
  return client.from('outfits').select('id,image_url,emoji,likes_count,title').eq('user_id', userId).order('created_at', { ascending: false });
};

export const toggleFollow = async (followerId, followingId) => {
  const client = db(); if (!client) return { following: false };
  const { data: ex } = await client.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single();
  if (ex) { await client.from('follows').delete().eq('id', ex.id); return { following: false }; }
  await client.from('follows').insert({ follower_id: followerId, following_id: followingId });
  return { following: true };
};
