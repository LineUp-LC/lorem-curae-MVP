// src/state/sessionState.ts

export const sessionState = {
  // Real user from Supabase (null until account creation)
  user: null as any,

  // Anonymous-only temporary skin type
  tempSkinType: null as string | null,

  // Anonymous-only temporary concerns (optional but recommended)
  tempConcerns: [] as string[],

  // --- SETTERS ---

  setUser(user: any) {
    this.user = user;
  },

  setTempSkinType(type: string | null) {
    this.tempSkinType = type;
  },

  setTempConcerns(concerns: string[]) {
    this.tempConcerns = concerns;
  }
};