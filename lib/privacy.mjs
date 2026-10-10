// Remove the prior version's own preference key. Never inspect its contents,
// create a migration flag, or clear unrelated data on the same origin.
export function discardLegacyPreferences(browser = globalThis) {
  try { browser.localStorage?.removeItem('frontier-following-v1'); }
  catch { /* Browsers that deny storage still get a functioning explorer. */ }
}
