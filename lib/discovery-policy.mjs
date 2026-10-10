export const DISCOVERY_NOTICE = 'Discovery is a saved list updated only by the project owner through a manual scan. Automatic source refreshes do not search for new repositories. It is not an exhaustive index of community work.';

const LEGACY_NOTICES = new Set([
  'Discovery scans the 100 most recently updated repositories matching openai/math in their README. It is not an exhaustive index of community work.',
  'GitHub discovery could not be refreshed. Saved discovery remains available.'
]);

export function discoveryWarnings(warnings) {
  return [...new Set(warnings.filter(w => !LEGACY_NOTICES.has(w) && w !== DISCOVERY_NOTICE)), DISCOVERY_NOTICE];
}
