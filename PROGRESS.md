# Dev Organizer - Progression du Développement

Dernière mise à jour : 2026-01-09

---

## ÉTAPE 1: Bootstrap ✅ COMPLÉTÉ

### Complété
- [x] Installation des dépendances (pnpm)
  - Runtime : react-router-dom, zustand, dexie, jszip, mustache, date-fns
  - Dev : tailwindcss, postcss, autoprefixer, vite-plugin-pwa, vitest, happy-dom, @vitest/ui
- [x] Configuration Tailwind CSS (tailwind.config.js + postcss.config.js + src/index.css)
- [x] Arborescence complète des dossiers créée
- [x] Types du domaine complets (src/domain/types.ts) - 13 entités
- [x] Configuration Dexie (src/storage/db.ts) - 13 tables IndexedDB
- [x] Routing (src/routes/index.tsx) - 8 routes configurées
- [x] Layout de base (src/components/layout/Layout.tsx) avec header, nav, footer
- [x] Pages placeholder créées (8 pages)
- [x] Configuration PWA (vite.config.ts) avec vite-plugin-pwa + manifest + service worker
- [x] Configuration Vitest (vitest.config.ts) + scripts dans package.json
- [x] App.tsx avec initialisation DB et RouterProvider
- [x] Fichier de suivi (PROGRESS.md)
- [x] Tests : l'app démarre correctement sur http://localhost:5173
- [x] Navigation entre pages fonctionne

### Fichiers créés (ÉTAPE 1)
```
/home/adoum/dev-organizer/
├── tailwind.config.js
├── postcss.config.js
├── vitest.config.ts
├── vite.config.ts (modifié)
├── package.json (modifié)
├── PROGRESS.md
├── src/
│   ├── index.css (modifié pour Tailwind)
│   ├── App.tsx (modifié)
│   ├── domain/
│   │   └── types.ts (13 entités typées)
│   ├── storage/
│   │   └── db.ts (Dexie config + 13 tables)
│   ├── routes/
│   │   └── index.tsx (8 routes)
│   ├── components/
│   │   └── layout/
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsListPage.tsx
│   │   ├── ProjectWizardPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── MilestonesTasksPage.tsx
│   │   ├── DocumentsLibraryPage.tsx
│   │   ├── CalendarPage.tsx
│   │   └── DocsReportsPage.tsx
│   └── utils/
│       └── id.ts
```

---

## ÉTAPE 2: Projets + Jalons + Tâches ✅ COMPLÉTÉ

### Complété
- [x] Utilitaire génération ID (src/utils/id.ts)
- [x] Repos CRUD créés :
  - [x] projectRepo (src/storage/repos/projectRepo.ts)
  - [x] milestoneRepo (src/storage/repos/milestoneRepo.ts)
  - [x] taskRepo (src/storage/repos/taskRepo.ts)
  - [x] activityEventRepo (src/storage/repos/activityEventRepo.ts)
- [x] Logique de calcul de progression (src/domain/progress.ts)
  - calculateMilestoneProgress()
  - calculateProjectProgress()
  - calculateProjectHealth()
  - calculateProjectProgressStats()
  - calculateMilestonesProgress()
- [x] Tests vitest pour progress calc (src/__tests__/progress.test.ts)
  - 12 tests qui passent tous ✅
- [x] Wizard de création projet (src/pages/ProjectWizardPage.tsx)
  - 2 étapes : Infos projet + Jalons/Tâches
  - Création automatique du milestone "GENERAL"
  - Validation et sauvegarde en DB
- [x] Liste des projets + filtres (src/pages/ProjectsListPage.tsx)
  - Filtres : ALL / ACTIVE / ARCHIVED
  - Archive/Unarchive fonctionnel
  - Cartes projets avec toutes infos
  - Bouton "+ New Project"
- [x] Project Dashboard avec indicateurs (src/pages/ProjectDetailPage.tsx)
  - 3 cartes indicateurs (%, tâches, prochain jalon)
  - Section blocages (alerte rouge)
  - Liste jalons avec progression et barres
  - Top 5 tâches à faire (triées par dueDate)
  - Activité récente (10 derniers événements)
  - Quick Actions (placeholders)
