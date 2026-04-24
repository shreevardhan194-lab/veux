import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Tab ─────────────────────────────────────────────────
  activeTab: 'feed',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Toast ────────────────────────────────────────────────
  toast: { message: '', visible: false },
  _toastTimer: null,
  showToast: (message) => {
    clearTimeout(get()._toastTimer);
    set({ toast: { message, visible: true } });
    const t = setTimeout(() => set({ toast: { message:'', visible:false } }), 2600);
    set({ _toastTimer: t });
  },

  // ── Auth ─────────────────────────────────────────────────
  user: null, session: null,
  setUser:    (user)    => set({ user }),
  setSession: (session) => set({ session }),

  // ── Style profile (from quiz) ────────────────────────────
  styleProfile: null,
  quizAnswers:  {},
  quizComplete: false,
  setStyleProfile: (p) => set({ styleProfile: p, quizComplete: true }),
  setQuizAnswer:   (id, ans) => set((s) => ({ quizAnswers: { ...s.quizAnswers, [id]: ans } })),
  clearQuiz:       () => set({ quizAnswers: {}, quizComplete: false, styleProfile: null }),

  // ── Feed saves / likes ───────────────────────────────────
  savedPins: new Set(),
  likedPins: new Set(),
  toggleSavedPin: (id) => set((s) => {
    const n = new Set(s.savedPins);
    n.has(id) ? n.delete(id) : n.add(id);
    return { savedPins: n };
  }),
  toggleLikedPin: (id) => set((s) => {
    const n = new Set(s.likedPins);
    n.has(id) ? n.delete(id) : n.add(id);
    return { likedPins: n };
  }),

  // ── Generated outfits ────────────────────────────────────
  generatedOutfits: [],   // array so we can store week plan
  addGeneratedOutfit: (outfit) => set((s) => ({ generatedOutfits: [outfit, ...s.generatedOutfits] })),
  clearGeneratedOutfits: () => set({ generatedOutfits: [] }),

  // ── Wardrobe / closet ────────────────────────────────────
  wardrobeItems: [],
  addWardrobeItem:    (item) => set((s) => ({ wardrobeItems: [item, ...s.wardrobeItems] })),
  removeWardrobeItem: (id)   => set((s) => ({ wardrobeItems: s.wardrobeItems.filter(i => i.id !== id) })),
  setWardrobeItems:   (items) => set({ wardrobeItems: items }),
}));

export default useStore;
