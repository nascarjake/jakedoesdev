-- Owner confirms AI-assisted image processing; no specific historical algorithm is inferred.
UPDATE projects SET
 summary='Built during my college internship and used at Baylor Medical Center in 2011. It used AI-assisted medical image segmentation to outline tumor regions, then correlated 2D biopsy scans with a 3D biopsy model to reconstruct the outlined tissue in context.',
 story_html='<p>I built Tumor Identifier during my college internship. It was used at Baylor Medical Center in 2011, and remains one of the projects I am proudest of: applying software to work that matters to patients.</p><p>The image-processing workflow used AI-assisted segmentation to delineate tumor boundaries in the scans, then mapped the outlined regions into a 3D representation.</p>',
 highlights_json='["Used AI-assisted medical image segmentation to outline tumor regions in biopsy scans.","Aligned marked regions from 2D scans with a three-dimensional biopsy model.","Generated an outlined 3D representation of identified tumor tissue.","Used WebGL and browser tooling to make the scan-to-model relationship explorable."]',
 stack_json='["WebGL","Node.js","JavaScript"]',
 systems_json='["WebGL, Node.js, and custom browser JavaScript","AI-assisted medical image segmentation and tumor-boundary delineation","2D/3D scan alignment, contours, and reconstruction"]',
 version=version+1, updated_at=datetime('now')
WHERE id='tumor-identifier';
