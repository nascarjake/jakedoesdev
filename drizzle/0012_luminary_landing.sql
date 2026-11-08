-- Preserve Luminary's portfolio identity; the Lab includes the same record.
UPDATE projects SET source_label = 'Explore Luminary', source_url = 'https://jakedoesdev.com/luminary/', version = version + 1, updated_at = datetime('now') WHERE id = 'luminary' AND (source_label IS NULL OR source_label = '');
