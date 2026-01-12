# Dev Organizer 🚀

**Offline-first PWA for Developer Organization and Project Tracking**

Une application web progressive (PWA) pour gérer vos projets de développement, suivre l'avancement via des jalons pondérés, organiser vos fichiers, notes et snippets, le tout **100% offline**.

---

## ✨ Fonctionnalités

### ✅ IMPLÉMENTÉ (ÉTAPE 1-5 - 100% complète)

#### ÉTAPE 1 : Bootstrap (100% ✅)
- **Configuration Complète** : React 19 + TypeScript + Vite 7 + Tailwind CSS 4
- **Routing** : React Router 7 avec 8 routes configurées
- **Base de Données** : Dexie (IndexedDB) avec 13 tables
- **PWA** : Service Worker + Manifest (installable, offline)
- **Tests** : Vitest + happy-dom configuré
- **Architecture** : Layout, pages, composants structurés

#### ÉTAPE 2 : Projets + Jalons + Tâches (100% ✅)

**Fonctionnalités Opérationnelles** :

1. **Gestion de Projets**
   - ✅ Créer via Wizard (2 étapes : Infos + Jalons/Tâches)
   - ✅ Lister avec filtres (ALL / ACTIVE / ARCHIVED)
   - ✅ Archive/Unarchive projets
   - ✅ Cartes projets avec infos complètes (name, description, objectives, tags, dates, priority)

2. **Jalons Pondérés**
   - ✅ Créer jalons avec poids (≥ 1)
   - ✅ Milestone "GENERAL" créé automatiquement (weight=10)
   - ✅ Calcul progression par jalon (basé sur points tâches)
   - ✅ Affichage avec barres de progression

3. **Tâches avec Points**
   - ✅ Créer tâches avec points
   - ✅ Assigner à un jalon
   - ✅ Status : TODO / DOING / DONE / BLOCKED
   - ✅ Raison blocage (blockedReason) si BLOCKED
   - ✅ Vue Kanban (4 colonnes : TODO | DOING | DONE | BLOCKED)
   - ✅ Vue Liste (table complète avec filtres)
   - ✅ Changement de status avec boutons
   - ✅ Suppression de tâches

4. **Calcul de Progression Intelligent**
   - ✅ Progression globale projet (pondérée par jalons)
   - ✅ Progression par jalon (basée sur points tâches DONE)
   - ✅ Santé projet (ON_TRACK / AT_RISK / LATE)
   - ✅ 12 tests unitaires validés ✅

5. **Dashboard Projet Complet**
   - ✅ 3 cartes indicateurs (%, tâches done/total, prochain jalon)
   - ✅ Alerte blocages en temps réel (section rouge)
   - ✅ Liste jalons avec progression + barres
   - ✅ Top 5 tâches à faire (triées par due date)
   - ✅ Activité récente (10 derniers événements)
   - ✅ Quick Actions (placeholders)

6. **Dashboard Global**
   - ✅ 4 cartes stats (Projets actifs, Tâches totales, Taux complétion, Blocages)
   - ✅ Liste projets actifs avec indicateurs et health badges
   - ✅ Tâches dues aujourd'hui (tous projets)
   - ✅ Blocages globaux (jalons + tâches)
   - ✅ Activité récente globale (20 derniers événements)

7. **Stockage & Tests**
   - ✅ 4 Repositories CRUD (projects, milestones, tasks, activityEvents)
   - ✅ IndexedDB (Dexie) avec 13 tables
   - ✅ 12 tests unitaires (100% pass)

#### ÉTAPE 3 : Documents (100% ✅)

**Fonctionnalités Opérationnelles** :

1. **Gestion de Documents**
   - ✅ Upload fichiers avec détection automatique du mode de stockage
   - ✅ Mode Embedded (< 20MB) : stockage dans IndexedDB
   - ✅ Mode Workspace (≥ 20MB) : stockage via File System Access API
   - ✅ Tags personnalisés par document
   - ✅ Liaison optionnelle à un projet

