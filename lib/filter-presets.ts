/**
 * Filter preset management utilities
 * Allows saving and loading filter presets for different pages
 */

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

const PRESET_STORAGE_PREFIX = 'uams_filter_presets_';

/**
 * Save a filter preset
 */
export function saveFilterPreset(
  pageKey: string,
  name: string,
  filters: Record<string, any>
): FilterPreset {
  const preset: FilterPreset = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    filters,
    createdAt: new Date().toISOString(),
  };

  const presets = getFilterPresets(pageKey);
  presets.push(preset);
  localStorage.setItem(
    `${PRESET_STORAGE_PREFIX}${pageKey}`,
    JSON.stringify(presets)
  );

  return preset;
}

/**
 * Get all filter presets for a page
 */
export function getFilterPresets(pageKey: string): FilterPreset[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(`${PRESET_STORAGE_PREFIX}${pageKey}`);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Delete a filter preset
 */
export function deleteFilterPreset(pageKey: string, presetId: string): void {
  const presets = getFilterPresets(pageKey);
  const filtered = presets.filter((p) => p.id !== presetId);
  localStorage.setItem(
    `${PRESET_STORAGE_PREFIX}${pageKey}`,
    JSON.stringify(filtered)
  );
}

/**
 * Apply a filter preset
 */
export function applyFilterPreset(preset: FilterPreset): Record<string, any> {
  return { ...preset.filters };
}

