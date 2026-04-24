// ─────────────────────────────────────────────────────────
//  veux × Claude AI — outfit generation
//  Key goes in .env as REACT_APP_ANTHROPIC_KEY
// ─────────────────────────────────────────────────────────

const KEY = process.env.https://api.anthropic.com/v1/organizations/api_keys/$API_KEY_ID \ || '';
const URL  = 'https://api.anthropic.com/v1/messages';

const SYSTEM = `You are the veux AI stylist for Gen Z women and teen girls.
You create complete, wearable, on-trend outfit recommendations tailored to each user's
style profile (vibe, body shape, budget, skin tone, climate, occasions, etc.).

Always respond with ONLY valid JSON — no markdown, no explanation, no extra text.
Use this exact structure:
{
  "outfitName": "creative name",
  "vibe": "aesthetic label",
  "occasion": "what this works for",
  "pieces": [
    {
      "category": "Top | Bottom | Dress | Outerwear | Shoes | Bag | Accessory",
      "item": "specific item name e.g. Ivory ribbed knit tank",
      "color": "color name",
      "fit": "oversized | fitted | flowy | bodycon | relaxed",
      "budgetRange": "$20–$40",
      "searchKeywords": ["keyword1","keyword2","keyword3"]
    }
  ],
  "stylingTip": "2-sentence personal styling note",
  "colorPalette": ["#hex1","#hex2","#hex3"],
  "wardrobePieces": ["list any pieces from the user wardrobe you used, by name"]
}`;

// ── single outfit ──────────────────────────────────────────
export const generateOutfit = async (styleProfile, context = '', wardrobe = []) => {
  if (!KEY || KEY.includes('PASTE')) return { outfit: getMock(styleProfile), error: null };

  const userMsg = buildPrompt(styleProfile, context, wardrobe);

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1200,
        system:     SYSTEM,
        messages:   [{ role: 'user', content: userMsg }],
      }),
    });
    const data    = await res.json();
    const text    = data.content?.[0]?.text || '{}';
    const clean   = text.replace(/```json|```/g, '').trim();
    const outfit  = JSON.parse(clean);
    return { outfit, error: null };
  } catch (e) {
    console.error('Claude error:', e);
    return { outfit: getMock(styleProfile), error: null };
  }
};

// ── week plan: generates 7 outfits, one per day ───────────
export const generateWeekPlan = async (styleProfile, weekContext = '', wardrobe = []) => {
  if (!KEY || KEY.includes('PASTE')) return { plan: getMockWeek(styleProfile), error: null };

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const userMsg = `Generate 7 outfits — one for each day of the week — for this user.
${buildProfileBlock(styleProfile)}
${weekContext ? `Week context: ${weekContext}` : ''}
${wardrobe.length ? `Their wardrobe: ${wardrobe.map(i => `${i.name} (${i.category}, ${i.color})`).join(', ')}` : ''}

Vary the outfits day to day. Weekend outfits can be more casual or going-out.
Respond ONLY with a JSON array of 7 outfit objects, one per day, each with a "day" field added:
[{ "day":"Monday", "outfitName":"...", "vibe":"...", "occasion":"...", "pieces":[...], "stylingTip":"...", "colorPalette":["..."], "wardrobePieces":[] }, ...]`;

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 4000,
        system:     SYSTEM,
        messages:   [{ role: 'user', content: userMsg }],
      }),
    });
    const data  = await res.json();
    const text  = data.content?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const plan  = JSON.parse(clean);
    return { plan, error: null };
  } catch (e) {
    return { plan: getMockWeek(styleProfile), error: null };
  }
};

// ── helpers ────────────────────────────────────────────────
function buildProfileBlock(p) {
  return `Style vibe: ${p.vibe?.[0] || 'Clean Girl'}
Body shape: ${p.bodyShape?.[0] || 'not specified'}
Fit preference: ${(p.fitPreference || []).join(', ') || 'any'}
Budget: ${p.budget?.[0] || '$30–$80'}
Climate: ${p.climate?.[0] || 'temperate'}
Occasions: ${(p.occasion || []).join(', ') || 'casual'}
Hair type: ${p.hairType?.[0] || 'not specified'}
Skin tone: ${p.skinTone?.[0] || 'medium'}
Colour palette: ${(p.colorPalette || []).join(', ') || 'neutrals'}
Size: ${p.size?.[0] || 'M'}`;
}

function buildPrompt(profile, context, wardrobe) {
  return `${buildProfileBlock(profile)}
${context ? `\nToday's context: ${context}` : ''}
${wardrobe.length ? `\nUser's wardrobe items to incorporate if fitting:\n${wardrobe.map(i => `- ${i.name} (${i.category}, ${i.color}, ${i.brand || ''})`).join('\n')}` : ''}
Generate one complete outfit.`;
}

// ── mock data (used when no API key is set yet) ────────────
function getMock(profile) {
  const vibe = profile?.vibe?.[0] || 'Clean Girl';
  return {
    outfitName: vibe === 'Coquette' ? 'Bow Season Moment' : 'The Clean Edit',
    vibe,
    occasion: 'Casual day out',
    pieces: [
      { category:'Top',    item:'White ribbed tank top',    color:'White',  fit:'fitted',   budgetRange:'$15–$30', searchKeywords:['white ribbed tank','fitted tank top'] },
      { category:'Bottom', item:'Cream wide-leg trousers',  color:'Cream',  fit:'wide-leg', budgetRange:'$40–$70', searchKeywords:['wide leg pants','cream trousers'] },
      { category:'Shoes',  item:'Tan leather ballet flats', color:'Tan',    fit:'flat',     budgetRange:'$30–$60', searchKeywords:['ballet flats','tan flat shoes'] },
      { category:'Bag',    item:'Mini white tote',          color:'White',  fit:'mini',     budgetRange:'$25–$50', searchKeywords:['mini tote bag','white bag'] },
      { category:'Accessory', item:'Gold thin hoops',       color:'Gold',   fit:'minimal',  budgetRange:'$10–$25', searchKeywords:['gold hoop earrings','thin hoops'] },
    ],
    stylingTip: 'Keep everything tonal — whites, creams and tans. Tuck the tank loosely for that effortless off-duty feel.',
    colorPalette: ['#f5f0eb','#e8ddd0','#c4a882'],
    wardrobePieces: [],
  };
}

function getMockWeek(profile) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const vibes = ['Casual errands','School day','Work from café','Girls lunch','Going out prep','Weekend brunch','Lazy Sunday'];
  return days.map((day, i) => ({
    day,
    outfitName: `${day} Look`,
    vibe: profile?.vibe?.[0] || 'Clean Girl',
    occasion: vibes[i],
    pieces: [
      { category:'Top',    item:'Ribbed tank top',    color:'Neutral', fit:'fitted',   budgetRange:'$15–$35', searchKeywords:['ribbed tank'] },
      { category:'Bottom', item:'Wide-leg trousers',  color:'Cream',   fit:'relaxed',  budgetRange:'$40–$70', searchKeywords:['wide leg pants'] },
      { category:'Shoes',  item:'Ballet flats',       color:'Tan',     fit:'flat',     budgetRange:'$30–$60', searchKeywords:['ballet flats'] },
    ],
    stylingTip: 'Keep it simple and effortless.',
    colorPalette: ['#f5f0eb','#e8ddd0','#c4a882'],
    wardrobePieces: [],
  }));
}
