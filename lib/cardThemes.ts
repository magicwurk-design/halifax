// Bank-specific card gradient themes — dark, premium, consistent with app aesthetic

export interface CardTheme {
  gradient: string;       // CSS gradient for card background
  shimmer: string;        // overlay shimmer
  orbTopRight: string;    // decorative orb top right
  orbBottomLeft: string;  // decorative orb bottom left
  accentColor: string;    // used for text highlights / copy button
  topHighlight: string;   // top edge highlight line
}

const THEMES: Record<string, CardTheme> = {
  // ── Halifax (default deep blue) ────────────────────────────────────────────
  halifax: {
    gradient:      'linear-gradient(135deg,#0a1f5c 0%,#1043a3 45%,#1a56cc 100%)',
    shimmer:       'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.01) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(201,168,76,0.7) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(100,170,255,0.5) 0%,transparent 70%)',
    accentColor:   'rgba(147,197,253,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
  },

  // ── Barclays (dark cyan/teal) ───────────────────────────────────────────────
  barclays: {
    gradient:      'linear-gradient(135deg,#001a2c 0%,#003d5c 45%,#005f8a 100%)',
    shimmer:       'linear-gradient(135deg,rgba(0,174,239,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(0,174,239,0.50) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(0,100,150,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(125,211,252,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(0,174,239,0.40),transparent)',
  },

  // ── HSBC (deep crimson/dark) ────────────────────────────────────────────────
  hsbc: {
    gradient:      'linear-gradient(135deg,#1a0000 0%,#5c0000 45%,#8b0000 100%)',
    shimmer:       'linear-gradient(135deg,rgba(219,0,17,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(219,0,17,0.55) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(150,0,0,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(252,165,165,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(219,0,17,0.40),transparent)',
  },

  // ── Lloyds (deep forest green) ─────────────────────────────────────────────
  lloyds: {
    gradient:      'linear-gradient(135deg,#001a12 0%,#003d28 45%,#006a4d 100%)',
    shimmer:       'linear-gradient(135deg,rgba(0,106,77,0.15) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(0,200,120,0.40) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(0,80,50,0.50) 0%,transparent 70%)',
    accentColor:   'rgba(110,231,183,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(0,200,120,0.30),transparent)',
  },

  // ── NatWest (deep purple) ──────────────────────────────────────────────────
  natwest: {
    gradient:      'linear-gradient(135deg,#0f0020 0%,#2e0060 45%,#42145f 100%)',
    shimmer:       'linear-gradient(135deg,rgba(66,20,95,0.20) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(167,139,250,0.45) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(80,0,120,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(196,181,253,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(167,139,250,0.35),transparent)',
  },

  // ── Santander UK (dark rose/red) ───────────────────────────────────────────
  santander_uk: {
    gradient:      'linear-gradient(135deg,#1a0005 0%,#5c0015 45%,#9b001e 100%)',
    shimmer:       'linear-gradient(135deg,rgba(204,0,0,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(251,113,133,0.45) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(140,0,30,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(253,164,175,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(251,113,133,0.35),transparent)',
  },

  // ── Monzo (dark coral/orange) ──────────────────────────────────────────────
  monzo: {
    gradient:      'linear-gradient(135deg,#1a0800 0%,#5c2000 45%,#9b3500 100%)',
    shimmer:       'linear-gradient(135deg,rgba(255,80,53,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(255,80,53,0.50) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(180,60,0,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(253,186,116,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(255,80,53,0.35),transparent)',
  },

  // ── Starling (dark cyan/electric) ─────────────────────────────────────────
  starling: {
    gradient:      'linear-gradient(135deg,#001520 0%,#003040 45%,#005060 100%)',
    shimmer:       'linear-gradient(135deg,rgba(127,187,254,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(127,187,254,0.50) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(0,120,160,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(125,211,252,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(127,187,254,0.35),transparent)',
  },

  // ── Revolut (near-black/slate premium) ────────────────────────────────────
  revolut_uk: {
    gradient:      'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 45%,#2a2a2a 100%)',
    shimmer:       'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(200,200,255,0.25) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(150,150,200,0.20) 0%,transparent 70%)',
    accentColor:   'rgba(203,213,225,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
  },

  // ── Nationwide / Chase UK / TSB / Clydesdale / Yorkshire (mid blue) ───────
  nationwide: {
    gradient:      'linear-gradient(135deg,#00102b 0%,#001f55 45%,#003087 100%)',
    shimmer:       'linear-gradient(135deg,rgba(0,48,135,0.15) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(99,179,237,0.40) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(0,50,130,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(147,197,253,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(99,179,237,0.30),transparent)',
  },

  // ── First Direct (true black/white contrast) ───────────────────────────────
  first_direct: {
    gradient:      'linear-gradient(135deg,#000000 0%,#111111 45%,#1a1a1a 100%)',
    shimmer:       'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(255,255,255,0.20) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(255,255,255,0.10) 0%,transparent 70%)',
    accentColor:   'rgba(255,255,255,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(255,255,255,0.20),transparent)',
  },

  // ── Bank of Scotland / Lloyds variant ─────────────────────────────────────
  bank_of_scot: {
    gradient:      'linear-gradient(135deg,#001a0f 0%,#003d20 45%,#006838 100%)',
    shimmer:       'linear-gradient(135deg,rgba(0,104,56,0.15) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(52,211,153,0.40) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(0,80,40,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(110,231,183,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(52,211,153,0.30),transparent)',
  },

  // ── Emirates NBD (dark gold/amber — UAE) ──────────────────────────────────
  emirates: {
    gradient:      'linear-gradient(135deg,#1a1000 0%,#3d2800 45%,#6b4200 100%)',
    shimmer:       'linear-gradient(135deg,rgba(200,146,42,0.15) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(200,146,42,0.55) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(150,100,0,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(252,211,77,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(200,146,42,0.40),transparent)',
  },

  // ── QNB (dark maroon/wine) ─────────────────────────────────────────────────
  qnb: {
    gradient:      'linear-gradient(135deg,#1a0008 0%,#4a001a 45%,#7d1c3a 100%)',
    shimmer:       'linear-gradient(135deg,rgba(125,28,58,0.15) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(244,63,94,0.40) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(100,0,30,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(253,164,175,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(244,63,94,0.30),transparent)',
  },

  // ── ING (deep orange/dark) ─────────────────────────────────────────────────
  ing: {
    gradient:      'linear-gradient(135deg,#1a0a00 0%,#5c2800 45%,#a04000 100%)',
    shimmer:       'linear-gradient(135deg,rgba(255,98,0,0.10) 0%,rgba(255,255,255,0.02) 100%)',
    orbTopRight:   'radial-gradient(circle,rgba(255,98,0,0.50) 0%,transparent 70%)',
    orbBottomLeft: 'radial-gradient(circle,rgba(180,70,0,0.40) 0%,transparent 70%)',
    accentColor:   'rgba(253,186,116,0.90)',
    topHighlight:  'linear-gradient(90deg,transparent,rgba(255,98,0,0.35),transparent)',
  },
};

