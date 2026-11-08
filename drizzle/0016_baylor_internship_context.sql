-- Owner supplied Baylor use, year and college-internship context. No clinical outcome claims.
UPDATE projects SET
 eyebrow='Baylor Medical Center · College internship',
 role='College intern · Medical imaging development',
 summary='Built during my college internship and used at Baylor Medical Center in 2011. The application correlated 2D biopsy scans with a 3D biopsy model and reconstructed outlined tumor tissue in context.',
 story_html='<p>I built Tumor Identifier during my college internship. It was used at Baylor Medical Center in 2011, and remains one of the projects I am proudest of: applying software to work that matters to patients.</p>',
 stack_json='["WebGL","Node.js","JavaScript"]',
 systems_json='["WebGL, Node.js, and custom browser JavaScript","2D/3D scan alignment, contours, and reconstruction"]',
 version=version+1, updated_at=datetime('now')
WHERE id='tumor-identifier';
