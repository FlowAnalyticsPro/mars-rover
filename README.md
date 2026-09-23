# Simulateur Mars Rover

Simulateur en ligne de commande qui rejoue le déplacement d'un rover sur une
carte, à partir d'un fichier JSON, sans jamais piloter de rover réel. Voir
[intent/mars-rover/spec.md](intent/mars-rover/spec.md) pour la spécification
complète (exigences EX-01 à EX-16).

## Prérequis

- Node.js 20+

## Installation

```bash
npm install
```

## Usage

```bash
npm run build
node dist/cli.js chemin/vers/entree.json
```

ou directement en TypeScript, sans étape de build :

```bash
node --import tsx/esm src/cli.ts chemin/vers/entree.json
```

Le résultat est écrit sur la sortie standard, sous forme de JSON.

### Format d'entrée

```json
{
  "map": [["🟩", "🌳", "🟩"], ["🟩", "🟩", "🪨"]],
  "start": {"x": 0, "y": 0},
  "orientation": "N",
  "commands": ["F", "L", "F", "R"]
}
```

- `map` : tableau de lignes, chaque ligne un tableau de cases (🟩/🟫 libres,
  🌳/🪨 obstacles).
- `start` : position de départ `{x, y}`, origine en haut à gauche, x vers la
  droite, y vers le bas.
- `orientation` : `"N"`, `"S"`, `"E"` ou `"W"`.
- `commands` : suite de `"F"` (avancer), `"L"` (tourner à gauche), `"R"`
  (tourner à droite).

### Format de sortie (succès)

```json
{
  "position": {"x": 2, "y": 1},
  "orientation": "E",
  "blockages": [
    {"command": 2, "position": {"x": 3, "y": 1}, "cause": "obstacle"},
    {"command": 5, "position": {"x": 2, "y": -1}, "cause": "edge"}
  ]
}
```

### Format de sortie (erreur)

En cas de commande inconnue, de départ hors carte, de départ sur un
obstacle, ou de fichier d'entrée absent/invalide, le simulateur écrit
`{"error": "..."}` sur la sortie standard et se termine avec un code de
retour non nul, sans exécuter aucune commande.

## Tests

```bash
make test
```

## Démonstration

```bash
make run
```

Rejoue un scénario de démonstration (créé automatiquement dans
`examples/demo.json` s'il n'existe pas) et affiche la position et
l'orientation finales du rover.
