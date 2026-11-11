-- Requested featured products. Preserve other catalogue fields and edit history.
UPDATE projects SET featured = 1, version = version + 1, updated_at = datetime('now')
WHERE id IN ('straight-desk', 'ignite-ai', 'luminary') AND featured = 0;