2. **File System Access API**
   - ✅ Demande de permissions workspace
   - ✅ Stockage persistant de gros fichiers (> 20MB)
   - ✅ Lecture/écriture depuis répertoire local
   - ✅ Indicateur de statut de liaison workspace

3. **Bibliothèque de Documents**
   - ✅ Liste complète avec table détaillée
   - ✅ Filtres : par projet (ALL/GLOBAL/PROJECT), par mode de stockage, recherche
   - ✅ Badges colorés (EMBEDDED vert / WORKSPACE violet)
   - ✅ Statistiques : nombre de docs et taille par mode
   - ✅ Téléchargement de documents
   - ✅ Suppression avec nettoyage du stockage

4. **Repositories**
   - ✅ documentRepo : CRUD complet + recherche
   - ✅ embeddedFileRepo : gestion Blobs IndexedDB
   - ✅ fileStore : abstraction dual-mode (Embedded + Workspace)

#### ÉTAPE 4 : Notes + Snippets (100% ✅)

**Fonctionnalités Opérationnelles** :

1. **Notes Markdown**
   - ✅ Création/édition notes avec contenu Markdown
   - ✅ Tags personnalisés
   - ✅ Liaison optionnelle à un projet
   - ✅ Recherche full-text (titre, contenu, tags)
   - ✅ Vue cartes avec preview contenu

2. **Snippets de Code**
   - ✅ Création/édition snippets avec code
   - ✅ 14 langages supportés (JavaScript, TypeScript, Python, Java, Go, Rust, SQL, Bash, HTML, CSS, JSON, YAML, Markdown, Other)
   - ✅ Tags personnalisés
   - ✅ Liaison optionnelle à un projet
   - ✅ Recherche full-text (titre, code, tags, language)
   - ✅ Vue cartes avec syntax highlighting basique

3. **Interface Unifiée**
   - ✅ Onglets Notes / Snippets avec compteurs
   - ✅ Filtres par projet (ALL/GLOBAL/PROJECT)
   - ✅ Barre de recherche globale
   - ✅ Modals création/édition
   - ✅ Suppression avec confirmation

4. **Repositories**
   - ✅ noteRepo : CRUD + recherche full-text
   - ✅ snippetRepo : CRUD + recherche full-text + filter by language

#### ÉTAPE 5 : Calendrier + Rapports (100% ✅)

**Fonctionnalités Opérationnelles** :

1. **Calendrier & Timeline**
   - ✅ Génération automatique d'événements depuis projets, jalons et tâches
   - ✅ Vue Timeline : liste chronologique de tous les événements
   - ✅ Vue Calendrier : grille mensuelle avec navigation mois précédent/suivant
   - ✅ Color coding : bleu (projet), vert (done), rouge (blocked), orange (milestone), gris (todo)
   - ✅ Affichage événements dans cellules de jour (max 3 + compteur)

2. **Rapports Hebdomadaires**
   - ✅ Génération automatique de rapports hebdomadaires au format Markdown
   - ✅ Calcul automatique de la semaine courante (lundi-dimanche)
   - ✅ Delta de progression par rapport au rapport précédent
   - ✅ Sections : Stats, Jalons complétés, Tâches complétées, Nouvelles tâches, Blocages, Prochains jalons
   - ✅ Liste de tous les rapports avec tri par date
   - ✅ Preview panel pour visualiser le contenu Markdown
   - ✅ Téléchargement des rapports au format .md
   - ✅ Suppression de rapports avec confirmation

3. **Navigation**
   - ✅ Liens depuis ProjectDetailPage vers Calendar et Weekly Reports
   - ✅ Routes : /projects/:projectId/calendar et /projects/:projectId/reports

4. **Logic & Repositories**
   - ✅ calendar.ts : génération et regroupement d'événements
   - ✅ reports.ts : génération rapports avec calcul delta
   - ✅ weeklyReportRepo : CRUD pour rapports hebdomadaires

