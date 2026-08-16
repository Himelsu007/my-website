// ========================================
// LEADERBOARD DATA — edit this file only
// ========================================
// Ranking is calculated automatically from W/L:
//     win % = w / (w + l)
// The list re-sorts itself, so the order you type them in does NOT matter.
// The podium (1st/2nd/3rd) and the Top 10 table both come from this array.
//
//   name  → full name shown on the card
//   alias → nickname shown in quotes (use "" for none)
//   pos   → PG / SG / SF / PF / C
//   w     → wins
//   l     → losses
//
// Players below MIN_GAMES are hidden (keeps the board legit).
// ========================================

const LEADERBOARD_SEASON = "2026 Season";
const LEADERBOARD_MIN_GAMES = 10;
const LEADERBOARD_MAX_ROWS = 10;

const leaderboardPlayers = [
    { name: "André Ferreira",  alias: "Dedé",    pos: "PG", w: 47, l: 8  },
    { name: "Tomás Silva",     alias: "Flash",   pos: "SG", w: 43, l: 11 },
    { name: "Rui Martins",     alias: "Jet",     pos: "SF", w: 41, l: 12 },
    { name: "Miguel Costa",    alias: "Ice",     pos: "PF", w: 38, l: 14 },
    { name: "João Pereira",    alias: "Torre",   pos: "C",  w: 35, l: 15 },
    { name: "Diogo Almeida",   alias: "Dee",     pos: "SG", w: 33, l: 16 },
    { name: "Pedro Sousa",     alias: "Sniper",  pos: "SF", w: 30, l: 16 },
    { name: "Bruno Carvalho",  alias: "Muralha", pos: "C",  w: 28, l: 17 },
    { name: "Ricardo Nunes",   alias: "Rico",    pos: "PG", w: 26, l: 18 },
    { name: "Nuno Ribeiro",    alias: "Chef",    pos: "PF", w: 24, l: 19 }
];
