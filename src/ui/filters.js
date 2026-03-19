import { STAT_KEYS } from "../data/organisms.js";

export function dominantStat(card) {
  return STAT_KEYS.reduce((best, key) => (card.stats[key] > card.stats[best] ? key : best), STAT_KEYS[0]);
}

export function buildExploreFilters(cards) {
  return {
    kingdom: ["all", ...new Set(cards.map((card) => card.kingdom))],
    principle: ["all", ...new Set(cards.map((card) => card.principle))],
    application: ["all", ...new Set(cards.map((card) => card.application))],
    stat: ["all", ...STAT_KEYS],
  };
}

export function applyExploreFilters(cards, filters) {
  return cards.filter((card) => {
    return (filters.kingdom === "all" || card.kingdom === filters.kingdom)
      && (filters.principle === "all" || card.principle === filters.principle)
      && (filters.application === "all" || card.application === filters.application)
      && (filters.stat === "all" || dominantStat(card) === filters.stat);
  });
}
