// veux x Claude AI — outfit generation
// Key goes in .env as REACT_APP_ANTHROPIC_KEY

const KEY = process.env.REACT_APP_ANTHROPIC_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM = `You are the veux AI stylist for Gen Z women and teen girls.
You create complete, wearable, on-trend outfit recommendations tailored to each user's
style profile (vibe, body shape, budget, skin tone, climate, occasions, etc.).

Always respond with ONLY valid JSON, no markdown, no explanation, no extra text.
Use this exact structure:
{
  "outfitName": "creative name",
  "vibe": "aesthetic label",
  "occasion": "what this works for",
  "pieces": [
    {
      "category": "Top or Bottom or Dress or Outerwear or Shoes or Bag or Accessory",
      "item": "specific item name e.g. Ivory ribbed knit tank",
      "color": "color name",
      "fit": "oversized or fitted or flowy or bodycon or relaxed",
      "budgetRange": "$20-$40",
      "searchKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "stylingTip": "2-sentence personal styling note",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "wardrobePieces": ["list any pieces from the user wardrobe you used, by name"]
}`;

// single outfit
export const generateOutfit = async (styleProfile, context, wardrobe) => {
  var ctx = context || '';
  var wr = wardrobe || [];

  if (!KEY || KEY.indexOf('PASTE') !== -1) {
    return { outfit: getMock(styleProfile), error: null };
  }

  var userMsg = buildPrompt(styleProfile, ctx, wr);

  try {
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    var data = await res.json();
    var text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '{}';
    var clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    var outfit = JSON.parse(clean);
    return { outfit: outfit, error: null };
  } catch (e) {
    console.error('Claude error:', e);
    return { outfit: getMock(styleProfile), error: null };
  }
};

// week plan - generates 7 outfits
export const generateWeekPlan = async (styleProfile, weekContext, wardrobe) => {
  var ctx = weekContext || '';
  var wr = wardrobe || [];

  if (!KEY || KEY.indexOf('PASTE') !== -1) {
    return { plan: getMockWeek(styleProfile), error: null };
  }

  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var wardrobeText = wr.length
    ? 'Their wardrobe: ' + wr.map(function(i) { return i.name + ' (' + i.category + ', ' + i.color + ')'; }).join(', ')
    : '';

  var userMsg = 'Generate 7 outfits, one for each day of the week, for this user.\n'
    + buildProfileBlock(styleProfile) + '\n'
    + (ctx ? 'Week context: ' + ctx + '\n' : '')
    + wardrobeText + '\n'
    + 'Vary the outfits day to day. Weekend outfits can be more casual or going-out.\n'
    + 'Respond ONLY with a JSON array of 7 outfit objects, each with a "day" field added:\n'
    + '[{ "day":"Monday", "outfitName":"...", "vibe":"...", "occasion":"...", "pieces":[...], "stylingTip":"...", "colorPalette":["..."], "wardrobePieces":[] }, ...]';

  try {
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    var data = await res.json();
    var text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '[]';
    var clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    var plan = JSON.parse(clean);
    return { plan: plan, error: null };
  } catch (e) {
    return { plan: getMockWeek(styleProfile), error: null };
  }
};

function buildProfileBlock(p) {
  var fitPref = (p.fitPreference || []).join(', ') || 'any';
  var occasions = (p.occasion || []).join(', ') || 'casual';
  var colors = (p.colorPalette || []).join(', ') || 'neutrals';

  return 'Style vibe: ' + (p.vibe && p.vibe[0] ? p.vibe[0] : 'Clean Girl') + '\n'
    + 'Body shape: ' + (p.bodyShape && p.bodyShape[0] ? p.bodyShape[0] : 'not specified') + '\n'
    + 'Fit preference: ' + fitPref + '\n'
    + 'Budget: ' + (p.budget && p.budget[0] ? p.budget[0] : '$30-$80') + '\n'
    + 'Climate: ' + (p.climate && p.climate[0] ? p.climate[0] : 'temperate') + '\n'
    + 'Occasions: ' + occasions + '\n'
    + 'Hair type: ' + (p.hairType && p.hairType[0] ? p.hairType[0] : 'not specified') + '\n'
    + 'Skin tone: ' + (p.skinTone && p.skinTone[0] ? p.skinTone[0] : 'medium') + '\n'
    + 'Colour palette: ' + colors + '\n'
    + 'Size: ' + (p.size && p.size[0] ? p.size[0] : 'M');
}

