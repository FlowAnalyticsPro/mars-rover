# Plan de réalisation : Simulateur Mars Rover

## Contexte

La spec [intent/mars-rover/spec.md](spec.md) est acceptée (EX-01 à EX-16, toutes réserves et questions ouvertes résolues). Le CLAUDE.md du repo indique que la phase Build n'a pas commencé et qu'aucune techno n'a encore été choisie. La branche `phase-build` (déjà créée depuis `main`) est l'endroit où ce travail doit se dérouler, conformément à la règle « jamais sur `main` ».

Décision prise avec l'utilisateur : le simulateur sera écrit en **Node.js / TypeScript**, testé avec **Vitest**. Aucune techno n'existait avant cet échange ; ce choix est donc explicitement validé, pas inventé.

Objectif de ce document : ne pas encore écrire le code du simulateur, seulement produire ce plan. L'implémentation elle-même est une étape ultérieure, séparée.

## Étape 0 — Enregistrer et commiter le plan

1. Écrire le contenu de ce plan dans `intent/mars-rover/plan.md`.
2. `git add intent/mars-rover/plan.md` (uniquement ce fichier).
3. Commiter avec un message expliquant l'ajout du plan de réalisation, sur la branche `phase-build`.
4. Ne pas pousser (`push`) ni ouvrir de pull request à ce stade — action distincte nécessitant une confirmation explicite ultérieure, conformément au CLAUDE.md.

## Fichiers à créer (implémentation, étapes suivantes)

Structure proposée, sous la racine du repo :

- `package.json`, `tsconfig.json`, `.gitignore` (`node_modules`, `dist`) — configuration du projet Node/TS, scripts `build`, `test`, `start`.
- `src/types.ts` — types du domaine : `Orientation` (`"N"|"S"|"E"|"W"`), `Command` (`"F"|"L"|"R"`), `Position`, `Cell`, `SimulationInput`, `SimulationResult`, `Blockage`, `BlockageCause` (`"obstacle"|"edge"`).
- `src/map.ts` — classification des cases (🟩/🟫 libres, 🌳/🪨 obstacles), calcul des limites à partir de `map.length`/longueur des lignes, vérification qu'une position est dans la carte.
- `src/rover.ts` — état du rover (position, orientation) ; rotation gauche/droite selon l'ordre N→W→S→E→N (EX-05) et son inverse (EX-06) ; calcul de la case visée par `F` selon l'orientation (EX-02, EX-04).
- `src/inputValidation.ts` — validation complète avant exécution : fichier lisible et JSON valide, champs `map`/`start`/`orientation`/`commands` présents (EX-16), commandes toutes valides (EX-11), `start` dans la carte (EX-12) et pas sur un obstacle (EX-13).
- `src/errors.ts` — type d'erreur unique porté jusqu'à la sortie `{"error": "..."}` (EX-11, EX-12, EX-13, EX-16).
- `src/simulator.ts` — orchestration : valide l'entrée, exécute les commandes une à une, enregistre les blocages (cause, commande, position visée même hors limites — EX-08), construit le résultat final (`position`, `orientation`, `blockages`) (EX-01, EX-09, EX-10, EX-15).
- `src/cli.ts` — point d'entrée ligne de commande : lit le chemin du fichier en argument, appelle le simulateur, écrit le JSON résultat ou `{"error": ...}` sur stdout, code de retour non nul en cas d'erreur (EX-14).
- `test/fixtures/*.json` — cartes de test : cas nominal sans blocage, blocage obstacle, blocage bord, commande inconnue, départ hors carte, départ sur obstacle, fichier JSON malformé/incomplet, l'exemple complet donné dans la spec (EX-10).
- `src/**/*.test.ts` (ou dossier `test/` miroir) — un fichier de test par module, plus un test d'intégration bout en bout du CLI.
- `README.md` — usage du CLI pour l'équipe (commande, format d'entrée/sortie), utile car l'intention cible explicitement l'équipe comme utilisatrice.

