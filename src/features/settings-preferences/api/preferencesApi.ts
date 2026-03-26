export interface PreferencesPayload {
  selectedSavedView: string;
  selectedStage: string;
}

export function normalizePreferences(payload: PreferencesPayload): PreferencesPayload {
  return payload;
}