function buildPrompt(profile, context, wardrobe) {
  var wardrobeText = wardrobe.length
    ? '\nUser wardrobe items to incorporate if fitting:\n' + wardrobe.map(function(i) { return '- ' + i.name + ' (' + i.category + ', ' + i.color + ', ' + (i.brand || '') + ')'; }).join('\n')
    : '';

  return buildProfileBlock(profile)
    + (context ? '\nToday context: ' + context : '')
    + wardrobeText
    + '\nGenerate one complete outfit.';
}

function getMock(profile) {
  var vibe = (profile && profile.vibe && profile.vibe[0]) ? profile.vibe[0] : 'Clean Girl';
  return {
    outfitName: vibe === 'Coquette' ? 'Bow Season Moment' : 'The Clean Edit',
    vibe: vibe,
    occasion: 'Casual day out',
    pieces: [
      { category: 'Top',       item: 'White ribbed tank top',    color: 'White', fit: 'fitted',   budgetRange: '$15-$30', searchKeywords: ['white ribbed tank', 'fitted tank top'] },
      { category: 'Bottom',    item: 'Cream wide-leg trousers',  color: 'Cream', fit: 'wide-leg', budgetRange: '$40-$70', searchKeywords: ['wide leg pants', 'cream trousers'] },
      { category: 'Shoes',     item: 'Tan leather ballet flats', color: 'Tan',   fit: 'flat',     budgetRange: '$30-$60', searchKeywords: ['ballet flats', 'tan flat shoes'] },
      { category: 'Bag',       item: 'Mini white tote',          color: 'White', fit: 'mini',     budgetRange: '$25-$50', searchKeywords: ['mini tote bag', 'white bag'] },
      { category: 'Accessory', item: 'Gold thin hoops',          color: 'Gold',  fit: 'minimal',  budgetRange: '$10-$25', searchKeywords: ['gold hoop earrings', 'thin hoops'] }
    ],
    stylingTip: 'Keep everything tonal in whites, creams and tans. Tuck the tank loosely for that effortless off-duty feel.',
    colorPalette: ['#f5f0eb', '#e8ddd0', '#c4a882'],
    wardrobePieces: []
  };
}

function getMockWeek(profile) {
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var vibes = ['Casual errands', 'School day', 'Work from cafe', 'Girls lunch', 'Going out prep', 'Weekend brunch', 'Lazy Sunday'];
  var vibe = (profile && profile.vibe && profile.vibe[0]) ? profile.vibe[0] : 'Clean Girl';

  return days.map(function(day, i) {
    return {
      day: day,
      outfitName: day + ' Look',
      vibe: vibe,
      occasion: vibes[i],
      pieces: [
        { category: 'Top',    item: 'Ribbed tank top',   color: 'Neutral', fit: 'fitted',  budgetRange: '$15-$35', searchKeywords: ['ribbed tank'] },
        { category: 'Bottom', item: 'Wide-leg trousers', color: 'Cream',   fit: 'relaxed', budgetRange: '$40-$70', searchKeywords: ['wide leg pants'] },
        { category: 'Shoes',  item: 'Ballet flats',      color: 'Tan',     fit: 'flat',    budgetRange: '$30-$60', searchKeywords: ['ballet flats'] }
      ],
      stylingTip: 'Keep it simple and effortless.',
      colorPalette: ['#f5f0eb', '#e8ddd0', '#c4a882'],
      wardrobePieces: []
    };
  });
}
