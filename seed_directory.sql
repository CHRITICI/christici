-- Christici - Données de DÉMONSTRATION (fictives, aucune institution réelle)
-- Ces entrées servent uniquement à présenter le fonctionnement de la plateforme.

-- ===== Catégories =====
INSERT OR IGNORE INTO categories (slug, name, grp, icon, description, sort_order) VALUES
-- Organisations chrétiennes
('associations-chretiennes', 'Associations chrétiennes', 'organisation', 'fa-people-group', 'Associations et œuvres chrétiennes', 1),
('bibliotheques-chretiennes', 'Bibliothèques & librairies chrétiennes', 'organisation', 'fa-book-open', 'Bibliothèques et librairies chrétiennes', 2),
('instituts-bibliques', 'Instituts & centres de formation biblique', 'organisation', 'fa-graduation-cap', 'Instituts bibliques et centres de formation en théologie', 3),
('centres-de-priere', 'Centres de prière', 'organisation', 'fa-hands-praying', 'Centres et maisons de prière', 4),
('camps-de-priere', 'Camps de prière', 'organisation', 'fa-campground', 'Camps et retraites de prière', 5),
('centres-formation-musicale', 'Centres de formation musicale', 'organisation', 'fa-music', 'Écoles et centres de formation musicale chrétienne', 6),
-- Affaires chrétiennes
('microfinances-chretiennes', 'Microfinances chrétiennes', 'affaire', 'fa-hand-holding-dollar', 'Institutions de microfinance à valeurs chrétiennes', 1),
('hopitaux-chretiens', 'Hôpitaux & cliniques chrétiennes', 'affaire', 'fa-hospital', 'Établissements de santé chrétiens', 2),
('bars-sans-alcool', 'Bars sans alcool', 'affaire', 'fa-mug-saucer', 'Bars et cafés sans alcool', 3),
('restaurants-chretiens', 'Restaurants à restrictions chrétiennes', 'affaire', 'fa-utensils', 'Restaurants respectant des restrictions chrétiennes', 4),
('studios-chretiens', 'Studios chrétiens', 'affaire', 'fa-microphone-lines', "Studios d'enregistrement et de production chrétiens", 5),
('librairies-chretiennes', 'Librairies chrétiennes', 'affaire', 'fa-book', 'Librairies chrétiennes', 6),
-- Profils chrétiens
('musiciens-chretiens', 'Musiciens chrétiens', 'profil', 'fa-guitar', 'Musiciens et instrumentistes chrétiens', 1),
('groupes-musicaux-chretiens', 'Groupes musicaux chrétiens', 'profil', 'fa-users-line', 'Groupes et chorales gospel', 2),
('sociologues-chretiens', 'Sociologues chrétiens', 'profil', 'fa-user-tie', 'Sociologues et chercheurs chrétiens', 3);

-- ===== Églises (démonstration - Togo) =====
INSERT OR IGNORE INTO churches (name, slug, denomination, description, country, region, city, district, address, phone, latitude, longitude, pastor_name, service_times, featured) VALUES
('Cathédrale du Sacré-Cœur (démo)', 'cathedrale-sacre-coeur-demo', 'Catholique',
 'Entrée de démonstration : grande église catholique du centre-ville.',
 'Togo', 'Maritime', 'Lomé', 'Centre', 'Avenue de la Paix (exemple)', '+228 00 00 00 01',
 6.1319, 1.2228, 'Nom du responsable (démo)', 'Dimanche 7h00 & 9h30', 1),
('Temple Évangélique de la Grâce (démo)', 'temple-evangelique-grace-demo', 'Pentecôtiste',
 'Entrée de démonstration : église évangélique pentecôtiste.',
 'Togo', 'Maritime', 'Lomé', 'Bè', 'Rue de l''Espérance (exemple)', '+228 00 00 00 02',
 6.1425, 1.2350, 'Nom du responsable (démo)', 'Dimanche 8h00, Mercredi 18h00', 1),
('Église Presbytérienne de Tsévié (démo)', 'eglise-presbyterienne-tsevie-demo', 'Presbytérienne',
 'Entrée de démonstration : église presbytérienne.',
 'Togo', 'Maritime', 'Tsévié', 'Centre', 'Quartier administratif (exemple)', '+228 00 00 00 03',
 6.4260, 1.2130, 'Nom du responsable (démo)', 'Dimanche 9h00', 0),
('Assemblée de Dieu de Kara (démo)', 'assemblee-de-dieu-kara-demo', 'Pentecôtiste',
 'Entrée de démonstration : assemblée chrétienne du Nord.',
 'Togo', 'Kara', 'Kara', 'Tomdè', 'Route nationale (exemple)', '+228 00 00 00 04',
 9.5510, 1.1862, 'Nom du responsable (démo)', 'Dimanche 8h30', 1),
('Église Méthodiste d''Aného (démo)', 'eglise-methodiste-aneho-demo', 'Méthodiste',
 'Entrée de démonstration : église méthodiste historique.',
 'Togo', 'Maritime', 'Aného', 'Centre', 'Bord de mer (exemple)', '+228 00 00 00 05',
 6.2280, 1.5910, 'Nom du responsable (démo)', 'Dimanche 9h00', 0),
