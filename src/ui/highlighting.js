export function getMissionHighlight(card, mission) {
  if (!mission) {
    return { isHighlighted: false, isSuggested: false, score: 0 };
  }

  const tagMatches = card.tags.filter((tag) => mission.tags.includes(tag)).length;
  const statBonus = card.stats[mission.statFocus] / 20;
  const isSuggested = mission.suggestedOrganisms.includes(card.id);
  const score = tagMatches + statBonus + (isSuggested ? 2 : 0);

  return {
    isHighlighted: score >= 4,
    isSuggested,
    score,
  };
}

export function compareMissionFit(cards, mission) {
  return cards.map((card) => getMissionHighlight(card, mission)).reduce((sum, item) => sum + item.score, 0);
}