// Fallback for banks not explicitly listed — use their accent colour to build a dark theme
function buildFallbackTheme(accent: string): CardTheme {
  return {
    gradient:      `linear-gradient(135deg,#0a0a14 0%,#101428 45%,#181c38 100%)`,
    shimmer:       `linear-gradient(135deg,rgba(79,142,247,0.08) 0%,rgba(255,255,255,0.02) 100%)`,
    orbTopRight:   `radial-gradient(circle,${accent}55 0%,transparent 70%)`,
    orbBottomLeft: `radial-gradient(circle,rgba(50,80,150,0.35) 0%,transparent 70%)`,
    accentColor:   'rgba(147,197,253,0.90)',
    topHighlight:  `linear-gradient(90deg,transparent,${accent}40,transparent)`,
  };
}

// Banks that share the nationwide/chase/tsb theme
const BLUE_VARIANT = ['chase_uk', 'tsb', 'clydesdale', 'yorkshire', 'coop', 'std_chart'];
const RED_VARIANT  = ['metro', 'virgin', 'santander_es', 'bofa', 'wells_fargo', 'ubs', 'unicredit', 'dbs', 'scotiabank', 'westpac', 'icbc', 'boc', 'hsbc_intl'];
const GREEN_VARIANT = ['bnp', 'credit_ag', 'td'];
const US_BLUE = ['citibank', 'chase_us', 'deutsche', 'anz', 'bbva'];
const ORANGE_VARIANT = ['ocbc'];

export function getCardTheme(bankId: string, bankAccent?: string): CardTheme {
  if (THEMES[bankId]) return THEMES[bankId];
  if (BLUE_VARIANT.includes(bankId)) return THEMES.nationwide;
  if (RED_VARIANT.includes(bankId)) return THEMES.hsbc;
  if (GREEN_VARIANT.includes(bankId)) return THEMES.lloyds;
  if (US_BLUE.includes(bankId)) return THEMES.barclays;
  if (ORANGE_VARIANT.includes(bankId)) return THEMES.monzo;
  return buildFallbackTheme(bankAccent ?? '#4f8ef7');
}