('Communauté Baptiste de Sokodé (démo)', 'communaute-baptiste-sokode-demo', 'Baptiste',
 'Entrée de démonstration : communauté baptiste du Centre.',
 'Togo', 'Centrale', 'Sokodé', 'Centre', 'Avenue principale (exemple)', '+228 00 00 00 06',
 8.9833, 1.1333, 'Nom du responsable (démo)', 'Dimanche 8h00', 0);

-- ===== Organisations chrétiennes (démo) =====
INSERT OR IGNORE INTO directory_entries (category_id, name, slug, description, region, city, address, phone, website, latitude, longitude, featured) VALUES
((SELECT id FROM categories WHERE slug='associations-chretiennes'), 'Association Solidarité Chrétienne (démo)', 'assoc-solidarite-demo',
 'Association fictive de démonstration dédiée à l''entraide.', 'Maritime', 'Lomé', 'Quartier Tokoin (exemple)', '+228 00 00 00 10', 'https://exemple.org', 6.1500, 1.2400, 1),
((SELECT id FROM categories WHERE slug='bibliotheques-chretiennes'), 'Bibliothèque La Bonne Semence (démo)', 'biblio-bonne-semence-demo',
 'Bibliothèque chrétienne fictive de démonstration.', 'Maritime', 'Lomé', 'Rue des Livres (exemple)', '+228 00 00 00 11', 'https://exemple.org', 6.1450, 1.2300, 1),
((SELECT id FROM categories WHERE slug='instituts-bibliques'), 'Institut Biblique de l''Aurore (démo)', 'institut-aurore-demo',
 'Institut de formation biblique fictif de démonstration.', 'Maritime', 'Lomé', 'Avenue de la Connaissance (exemple)', '+228 00 00 00 12', 'https://exemple.org', 6.1600, 1.2250, 1),
((SELECT id FROM categories WHERE slug='centres-de-priere'), 'Centre de Prière Mont Carmel (démo)', 'centre-priere-carmel-demo',
 'Centre de prière fictif de démonstration.', 'Plateaux', 'Kpalimé', 'Route des collines (exemple)', '+228 00 00 00 13', NULL, 6.9000, 0.6333, 0),
((SELECT id FROM categories WHERE slug='camps-de-priere'), 'Camp de Prière de l''Espérance (démo)', 'camp-esperance-demo',
 'Camp de prière fictif de démonstration.', 'Centrale', 'Sokodé', 'Zone verte (exemple)', '+228 00 00 00 14', NULL, 8.9900, 1.1400, 0),
((SELECT id FROM categories WHERE slug='centres-formation-musicale'), 'École de Musique Céleste (démo)', 'ecole-musique-celeste-demo',
 'Centre de formation musicale fictif de démonstration.', 'Maritime', 'Lomé', 'Rue des Artistes (exemple)', '+228 00 00 00 15', 'https://exemple.org', 6.1380, 1.2180, 0),
-- Affaires chrétiennes (démo)
((SELECT id FROM categories WHERE slug='microfinances-chretiennes'), 'Microfinance Bon Berger (démo)', 'microfinance-bon-berger-demo',
 'Institution de microfinance fictive de démonstration.', 'Maritime', 'Lomé', 'Boulevard du Commerce (exemple)', '+228 00 00 00 16', 'https://exemple.org', 6.1350, 1.2280, 1),
((SELECT id FROM categories WHERE slug='hopitaux-chretiens'), 'Clinique Bethsaïda (démo)', 'clinique-bethsaida-demo',
 'Clinique fictive de démonstration.', 'Maritime', 'Lomé', 'Quartier Hanoukopé (exemple)', '+228 00 00 00 17', NULL, 6.1520, 1.2320, 0),
((SELECT id FROM categories WHERE slug='bars-sans-alcool'), 'Café La Source Vive (démo)', 'cafe-source-vive-demo',
 'Bar sans alcool fictif de démonstration.', 'Maritime', 'Lomé', 'Avenue des Cocotiers (exemple)', '+228 00 00 00 18', NULL, 6.1330, 1.2150, 0),
((SELECT id FROM categories WHERE slug='restaurants-chretiens'), 'Restaurant Le Pain Quotidien (démo)', 'resto-pain-quotidien-demo',
 'Restaurant fictif de démonstration.', 'Maritime', 'Lomé', 'Rue du Marché (exemple)', '+228 00 00 00 19', NULL, 6.1410, 1.2200, 0),
((SELECT id FROM categories WHERE slug='studios-chretiens'), 'Studio Nouvelle Jérusalem (démo)', 'studio-nouvelle-jerusalem-demo',
 'Studio d''enregistrement fictif de démonstration.', 'Maritime', 'Lomé', 'Quartier Agbalépédogan (exemple)', '+228 00 00 00 20', 'https://exemple.org', 6.1680, 1.2380, 1),