- [x] Vue Tâches avec Kanban et Liste (src/pages/MilestonesTasksPage.tsx)
  - Kanban : TODO | DOING | DONE | BLOCKED (4 colonnes)
  - Liste tabulaire avec toutes les infos
  - Filtres par milestone
  - Formulaire ajouter tâche rapide
  - Changement de status avec boutons
  - Gestion des blocages (prompt pour raison)
  - Suppression de tâches
- [x] Dashboard global (src/pages/DashboardPage.tsx)
  - 4 cartes stats (Projets actifs, Tâches totales, Taux complétion, Blocages)
  - Liste projets actifs avec indicateurs et health badges
  - Tâches dues aujourd'hui (tous projets)
  - Blocages globaux (jalons + tâches)
  - Activité récente globale (20 derniers événements)

### Fichiers créés/modifiés (ÉTAPE 2)
```
src/
├── utils/
│   └── id.ts (NEW - 8 lignes)
├── storage/repos/
│   ├── projectRepo.ts (NEW - 53 lignes)
│   ├── milestoneRepo.ts (NEW - 52 lignes)
│   ├── taskRepo.ts (NEW - 78 lignes)
│   └── activityEventRepo.ts (NEW - 56 lignes)
├── domain/
│   └── progress.ts (NEW - 155 lignes, 5 fonctions)
├── __tests__/
│   └── progress.test.ts (NEW - 350 lignes, 12 tests ✅)
└── pages/
    ├── ProjectWizardPage.tsx (COMPLET - 475 lignes)
    ├── ProjectsListPage.tsx (COMPLET - 209 lignes)
    ├── ProjectDetailPage.tsx (COMPLET - 314 lignes)
    ├── MilestonesTasksPage.tsx (COMPLET - 484 lignes)
    └── DashboardPage.tsx (COMPLET - 365 lignes)
```

**Total ÉTAPE 2**: ~2,600 lignes de code + 350 lignes de tests

---

## ÉTAPE 3: Documents (Embedded + Workspace) ✅ COMPLÉTÉ

### Complété
- [x] Document repository (documentRepo.ts)
  - getAll(), getById(), getByProject(), getGlobal()
  - getByStorageMode(), search(), create(), update(), delete()
- [x] Embedded file repository (embeddedFileRepo.ts)
  - getAll(), getByKey(), store(), delete()
  - getTotalSize(), hasSpace()
- [x] FileStore avec gestion dual-mode (fileStore.ts)
  - uploadFile() : détection automatique EMBEDDED/WORKSPACE
  - downloadFile() : récupération depuis IndexedDB ou FileSystem
  - deleteFile() : suppression depuis les deux stockages
  - getStorageStats() : statistiques d'utilisation
- [x] WorkspaceFileStore avec File System Access API
  - requestWorkspaceAccess() : demande permission utilisateur
  - saveToWorkspace() : stockage fichiers > 20MB
  - loadFromWorkspace() : chargement depuis FileSystem
  - deleteFromWorkspace() : suppression fichiers workspace
- [x] DocumentsLibraryPage complète (440 lignes)
  - 4 cartes stats (Total, Embedded, Workspace, Status)
  - Filtres : par projet (ALL/GLOBAL/PROJECT), par mode stockage, recherche
  - Table documents avec badges storageMode (EMBEDDED/WORKSPACE)
  - Upload modal avec sélection projet et tags
  - Téléchargement et suppression documents
  - Bouton "Lier Workspace" pour File System Access API
- [x] Types mis à jour
  - Ajout `blockedReason` à Milestone
  - Ajout `description` à ActivityEvent
  - Ajout `blockedCount` à ProjectProgress

### Fichiers créés/modifiés (ÉTAPE 3)
```
src/
├── storage/
│   ├── fileStore.ts (NEW - 225 lignes)
│   └── repos/
│       ├── documentRepo.ts (NEW - 104 lignes)
│       └── embeddedFileRepo.ts (NEW - 60 lignes)
├── domain/
│   ├── types.ts (MODIFIÉ - ajout blockedReason, description, blockedCount)
│   └── progress.ts (MODIFIÉ - ajout blockedCount dans retour)
└── pages/
    └── DocumentsLibraryPage.tsx (COMPLET - 440 lignes)
```