#### ÉTAPE 6 : Documentation + Backup + Polish (100% ✅)

**Fonctionnalités Opérationnelles** :

1. **Génération de Documentation**
   - ✅ 6 templates Mustache (README, SPEC, ARCHITECTURE, RUNBOOK, CHANGELOG, ADR)
   - ✅ Génération automatique avec données complètes du projet
   - ✅ Preview avant téléchargement
   - ✅ Téléchargement au format Markdown (.md)
   - ✅ Copie dans le presse-papier

2. **Backup & Restore**
   - ✅ Export projet complet en ZIP (métadonnées + fichiers embarqués)
   - ✅ Import depuis ZIP avec validation
   - ✅ Backup inclut : projets, jalons, tâches, notes, snippets, documents, rapports
   - ✅ README.txt inclus dans le backup
   - ✅ Support exportation complète de toutes les données

3. **Stockage Persistant**
   - ✅ Détection support navigateur
   - ✅ Vérification statut stockage persistant
   - ✅ Bouton activation stockage persistant
   - ✅ Statistiques d'utilisation (MB utilisés / quota)
   - ✅ Barre de progression visuelle

4. **Logic & Utilities**
   - ✅ docgen.ts : génération documents avec Mustache
   - ✅ backup.ts : export/import ZIP avec JSZip
   - ✅ storage.ts : gestion stockage persistant

---

## 🎉 Projet Complet - MVP 100% Fonctionnel

Toutes les 6 étapes sont terminées ! L'application est prête pour une utilisation en production.

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** 18+ (recommandé : 20+)
- **pnpm** (gestionnaire de paquets)

### Installation

```bash
# Cloner le repo
git clone <url-du-repo>
cd dev-organizer

# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm dev

# Ouvrir http://localhost:5173
```

### Commandes Disponibles

```bash
# Développement
pnpm dev              # Serveur dev avec HMR
pnpm build            # Build production
pnpm preview          # Preview du build

# Tests
pnpm test             # Tests unitaires (Vitest)
pnpm test:ui          # Tests avec interface UI
pnpm test:coverage    # Tests + rapport coverage

# Code Quality
pnpm lint             # Linter ESLint
```

---

## 📂 Structure du Projet

```
dev-organizer/
├── src/
│   ├── components/       # Composants React
│   │   ├── layout/      # Header, Footer, Layout
│   │   ├── projects/    # Composants projets
│   │   ├── tasks/       # Composants tâches
│   │   └── common/      # Composants réutilisables
│   │
│   ├── pages/           # Pages (routes)
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsListPage.tsx        ✅ Complet
│   │   ├── ProjectWizardPage.tsx       ✅ Complet
│   │   ├── ProjectDetailPage.tsx       ✅ Complet
│   │   ├── MilestonesTasksPage.tsx     🚧 En cours
│   │   └── ...
│   │
│   ├── domain/          # Logique métier pure
│   │   ├── types.ts     # 13 entités TypeScript  ✅
│   │   └── progress.ts  # Calculs progression     ✅
│   │
│   ├── storage/         # Couche persistance
│   │   ├── db.ts        # Config Dexie (13 tables) ✅
│   │   └── repos/       # Repositories CRUD        ✅
│   │
│   ├── services/        # Services métier
│   │   ├── fileStore/   # Gestion fichiers        📋
│   │   ├── docgen/      # Génération docs          📋
│   │   ├── reports/     # Rapports hebdo           📋
│   │   └── backup/      # Export/Import ZIP        📋
│   │
│   ├── routes/          # React Router config      ✅
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilitaires              ✅
│   └── __tests__/       # Tests unitaires          ✅
│
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # Architecture détaillée   ✅
│   └── ...
│
├── PROGRESS.md          # Suivi avancement         ✅
├── vite.config.ts       # Config Vite + PWA        ✅
├── vitest.config.ts     # Config tests             ✅
├── tailwind.config.js   # Config Tailwind CSS      ✅
└── package.json         # Dépendances              ✅
```

