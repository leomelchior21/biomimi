export function matchesSearch(card, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    card.name,
    card.kingdom,
    card.principle,
    card.application,
    card.description,
    card.designTakeaway,
    ...card.tags,
  ].join(" ").toLowerCase();

  return haystack.includes(normalized);
}