**Total ÉTAPE 3**: ~830 lignes de code

---

## ÉTAPE 4: Notes + Snippets + Search ✅ COMPLÉTÉ

### Complété
- [x] Note repository (noteRepo.ts)
  - getAll(), getById(), getByProject(), getGlobal()
  - search(), create(), update(), delete()
- [x] Snippet repository (snippetRepo.ts)
  - getAll(), getById(), getByProject(), getGlobal()
  - getByLanguage(), search(), create(), update(), delete()
- [x] NotesSnippetsPage avec onglets (750 lignes)
  - Onglets Notes / Snippets avec compteurs
  - Vue cartes pour Notes (titre, contentMd, tags, projet, date)
  - Vue cartes pour Snippets (titre, code, language, tags, projet, date)
  - Filtres : par projet (ALL/GLOBAL/PROJECT), recherche full-text
  - Modal création/édition Notes (titre, contenu Markdown, tags, projet)
  - Modal création/édition Snippets (titre, code, language, tags, projet)
  - 14 langages supportés (JavaScript, TypeScript, Python, Java, Go, Rust, SQL, Bash, HTML, CSS, JSON, YAML, Markdown, Other)
  - Édition et suppression avec confirmation
  - Recherche dans titre, contenu/code, tags, language
- [x] Route ajoutée : /notes
- [x] Navigation mise à jour avec lien "Notes & Snippets"

### Fichiers créés/modifiés (ÉTAPE 4)
```
src/
├── storage/repos/
│   ├── noteRepo.ts (NEW - 97 lignes)
│   └── snippetRepo.ts (NEW - 105 lignes)
├── pages/
│   └── NotesSnippetsPage.tsx (NEW - 750 lignes)
├── routes/
│   └── index.tsx (MODIFIÉ - ajout route /notes)
└── components/layout/
    └── Layout.tsx (MODIFIÉ - ajout lien navigation)
```

**Total ÉTAPE 4**: ~950 lignes de code

---

## ÉTAPE 5: Calendrier/Timeline + Rapports Hebdo ✅ COMPLÉTÉ

### Complété

- [x] Calendar logic (calendar.ts)
  - getProjectCalendarEvents() : génération événements depuis projets, jalons, tâches
  - getAllCalendarEvents() : agrégation tous projets
  - groupEventsByDate() : regroupement par date
  - getMonthEvents() : filtrage par mois
  - Types d'événements : PROJECT (bleu), MILESTONE (orange/vert/rouge), TASK (gris/vert/rouge)
- [x] Weekly report repository (weeklyReportRepo.ts)
  - getAll(), getById(), getByProject()
  - getLatest() : récupération du dernier rapport pour calcul delta
  - create(), delete()
- [x] Reports logic (reports.ts)
  - generateWeeklyReport() : génération rapport Markdown avec delta progression
  - getWeekBoundaries() : calcul limites semaine (lundi-dimanche)
  - Sections : Stats, Jalons complétés, Tâches complétées, Nouvelles tâches, Blocages, Prochains jalons
- [x] CalendarPage avec deux vues (237 lignes)
  - Vue TIMELINE : liste chronologique de tous les événements avec badges couleur
  - Vue CALENDAR : grille mensuelle avec navigation mois précédent/suivant
  - Color coding : bleu (projet), vert (done), rouge (blocked), orange (milestone), gris (todo)
  - Événements affichés dans les cellules de jour (max 3 visibles + compteur)
- [x] WeeklyReportsPage avec génération et gestion (230 lignes)
  - Liste de tous les rapports générés triés par date (plus récent en premier)
  - Bouton "Générer Rapport Hebdo" : calcul automatique semaine courante (lundi-dimanche)
  - Preview panel : affichage du contenu Markdown du rapport sélectionné
  - Téléchargement rapport au format .md
  - Suppression de rapports avec confirmation
  - Affichage delta progression (vert si positif, rouge si négatif)
- [x] Routes ajoutées
  - /projects/:projectId/calendar => CalendarPage
  - /projects/:projectId/reports => WeeklyReportsPage
- [x] Navigation mise à jour
  - Liens depuis ProjectDetailPage vers Calendar et Weekly Reports