**Légende** : ✅ Complet | 🚧 En cours | 📋 À faire

---

## 🛠️ Stack Technique

### Core

- **React 19** : UI library
- **TypeScript** : Type safety (strict mode)
- **Vite 7** : Build tool + dev server (rapide ⚡)
- **React Router 7** : Routing SPA

### State & Data

- **Zustand** : State management (prévu, pas encore utilisé)
- **Dexie** : Wrapper IndexedDB (13 tables)
- **date-fns** : Manipulation dates

### UI

- **Tailwind CSS 4** : Utility-first CSS
- **PostCSS** : CSS processing

### Services

- **JSZip** : Export/Import ZIP
- **Mustache** : Templates docs/rapports

### PWA

- **vite-plugin-pwa** : Service Worker + Manifest
- **Workbox** : Cache stratégies

### Tests

- **Vitest** : Test runner (compatible Vite)
- **happy-dom** : DOM pour tests
- **@vitest/ui** : Interface graphique tests

---

## 📊 Modèle de Données

### Entités Principales (13 tables IndexedDB)

1. **Project** : Projets (name, description, priority, objectives, dates)
2. **Milestone** : Jalons (title, weight, status, dueDate)
3. **Task** : Tâches (title, points, status, milestoneId, blockedReason)
4. **ProjectUpdate** : Journal projet (done[], next[], blockers[])
5. **Decision** : ADR light (title, context, decision, consequences)
6. **Note** : Notes Markdown (title, contentMd, tags)
7. **Snippet** : Snippets code (title, language, code, tags)
8. **DocumentMeta** : Métadonnées fichiers (storageMode, embeddedKey/workspaceFileName)
9. **EmbeddedFile** : Fichiers < 20MB (blob, checksum)
10. **Settings** : Paramètres singleton (embedLimitMb, workspaceLinked, schemaVersion)
11. **ActivityEvent** : Événements activité (type, payload) pour rapports
12. **WeeklyReport** : Rapports hebdo (progressStart/End, delta, markdownContent)
13. **ProgressSnapshot** : Snapshots progression (date, progressPercent)

---

## 🧮 Règles Métier

### Calcul de Progression

**Progression d'un jalon** :
```
si milestone.status == DONE
  => 100%
sinon
  => (somme points tâches DONE) / (somme points totaux) * 100
```

**Progression d'un projet** (pondérée) :
```
progress = Σ(milestone.weight × milestone_progress) / Σ(milestone.weight)
arrondi à l'entier
```

**Santé d'un projet** :
- **AT_RISK** : si bloqueurs > 0 (tâches ou jalons BLOCKED)
- **LATE** : si targetDate dépassée ET progress < 100%
- **ON_TRACK** : sinon

### Règles de Création

- Tout projet a un jalon "GENERAL" (weight=10) par défaut
- Tâches sans milestone → assignées automatiquement à "GENERAL"
- Tâches BLOCKED → blockedReason obligatoire (string)
- Jalons ont un poids obligatoire (≥ 1)

---

## 🧪 Tests

### Tests Unitaires (12 tests)

Fichier : [src/__tests__/progress.test.ts](src/__tests__/progress.test.ts)

**Tests couverts** :
- Progression jalon : status DONE, no tasks, task points, zero points
- Progression projet : no milestones, weighted calculation
- Santé projet : AT_RISK, LATE, ON_TRACK, completed
- Stats complètes : tasks done, points done, health

**Lancer les tests** :
```bash
pnpm test           # Mode watch
pnpm test -- --run  # Une fois
pnpm test:ui        # Interface UI
```

**Résultat actuel** : ✅ 12/12 tests passent

---

## 🌐 PWA (Progressive Web App)

### Installation

**Chrome Desktop** :
1. Ouvrir l'app (http://localhost:5173 ou déployée)
2. Cliquer sur l'icône "Installer" (barre d'adresse)
3. L'app s'ouvre comme une app native