((SELECT id FROM categories WHERE slug='librairies-chretiennes'), 'Librairie La Lampe (démo)', 'librairie-la-lampe-demo',
 'Librairie chrétienne fictive de démonstration.', 'Kara', 'Kara', 'Grand marché (exemple)', '+228 00 00 00 21', NULL, 9.5530, 1.1880, 0);

-- ===== Profils chrétiens (démo) =====
INSERT OR IGNORE INTO profiles (category_id, full_name, slug, title, bio, skills, city, email, available, featured) VALUES
((SELECT id FROM categories WHERE slug='musiciens-chretiens'), 'Koffi Mensah (démo)', 'koffi-mensah-demo', 'Pianiste & chef de chœur',
 'Profil fictif de démonstration : musicien d''église expérimenté.',
 '["piano","chant","direction de chœur"]', 'Lomé', 'contact@exemple.org', 1, 1),
((SELECT id FROM categories WHERE slug='musiciens-chretiens'), 'Afi Sowu (démo)', 'afi-sowu-demo', 'Guitariste gospel',
 'Profil fictif de démonstration : guitariste pour cultes et concerts.',
 '["guitare","arrangement"]', 'Lomé', 'contact@exemple.org', 1, 0),
((SELECT id FROM categories WHERE slug='groupes-musicaux-chretiens'), 'Groupe Les Messagers (démo)', 'groupe-les-messagers-demo', 'Groupe gospel',
 'Groupe fictif de démonstration : chorale gospel de 12 membres.',
 '["gospel","chorale","concerts"]', 'Tsévié', 'contact@exemple.org', 1, 1),
((SELECT id FROM categories WHERE slug='sociologues-chretiens'), 'Dr Akou Dossou (démo)', 'akou-dossou-demo', 'Sociologue',
 'Profil fictif de démonstration : sociologue spécialisée en dynamiques religieuses.',
 '["recherche","consulting","formation"]', 'Lomé', 'contact@exemple.org', 1, 0);

-- ===== Événements (démo) =====
INSERT OR IGNORE INTO events (title, slug, description, event_type, start_date, end_date, location_name, city, region, organizer, featured) VALUES
('Concert Gospel de l''Espérance (démo)', 'concert-gospel-esperance-demo',
 'Événement fictif de démonstration : grand concert gospel.',
 'Concert', '2026-09-20 18:00', '2026-09-20 22:00', 'Palais des Congrès (exemple)', 'Lomé', 'Maritime', 'Organisateur (démo)', 1),
('Campagne d''évangélisation du Nord (démo)', 'campagne-evangelisation-nord-demo',
 'Événement fictif de démonstration : croisade d''évangélisation.',
 'Croisade', '2026-10-05 17:00', '2026-10-08 21:00', 'Stade municipal (exemple)', 'Kara', 'Kara', 'Organisateur (démo)', 1),
('Séminaire de formation biblique (démo)', 'seminaire-formation-biblique-demo',
 'Événement fictif de démonstration : séminaire de formation.',
 'Formation', '2026-11-14 08:00', '2026-11-15 17:00', 'Institut Biblique (exemple)', 'Lomé', 'Maritime', 'Organisateur (démo)', 0);

-- ===== Actualités (démo) =====
INSERT OR IGNORE INTO news (title, slug, excerpt, body, featured) VALUES
('Lancement de la nouvelle plateforme Christici (démo)', 'lancement-plateforme-christici-demo',
 'Christici lance sa plateforme de référencement du monde chrétien au Togo.',
 'Article de démonstration. Christici se donne pour mission de révéler l''environnement chrétien au monde : églises, organisations, profils et services chrétiens rassemblés en un seul endroit.',
 1),
('La communauté chrétienne se mobilise (démo)', 'communaute-chretienne-mobilise-demo',
 'Exemple d''actualité communautaire.',
 'Article de démonstration présentant le format des nouvelles publiées sur Christici.',
 0);

-- ===== Offres d'emploi (démo) =====
INSERT OR IGNORE INTO jobs (title, slug, organization, description, city, contract_type, deadline) VALUES
('Animateur radio chrétien (démo)', 'animateur-radio-chretien-demo', 'Radio chrétienne (démo)',
 'Offre fictive de démonstration : recherche animateur pour émission gospel.',
 'Lomé', 'CDI', '2026-10-31'),
('Comptable pour ONG chrétienne (démo)', 'comptable-ong-chretienne-demo', 'ONG chrétienne (démo)',
 'Offre fictive de démonstration : poste de comptable.',
 'Lomé', 'CDD', '2026-11-15');

-- ===== Publications (démo) =====
INSERT OR IGNORE INTO publications (title, slug, author, description, published_date, featured) VALUES
('Marcher dans la lumière (démo)', 'marcher-dans-la-lumiere-demo', 'Auteur (démo)',
 'Ouvrage fictif de démonstration : méditations quotidiennes.',
 '2026-08-01', 1),
('L''Église et la communication (démo)', 'eglise-et-communication-demo', 'Auteur (démo)',
 'Ouvrage fictif de démonstration : essai sur la visibilité des institutions chrétiennes.',
 '2026-07-15', 0);