- [x] Types mis à jour
  - CalendarEvent : ajout type 'PROJECT', propriétés entityId et color
  - status optionnel pour événements projet

### Fichiers créés/modifiés (ÉTAPE 5)

```
src/
├── domain/
│   ├── calendar.ts (NEW - 130 lignes)
│   ├── reports.ts (NEW - 200 lignes)
│   └── types.ts (MODIFIÉ - CalendarEvent avec PROJECT type)
├── storage/repos/
│   └── weeklyReportRepo.ts (NEW - 68 lignes)
├── pages/
│   ├── CalendarPage.tsx (NEW - 237 lignes)
│   ├── WeeklyReportsPage.tsx (NEW - 230 lignes)
│   └── ProjectDetailPage.tsx (MODIFIÉ - ajout lien Weekly Reports)
└── routes/
    └── index.tsx (MODIFIÉ - ajout routes calendar et reports)
```

__Total ÉTAPE 5__: ~865 lignes de code

---

## ÉTAPE 6: DocGen + Backup Export/Import + Polish offline ✅ COMPLÉTÉ

### Complété

- [x] Mustache templates (6 templates)
  - README.mustache : Project overview with progress and milestones
  - SPEC.mustache : Detailed technical specification
  - ARCHITECTURE.mustache : System architecture and component breakdown
  - RUNBOOK.mustache : Operational guide for daily workflow
  - CHANGELOG.mustache : Timeline of changes and activity
  - ADR.mustache : Architecture Decision Records
- [x] Document generator logic (docgen.ts)
  - generateDocument() : Generate document from template with Mustache
  - prepareTemplateData() : Prepare comprehensive data for templates
  - getDocumentFilename() : Generate appropriate filename
  - Support for all 6 document types
- [x] DocsReportsPage complete (265 lignes)
  - List of 6 document types with descriptions
  - Click to generate and preview document
  - Preview panel with Markdown content
  - Download as .md file
  - Copy to clipboard
  - Export backup (ZIP with all project data)
  - Import backup (restore from ZIP)
- [x] Backup export/import logic (backup.ts)
  - exportProject() : Export single project to ZIP with all data
  - importProject() : Import project from ZIP backup
  - exportAllData() : Export complete database
  - Includes: projects, milestones, tasks, activity, notes, snippets, documents, reports
  - Embedded files stored separately in ZIP
  - README.txt included in backup
- [x] Persistent storage management (storage.ts)
  - isPersistentStorageAvailable() : Check browser support
  - isPersistentStorageGranted() : Check if already granted
  - requestPersistentStorage() : Request persistent storage
  - getStorageEstimate() : Get storage usage stats
- [x] DashboardPage updated
  - Storage stats card showing usage (MB) and quota
  - Progress bar for storage usage
  - Persistent storage status indicator
  - "Activer Stockage Persistant" button if not enabled
- [x] Build successful (642 KB gzipped)

### Fichiers créés/modifiés (ÉTAPE 6)

```
src/
├── templates/
│   ├── readme.mustache (NEW - 65 lignes)
│   ├── spec.mustache (NEW - 85 lignes)
│   ├── architecture.mustache (NEW - 135 lignes)
│   ├── runbook.mustache (NEW - 155 lignes)
│   ├── changelog.mustache (NEW - 110 lignes)
│   └── adr.mustache (NEW - 155 lignes)
├── domain/
│   ├── docgen.ts (NEW - 285 lignes)
│   └── backup.ts (NEW - 300 lignes)
├── utils/
│   └── storage.ts (NEW - 60 lignes)
├── pages/
│   ├── DocsReportsPage.tsx (COMPLET - 265 lignes)
│   └── DashboardPage.tsx (MODIFIÉ - ajout storage stats)
```

__Total ÉTAPE 6__: ~1,600 lignes de code

---

## Commandes Essentielles

```bash
# Développement
pnpm dev          # Lancer le serveur dev (http://localhost:5173)

# Tests
pnpm test         # Lancer les tests vitest
pnpm test:ui      # Lancer tests avec interface UI
pnpm test:coverage # Tests + coverage report

# Build
pnpm build        # Build production
pnpm preview      # Preview du build production

# Linting
pnpm lint         # Vérifier le code avec ESLint
```

---

## Structure Actuelle du Projet