Aucun fichier existant à modifier : le repo ne contient encore aucun code (seuls `CLAUDE.md`, `intent/mars-rover/*.md` et `.claude/skills/*`).

## Ordre de travail (implémentation)

1. Initialiser le projet Node/TS (`package.json`, `tsconfig.json`, Vitest, scripts).
2. `map.ts` : classification des cases et limites (EX-03) + tests.
3. `rover.ts` : rotations L/R (EX-05, EX-06) + tests, puis calcul de la case visée par `F` selon orientation et repère (EX-02, EX-04) + tests.
4. Intégrer blocages dans le déplacement : obstacle vs bord, position réellement visée, poursuite de l'exécution (EX-07, EX-08) + tests.
5. `inputValidation.ts` : validation intégrale avant toute exécution — fichier/JSON invalide (EX-16), commande inconnue (EX-11), départ hors carte (EX-12), départ sur obstacle (EX-13) + tests, y compris la garantie « aucun résultat partiel ».
6. `simulator.ts` : orchestration complète, construction de la sortie (`position`, `orientation`, `blockages`, y compris liste vide) (EX-01, EX-09, EX-10, EX-15) + tests, avec le scénario A (aucun blocage) et B (au moins un blocage) d'EX-10, et l'exemple complet de la spec en test de non-régression.
7. `cli.ts` : lecture d'argument, écriture stdout, codes de retour (EX-14) + tests bout en bout sur les fixtures (succès et les 4 cas d'erreur), vérifiant la forme unique `{"error": "..."}` et le code non nul.
8. `README.md` : instructions d'usage.
9. Vérification finale : `npm run build` (compilation TS sans erreur) et `npm test` (suite complète verte).

## Tests prévus

- **Unitaires `map.ts`** : 🟩/🟫 libres, 🌳/🪨 obstacles, mélange des styles sur une même carte, limites déduites de `map.length`/longueur de ligne.
- **Unitaires `rover.ts`** : table de rotation L (N→W→S→E→N) et R (inverse), position inchangée lors d'une rotation, case visée correcte par orientation pour `F`.
- **Unitaires déplacement/blocage** : `F` réussi si case libre et dans la carte ; `F` bloqué par obstacle → cause `"obstacle"`, position inchangée, position visée rapportée ; `F` bloqué en bord → cause `"edge"`, coordonnée visée même négative/hors limites ; poursuite des commandes suivantes après un blocage.
- **Unitaires `inputValidation.ts`** : commande inconnue n'importe où dans la liste → erreur, aucune exécution ; `start` hors carte → erreur ; `start` sur obstacle → erreur ; fichier absent, JSON invalide, champ manquant → erreur ; forme d'erreur uniforme `{"error": "..."}`.
- **Intégration `simulator.ts`** : scénario complet sans blocage (`blockages: []`), scénario avec plusieurs blocages mêlant obstacle et bord avec numéros de commande corrects (indexés à partir de 0), reproduction exacte de l'exemple de sortie de la spec (EX-10) comme test de non-régression.
- **Bout en bout `cli.ts`** : exécution du CLI sur chaque fixture ; vérifie le JSON sur stdout et le code de retour (0 en succès, non nul pour les 4 cas d'erreur), sans dépendre de l'ordre d'exécution entre tests.

## Vérification

- `npm run build` compile sans erreur TypeScript.
- `npm test` (Vitest) passe entièrement, y compris les tests bout en bout du CLI.
- Exécution manuelle du CLI sur l'exemple complet de la spec (EX-10) pour confirmer visuellement la sortie attendue.

## Contexte de génération

Document produit en discussion avec Couthaïer FARFRA (cfarfra@agile4me.com), à partir de [intent/mars-rover/intent.md](intent.md) et [intent/mars-rover/spec.md](spec.md), sur la branche `phase-build`.