**Chrome Mobile** :
1. Ouvrir l'app
2. Menu → "Ajouter à l'écran d'accueil"
3. L'app apparaît sur l'écran d'accueil

### Offline

- **Service Worker** cache tous les assets (HTML, JS, CSS, images)
- **IndexedDB** stocke toutes les données
- **Fonctionne 100% offline** après première visite

---

## 📖 Documentation

- [PROGRESS.md](PROGRESS.md) : Avancement détaillé des 6 étapes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : Architecture complète

---

## 🎯 Workflow Utilisateur

### Créer un Projet (2 minutes)

1. **Dashboard** → "Projects" → "+ New Project"
2. **Step 1** : Remplir nom, description, objectifs, priorité, dates
3. **Step 2** : Créer 3-6 jalons (titre, poids, dueDate)
4. **Step 2** : Créer 5+ tâches (titre, milestone, points)
5. Click "Create Project" → Redirigé vers Project Dashboard

### Suivre l'Avancement

1. **Project Dashboard** affiche :
   - % progression global (barre)
   - Tâches terminées / total
   - Prochain jalon avec date
   - ⚠️ Blocages (si tâches/jalons BLOCKED)
   - Liste jalons avec progression individuelle
   - Top 5 tâches à faire (triées par due date)
   - Activité récente (7 derniers jours)

2. **View Tasks** → Vue liste ou Kanban
   - Changer status (TODO → DOING → DONE)
   - Bloquer tâche (avec raison)
   - Filtres : milestone, status, due date

3. **Calendar** → Timeline + Calendrier mensuel
   - Voir jalons et tâches sur timeline
   - Vue calendrier avec événements par jour

4. **Docs & Reports** → Générer documentation + rapports
   - Générer docs Markdown (README, SPEC, etc.)
   - Générer rapport hebdo (delta progression)
   - Export backup ZIP

---

## 🚢 Déploiement

### Build Production

```bash
pnpm build
# Génère dist/ avec assets optimisés
```

### Déployer

**Vercel** (recommandé) :
```bash
vercel deploy
```

**Netlify** :
```bash
netlify deploy --prod
```

**GitHub Pages** :
```bash
pnpm build
# Déployer dist/ sur gh-pages branch
```

**Self-hosted** (Nginx) :
```bash
# Copier dist/ sur serveur
# Nginx config : serve dist/ en static
```

---

## 🤝 Contribuer

### Workflow

1. Fork le repo
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines

- **TypeScript strict** : Pas de `any`
- **Tests** : Ajouter tests pour nouvelle logique métier
- **Commits** : Messages clairs et concis
- **Code style** : Suivre ESLint config

---

## 📝 Licence

MIT License - Voir [LICENSE](LICENSE) pour détails.

---

## 🙏 Remerciements

- **React Team** : React 19
- **Vite Team** : Build tool ultra-rapide
- **Dexie** : Excellent wrapper IndexedDB
- **Tailwind CSS** : Utility-first CSS
- **Vitest** : Test runner moderne

---

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/user/dev-organizer/issues)
- **Docs** : Voir [docs/](docs/) pour architecture détaillée
- **Progress** : Voir [PROGRESS.md](PROGRESS.md) pour avancement

---

## 🗺️ Roadmap

- [x] **ÉTAPE 1** : Bootstrap (Vite, Router, DB, PWA, Layout)
- [🚧] **ÉTAPE 2** : Projets + Jalons + Tâches (CRUD, Wizard, Dashboard, Progress)
- [ ] **ÉTAPE 3** : Documents (Embedded + Workspace FileStore)
- [ ] **ÉTAPE 4** : Notes + Snippets + Search
- [ ] **ÉTAPE 5** : Calendrier/Timeline + Rapports Hebdo
- [ ] **ÉTAPE 6** : DocGen + Backup Export/Import + Polish offline

**MVP Target** : Fin ÉTAPE 6 = Application complète et utilisable offline !

---

Développé avec ❤️ pour les développeurs qui veulent rester organisés.