```
dev-organizer/
├── public/                    # Assets statiques
├── src/
│   ├── components/           # Composants React
│   │   ├── layout/          # Layout principal (Header, Footer)
│   │   ├── projects/        # Composants projets (à venir)
│   │   ├── milestones/      # Composants jalons (à venir)
│   │   ├── tasks/           # Composants tâches (à venir)
│   │   ├── documents/       # Composants documents (à venir)
│   │   ├── notes/           # Composants notes (à venir)
│   │   ├── snippets/        # Composants snippets (à venir)
│   │   ├── calendar/        # Composants calendrier (à venir)
│   │   ├── reports/         # Composants rapports (à venir)
│   │   └── common/          # Composants réutilisables (à venir)
│   │
│   ├── domain/              # Logique métier
│   │   ├── types.ts         # Types TypeScript (13 entités) ✅
│   │   └── progress.ts      # Calculs de progression ✅
│   │
│   ├── storage/             # Couche de persistance
│   │   ├── db.ts            # Configuration Dexie (13 tables) ✅
│   │   └── repos/           # Repositories CRUD ✅
│   │       ├── projectRepo.ts
│   │       ├── milestoneRepo.ts
│   │       ├── taskRepo.ts
│   │       └── activityEventRepo.ts
│   │
│   ├── services/            # Services métier
│   │   ├── fileStore/       # Gestion fichiers (à venir)
│   │   ├── docgen/          # Génération docs (à venir)
│   │   ├── reports/         # Génération rapports (à venir)
│   │   ├── search/          # Recherche (à venir)
│   │   └── backup/          # Export/Import (à venir)
│   │
│   ├── pages/               # Pages de l'app
│   │   ├── DashboardPage.tsx          # Dashboard global ✅
│   │   ├── ProjectsListPage.tsx       # Liste projets (placeholder)
│   │   ├── ProjectWizardPage.tsx      # Wizard création ✅ COMPLET
│   │   ├── ProjectDetailPage.tsx      # Dashboard projet (placeholder)
│   │   ├── MilestonesTasksPage.tsx    # Vue jalons/tâches (placeholder)
│   │   ├── DocumentsLibraryPage.tsx   # Bibliothèque docs (placeholder)
│   │   ├── CalendarPage.tsx           # Calendrier (placeholder)
│   │   └── DocsReportsPage.tsx        # Docs/Rapports (placeholder)
│   │
│   ├── routes/              # Configuration routing
│   │   └── index.tsx        # 8 routes définies ✅
│   │
│   ├── hooks/               # Hooks React custom (à venir)
│   ├── utils/               # Utilitaires
│   │   └── id.ts            # Génération IDs ✅
│   │
│   ├── __tests__/           # Tests unitaires
│   │   └── progress.test.ts # Tests calculs (12 tests) ✅
│   │
│   ├── App.tsx              # Composant racine ✅
│   ├── main.tsx             # Point d'entrée ✅
│   └── index.css            # Styles Tailwind ✅
│
├── tailwind.config.js       # Config Tailwind ✅
├── postcss.config.js        # Config PostCSS ✅
├── vite.config.ts           # Config Vite + PWA ✅
├── vitest.config.ts         # Config Vitest ✅
├── tsconfig.json            # Config TypeScript ✅
├── package.json             # Dépendances ✅
├── pnpm-lock.yaml           # Lock file ✅
├── PROGRESS.md              # Ce fichier ✅
└── README.md                # Documentation Vite (original)
```

---

## Entités du Domaine (types.ts)

### 1. **Project** (Projet)
- Informations générales : name, description, status (ACTIVE/ARCHIVED)
- Priorité : LOW | MED | HIGH
- Objectifs, tags
- Dates : startDate, targetDate

### 2. **Milestone** (Jalon)
- Lié à un projet (projectId)
- Status : TODO | IN_PROGRESS | DONE | BLOCKED
- Weight (poids pour calcul progression) ≥ 1
- dueDate optionnel

### 3. **Task** (Tâche)
- Liée à un projet et optionnellement à un jalon
- Status : TODO | DOING | DONE | BLOCKED
- Points (1 par défaut)
- Order (pour tri stable)
- blockedReason si BLOCKED

