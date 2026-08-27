-- Christici - Données d'exemple (contenu générique, aucune donnée personnelle)

INSERT OR IGNORE INTO media_items (type, title, slug, description, thumbnail_url, media_url, body, metadata, featured) VALUES
-- Vidéos
('video', 'Bienvenue sur Christici', 'bienvenue-sur-christici',
 'Vidéo de présentation de la plateforme Christici.',
 'https://placehold.co/800x450/1e293b/f8fafc?text=Video+Christici',
 '', NULL, '{"duration":"1:30","tags":["presentation"]}', 1),
('video', 'Coulisses & création', 'coulisses-et-creation',
 'Un aperçu du processus créatif derrière les contenus.',
 'https://placehold.co/800x450/334155/f8fafc?text=Video+2',
 '', NULL, '{"duration":"4:12","tags":["creation"]}', 0),

-- Musique
('music', 'Horizon', 'horizon',
 'Premier titre de la collection Christici - ambiance instrumentale.',
 'https://placehold.co/600x600/0f766e/f8fafc?text=Horizon',
 '', NULL, '{"duration":"3:24","genre":"instrumental"}', 1),
('music', 'Aurore', 'aurore',
 'Composition douce et lumineuse.',
 'https://placehold.co/600x600/0e7490/f8fafc?text=Aurore',
 '', NULL, '{"duration":"2:58","genre":"ambient"}', 0),

-- Images
('image', 'Série Lumières', 'serie-lumieres',
 'Série photographique sur la lumière naturelle.',
 'https://placehold.co/800x600/7c2d12/f8fafc?text=Lumieres',
 'https://placehold.co/1600x1200/7c2d12/f8fafc?text=Lumieres',
 NULL, '{"album":"Lumieres","tags":["photo","lumiere"]}', 1),
('image', 'Textures urbaines', 'textures-urbaines',
 'Exploration visuelle des matières urbaines.',
 'https://placehold.co/800x600/374151/f8fafc?text=Textures',
 'https://placehold.co/1600x1200/374151/f8fafc?text=Textures',
 NULL, '{"album":"Urbain","tags":["photo","urbain"]}', 0),

-- Articles
('article', 'Pourquoi Christici ?', 'pourquoi-christici',
 'Les raisons et la vision derrière cette plateforme multimédia.',
 'https://placehold.co/800x450/4c1d95/f8fafc?text=Article+1',
 NULL,
 'Christici est né d''une envie simple : réunir au même endroit vidéos, musique, images et écrits. Cette plateforme est pensée comme un espace vivant, évolutif, où chaque création trouve sa place.\n\nCette première version pose les fondations : une architecture propre, une base de données, et une interface claire. La suite se construira pas à pas.',
 '{"readingTime":"2 min","tags":["vision"]}', 1),
('article', 'Les coulisses techniques', 'coulisses-techniques',
 'Comment la plateforme est construite, côté technique.',
 'https://placehold.co/800x450/1e3a8a/f8fafc?text=Article+2',
 NULL,
 'Christici repose sur une architecture moderne : un backend léger avec Hono, déployé à la périphérie du réseau Cloudflare, et une base de données SQLite distribuée (D1).\n\nCe choix permet un site rapide partout dans le monde, avec des coûts maîtrisés et une grande simplicité de maintenance.',
 '{"readingTime":"3 min","tags":["technique"]}', 0);
