'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import {
  saveFilterPreset,
  getFilterPresets,
  deleteFilterPreset,
  applyFilterPreset,
  type FilterPreset,
} from '@/lib/filter-presets';
import { toast } from '@/hooks/use-toast';

interface PresetManagerProps {
  pageKey: string;
  currentFilters: Record<string, any>;
  onApplyPreset: (filters: Record<string, any>) => void;
}

export function PresetManager({
  pageKey,
  currentFilters,
  onApplyPreset,
}: PresetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    setPresets(getFilterPresets(pageKey));
  }, [pageKey]);

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a name for the preset');
      return;
    }

    setIsSaving(true);
    try {
      const preset = saveFilterPreset(pageKey, presetName.trim(), currentFilters);
      setPresets([...presets, preset]);
      setPresetName('');
      toast.success('Filter preset saved');
    } catch (error) {
      toast.error('Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    const filters = applyFilterPreset(preset);
    onApplyPreset(filters);
    setIsOpen(false);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const handleDeletePreset = (presetId: string) => {
    deleteFilterPreset(pageKey, presetId);
    setPresets(presets.filter((p) => p.id !== presetId));
    toast.success('Preset deleted');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <svg
          className="h-4 w-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        Presets
        {presets.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-200 text-xs">
            {presets.length}
          </span>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter Presets"
        size="md"
      >
        <div className="space-y-4">
          {/* Save Current Filters */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium mb-2">Save Current Filters</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <Button onClick={handleSavePreset} disabled={isSaving}>
                Save
              </Button>
            </div>
          </div>

          {/* Saved Presets */}
          <div>
            <h3 className="text-sm font-medium mb-2">Saved Presets</h3>
            {presets.length === 0 ? (
              <p className="text-sm text-gray-500">No presets saved</p>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{preset.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(preset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}