### 4. **ProjectUpdate** (Journal de projet)
- Date + done[] + next[] + blockers[]

### 5. **Decision** (ADR light)
- Date, titre, contexte, décision, conséquences

### 6. **Note** (Note Markdown)
- Titre, contenu Markdown, tags
- Peut être liée à un projet (optionnel)

### 7. **Snippet** (Code snippet)
- Titre, language, code, tags
- Peut être lié à un projet (optionnel)

### 8. **DocumentMeta** (Métadonnées fichier)
- titre, fileName, mimeType, sizeBytes
- storageMode : EMBEDDED | WORKSPACE
- embeddedKey ou workspaceFileName selon le mode

### 9. **EmbeddedFile** (Fichier embarqué)
- key, blob, checksum, sizeBytes

### 10. **Settings** (Paramètres - singleton)
- id = "singleton"
- embedLimitMb (20 MB par défaut)
- workspaceLinked (boolean)
- schemaVersion

### 11. **ActivityEvent** (Événement d'activité)
- Type : TASK_DONE | TASK_BLOCKED | MILESTONE_DONE | DOC_ADDED | NOTE_EDITED
- payload JSON
- Utilisé pour rapports et feed d'activité

### 12. **WeeklyReport** (Rapport hebdomadaire)
- Période (start/end)
- progressStart, progressEnd, delta
- markdownContent généré

### 13. **ProgressSnapshot** (Snapshot de progression)
- date + progressPercent
- Utilisé pour calcul delta rapport hebdo

---

## Règles Métier Implémentées

### Calcul de Progression (src/domain/progress.ts)

1. **Progression d'un jalon** :
   - Si milestone.status == DONE => 100%
   - Sinon : (points des tâches DONE) / (total points) * 100

2. **Progression d'un projet** :
   - Somme pondérée : Σ(milestone.weight * milestone_progress) / Σ(milestone.weight)
   - Arrondi à l'entier

3. **Santé d'un projet** :
   - AT_RISK : si bloqueurs > 0 (tâches ou jalons BLOCKED)
   - LATE : si targetDate dépassée ET progress < 100%
   - ON_TRACK : sinon

4. **Tâches sans jalon** :
   - Automatiquement assignées au jalon "GENERAL" (créé par défaut)

---

## Tests (vitest)

### Tests de progression ✅ (12/12 passent)
```bash
pnpm test
```

Tests couverts :
- Milestone progress (4 tests) : DONE, no tasks, task points, zero points
- Project progress (2 tests) : no milestones, weighted calculation
- Project health (4 tests) : AT_RISK, LATE, ON_TRACK, completed
- Project stats (1 test) : stats complètes
- Milestones progress (1 test) : liste des progressions

---

## Prochaines Étapes (ÉTAPE 2 suite)

1. **ProjectsListPage** : Liste avec filtres + bouton "Créer"
2. **ProjectDetailPage** : Dashboard avec indicateurs, blocages, actions
3. **MilestonesTasksPage** : Vue liste + Kanban
4. **DashboardPage** : Vue globale avec tous les projets actifs

---

## Notes Importantes

- **Offline-first** : Toutes les données sont dans IndexedDB (Dexie)
- **PWA** : Service worker configuré pour cache offline
- **Tests** : Vitest avec happy-dom pour tests UI
- **TypeScript strict** : Tous les fichiers sont typés
- **Tailwind CSS** : Styles utilitaires pour UI rapide
- **Pas de backend** : 100% client-side pour le MVP

---

## Pour Débutants : Comment Naviguer le Code

### 1. Commencer par les types (src/domain/types.ts)
Comprendre les entités = comprendre l'application.

### 2. Voir la base de données (src/storage/db.ts)
13 tables Dexie (wrapper IndexedDB).

### 3. Explorer les repos (src/storage/repos/)
CRUD simple pour chaque entité.

### 4. Logique métier (src/domain/progress.ts)
Calculs de progression = cœur de l'app.

### 5. Pages (src/pages/)
Interface utilisateur React.

### 6. Routing (src/routes/index.tsx)
Navigation entre les pages.

### 7. Tests (src/__tests__/)
Exemples d'utilisation des fonctions.

---

Fin du document. Mise à jour au fur et à mesure.
