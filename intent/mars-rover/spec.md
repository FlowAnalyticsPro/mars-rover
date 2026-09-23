# Spec : Simulateur Mars Rover

Intention de référence : [intent/mars-rover/intent.md](intent/mars-rover/intent.md)

## Périmètre

Le simulateur exécute, sur une carte donnée, une suite de commandes de déplacement pour un rover unique, à partir d'une position et d'une orientation de départ. Il rend compte de la position finale, de l'orientation finale et des blocages rencontrés en cours de route. L'entrée et la sortie se font via un fichier JSON et la ligne de commande. Le simulateur ne gère qu'un seul rover à la fois ; il n'exécute rien en conditions réelles et ne pilote pas physiquement le rover.

## Exigences

### EX-01 — Lecture de l'entrée JSON

Origine dans l'intention : « Entrée. Le simulateur reçoit en argument de la ligne de commande un fichier JSON qui contient : la carte ; la position de départ (x, y) ; l'orientation, parmi N, S, E ou W ; la suite de commandes. »
Comportement attendu : le simulateur lit, depuis le fichier JSON passé en argument, la carte (`map`), la position de départ (`start`), l'orientation de départ (`orientation`) et la liste de commandes (`commands`).

Structure du JSON d'entrée (décision du Product Owner du 2026-09-23) :
```json
{
  "map": [["🟩", "🌳", "🟩"], ["🟩", "🟩", "🪨"]],
  "start": {"x": 0, "y": 0},
  "orientation": "N",
  "commands": ["F", "L", "F", "R"]
}
```
- `map` : tableau de tableaux de symboles — une ligne de la carte est un tableau de cases, chaque case un symbole (🟩, 🟫, 🌳 ou 🪨). Les dimensions de la carte sont déduites du nombre de lignes (`map.length`) et du nombre de colonnes de chaque ligne.
- `start` : objet `{x, y}` dans le repère défini en EX-02.
- `orientation` : une des chaînes `"N"`, `"S"`, `"E"`, `"W"`.
- `commands` : tableau de chaînes, chacune `"F"`, `"L"` ou `"R"`.

Scénario
- Situation de départ : un fichier JSON valide, conforme à la structure ci-dessus, est passé en argument.
- Action : lancement du simulateur avec ce fichier.
- Résultat attendu : le simulateur charge `map`, `start`, `orientation` et `commands` avant d'exécuter la moindre commande.

### EX-02 — Repère de coordonnées

Origine dans l'intention : « Repère. L'origine (0, 0) est en haut à gauche de la carte. x augmente vers la droite et y vers le bas. N correspond au haut de la carte : avancer vers le nord fait diminuer y. »
Comportement attendu : les positions sont exprimées dans un repère dont l'origine (0,0) est en haut à gauche, x croît vers la droite et y vers le bas.

Scénario
- Situation de départ : rover en position (x, y), orienté N.
- Action : exécution de la commande F, case (x, y-1) libre et dans la carte.
- Résultat attendu : le rover se retrouve en (x, y-1).

### EX-03 — Classification des cases de la carte

Origine dans l'intention : « Carte. 🟩 et 🟫 sont des cases libres. 🌳 et 🪨 sont des obstacles. Une même carte peut mélanger les deux styles. »
Comportement attendu : les cases 🟩 et 🟫 sont libres, les cases 🌳 et 🪨 sont des obstacles, y compris lorsque les deux styles coexistent sur la même carte.

Scénario
- Situation de départ : une carte contient à la fois des cases 🟩, 🟫, 🌳 et 🪨.
- Action : chargement de la carte par le simulateur.
- Résultat attendu : chaque case 🟩 ou 🟫 est traitée comme libre, chaque case 🌳 ou 🪨 comme un obstacle.

### EX-04 — Commande F (avancer)

Origine dans l'intention : « Commandes. F fait avancer le rover d'une case. »
Comportement attendu : F déplace le rover d'une case dans la direction de son orientation courante, si cette case est libre et dans les limites de la carte.

Scénario
- Situation de départ : rover en (2,2) orienté E ; la case (3,2) est libre et dans la carte.
- Action : exécution de F.
- Résultat attendu : le rover se retrouve en (3,2), orientation inchangée.

### EX-05 — Commande L (rotation à gauche)

Origine dans l'intention : « Commandes. L le fait tourner de 90 degrés à gauche. »
Comportement attendu : L fait tourner le rover de 90° à gauche sans changer sa position. Compte tenu du repère accepté en EX-02 (N en haut, x à droite, y vers le bas), la rotation à gauche suit l'ordre N → W → S → E → N.

Scénario
- Situation de départ : rover orienté N, position quelconque.
- Action : exécution de L.
- Résultat attendu : le rover est orienté W, sa position est inchangée.

### EX-06 — Commande R (rotation à droite)

Origine dans l'intention : « Commandes. R le fait tourner de 90 degrés à droite. »
Comportement attendu : R fait tourner le rover de 90° à droite sans changer sa position, selon l'ordre N → E → S → W → N (symétrique de EX-05).

Scénario
- Situation de départ : rover orienté N, position quelconque.
- Action : exécution de R.
- Résultat attendu : le rover est orienté E, sa position est inchangée.

### EX-07 — Blocage par obstacle

Origine dans l'intention : « Blocage. Si un obstacle bloque F, le rover reste sur place, le simulateur signale un blocage de cause « obstacle », puis le rover exécute les commandes suivantes. »
Comportement attendu : quand F viserait une case occupée par un obstacle, le rover reste sur place, un blocage de cause `"obstacle"` est enregistré, puis l'exécution se poursuit avec les commandes suivantes.

Scénario
- Situation de départ : rover en (2,2) orienté E ; la case (3,2) est un obstacle (🌳 ou 🪨) ; d'autres commandes suivent dans la liste.
- Action : exécution de F puis des commandes suivantes.
- Résultat attendu : le rover reste en (2,2) ; un blocage `{"command": <numéro>, "position": {"x": 3, "y": 2}, "cause": "obstacle"}` est enregistré ; les commandes suivantes s'exécutent normalement.

### EX-08 — Blocage par bord de carte

Origine dans l'intention : « Blocage. Si F ferait sortir le rover de la carte, il reste sur place, le simulateur signale un blocage de cause « bord », distincte d'un obstacle, puis le rover exécute les commandes suivantes. La carte ne boucle pas. »
Comportement attendu : quand F ferait sortir le rover des limites de la carte, le rover reste sur place, un blocage de cause `"edge"` (distincte d'`"obstacle"`) est enregistré, puis l'exécution se poursuit. La carte ne boucle pas d'un bord à l'autre.

La position visée rapportée dans le blocage est la coordonnée réellement tentée, même négative ou hors limites (décision du Product Owner du 2026-09-23).

Scénario
- Situation de départ : rover en (0,0) orienté N (bord haut de la carte).
- Action : exécution de F.
- Résultat attendu : le rover reste en (0,0) ; le blocage enregistré est `{"command": <numéro>, "position": {"x": 0, "y": -1}, "cause": "edge"}` ; les commandes suivantes s'exécutent normalement.

### EX-09 — Sortie JSON : position et orientation finales

Origine dans l'intention : « Sortie. Le simulateur produit un résultat JSON qui contient : la position finale ; l'orientation finale... »
Comportement attendu : à l'issue de l'exécution de toutes les commandes, le simulateur produit sur la sortie standard un JSON contenant la position finale (`position`) et l'orientation finale (`orientation`) du rover.

Scénario
- Situation de départ : la liste de commandes a été exécutée en entier, sans erreur au sens d'EX-11 à EX-16.
- Action : fin de l'exécution.
- Résultat attendu : le JSON produit contient `"position": {"x": ..., "y": ...}` et `"orientation": "N"|"S"|"E"|"W"`.

### EX-10 — Sortie JSON : liste des blocages

Origine dans l'intention : « Sortie. ... la liste des blocages. Chaque blocage indique le numéro de la commande, la position visée et la cause (obstacle ou bord). La liste est vide si aucun mouvement n'a été bloqué. »
Comportement attendu : le JSON de sortie contient un tableau `blockages` ; chaque entrée précise le numéro de la commande (`command`, indexé à partir de 0 — décision du Product Owner du 2026-09-23), la position visée (`position`) et la cause (`"obstacle"` ou `"edge"`) ; le tableau est vide si aucun blocage n'a eu lieu.

Exemple de sortie complète :
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

Scénario A — aucun blocage
- Situation de départ : aucune commande F n'a été bloquée pendant l'exécution.
- Action : fin de l'exécution.
- Résultat attendu : `"blockages": []` dans le JSON de sortie.

Scénario B — au moins un blocage
- Situation de départ : au moins un blocage (obstacle ou bord) a eu lieu pendant l'exécution ; par exemple la 3ᵉ commande de la liste (indice 2).
- Action : fin de l'exécution.
- Résultat attendu : `blockages` contient une entrée `{"command": 2, "position": {...}, "cause": "obstacle"|"edge"}`.

### EX-11 — Erreur : commande inconnue

Origine dans l'intention : « Erreurs. Le simulateur produit une erreur explicite dans trois cas : une commande inconnue... »
Comportement attendu : le simulateur valide l'intégralité de la liste `commands` avant de démarrer l'exécution (décision du Product Owner du 2026-09-23 sur la réserve R-01). Si un élément de `commands` n'est ni `"F"`, ni `"L"`, ni `"R"`, aucune commande n'est exécutée : le simulateur produit une erreur explicite, sans résultat partiel de position, orientation ou blocages.

La forme de l'erreur (décision du Product Owner du 2026-09-23, réserve QO-03) : un objet JSON `{"error": "..."}` est écrit sur la sortie standard et le code de retour du processus est non nul. Cette forme s'applique aux quatre cas d'erreur (EX-11, EX-12, EX-13, EX-16).

Scénario
- Situation de départ : la liste `commands` contient un symbole autre que `"F"`, `"L"` ou `"R"`.
- Action : lancement du simulateur.
- Résultat attendu : le simulateur n'exécute aucune commande, écrit `{"error": "..."}` sur la sortie standard et se termine avec un code de retour non nul.

### EX-12 — Erreur : départ hors de la carte

Origine dans l'intention : « Erreurs. ... un départ hors de la carte... »
Comportement attendu : si `start` est en dehors des limites de la carte, le simulateur produit une erreur explicite avant toute exécution de commande, sous la forme décrite en EX-11.

Scénario
- Situation de départ : `start` a un `x` ou un `y` hors des limites de `map`.
- Action : lancement du simulateur.
- Résultat attendu : `{"error": "..."}` sur la sortie standard, code de retour non nul, aucune commande exécutée.

### EX-13 — Erreur : départ sur un obstacle

Origine dans l'intention : « Erreurs. ... un départ sur un obstacle. »
Comportement attendu : si la case `start` est un obstacle (🌳 ou 🪨), le simulateur produit une erreur explicite avant toute exécution de commande, sous la forme décrite en EX-11.

Scénario
- Situation de départ : la case `start` est un obstacle.
- Action : lancement du simulateur.
- Résultat attendu : `{"error": "..."}` sur la sortie standard, code de retour non nul, aucune commande exécutée.

### EX-14 — Interface en ligne de commande

Origine dans l'intention : « Interface. La première version est en ligne de commande. »
Comportement attendu : cette première version du simulateur s'utilise depuis la ligne de commande, sans interface graphique.

Scénario
- Situation de départ : un terminal disponible, le fichier JSON d'entrée présent sur le système de fichiers.
- Action : appel du simulateur en ligne de commande avec le chemin du fichier JSON en argument.
- Résultat attendu : le simulateur s'exécute et produit son résultat sans nécessiter d'interface graphique.

### EX-15 — Un seul rover à la fois

Origine dans l'intention : « Rover. Le simulateur gère un seul rover à la fois. »
Comportement attendu : le simulateur traite un unique rover par exécution ; l'entrée ne décrit qu'un seul rover.

Scénario
- Situation de départ : un fichier JSON décrivant une carte, une position, une orientation et une liste de commandes pour un rover.
- Action : exécution du simulateur.
- Résultat attendu : le simulateur simule ce rover unique ; aucun mécanisme de plusieurs rovers simultanés n'est prévu dans cette version.

### EX-16 — Erreur : fichier JSON d'entrée invalide

Origine dans l'intention : section « Erreurs », étendue par une décision du Product Owner du 2026-09-23 sur la réserve R-02 (l'intention elle-même ne listait que les trois cas repris en EX-11 à EX-13).
Comportement attendu : si le fichier JSON passé en argument est absent, illisible, n'est pas un JSON valide, ou ne contient pas les champs attendus (`map`, `start`, `orientation`, `commands`), le simulateur produit une erreur explicite, sous la forme décrite en EX-11.

Scénario
- Situation de départ : le fichier passé en argument n'existe pas, ou son contenu n'est pas un JSON conforme à la structure d'EX-01 (par exemple `start` absent).
- Action : lancement du simulateur.
- Résultat attendu : `{"error": "..."}` sur la sortie standard, code de retour non nul, aucune commande exécutée.

## Conception proposée

- **Sens des rotations (accepté, découle du repère).** Le repère de l'intention (N en haut, x vers la droite, y vers le bas) fixe mécaniquement le sens des rotations : une rotation à gauche suit l'ordre N → W → S → E → N, une rotation à droite l'ordre inverse. Ce n'est pas un choix produit distinct, mais une conséquence directe d'une contrainte déjà acceptée (EX-02, EX-05, EX-06).
- **Limites de la carte (accepté).** Les limites de la carte sont déduites de `map` (nombre de lignes et de colonnes), sans champ dédié à des dimensions, conformément à la structure JSON décidée par le Product Owner (EX-01).
- **Validation avant exécution (accepté).** Les quatre cas d'erreur (EX-11, EX-12, EX-13, EX-16) sont vérifiés avant toute exécution de commande : la liste `commands` est entièrement validée, `start` est vérifié par rapport à la carte, avant que le rover ne bouge. Décision du Product Owner sur la réserve R-01.
- **Forme unique des erreurs (accepté).** Les quatre cas d'erreur partagent la même forme : `{"error": "..."}` sur la sortie standard et code de retour non nul. Décision du Product Owner sur QO-03.
- **Noms des champs (accepté).** Le JSON d'entrée et de sortie utilise des noms de champs en anglais, en snake_case : `map`, `start`, `orientation`, `commands`, `position`, `blockages`, `command`, `cause`. Les valeurs de `cause` sont `"obstacle"` et `"edge"`, également en anglais pour rester cohérentes avec le reste du schéma. Décision du Product Owner sur QO-02 et sur la langue des valeurs de cause.

## Réserves

### R-01 — Comportement en cas de commande inconnue

Origine : contraste entre la section « Blocage » de l'intention, qui précise explicitement que l'exécution se poursuit après un blocage, et la section « Erreurs », qui ne précisait rien de tel pour une commande inconnue.
Exigences concernées : EX-11.
Décision : le Product Owner (Couthaïer FARFRA) a tranché le 2026-09-23 pour une validation préalable — le simulateur vérifie l'intégralité de la liste `commands` avant de démarrer l'exécution ; une commande inconnue, où qu'elle soit dans la liste, empêche tout mouvement et ne produit aucun résultat partiel.
Éléments modifiés : EX-11 précise désormais ce comportement ; la conception proposée reprend ce choix comme accepté.
Statut : résolue.

### R-02 — Fichier JSON d'entrée absent, illisible ou de structure inattendue

Origine : la section « Erreurs » de l'intention liste exactement trois cas d'erreur explicite (commande inconnue, départ hors carte, départ sur obstacle) ; elle ne mentionnait pas le cas d'un fichier introuvable, non lisible comme JSON, ou dont la structure ne correspond pas à ce qui est attendu.
Exigences concernées : EX-01, EX-12, EX-13.
Décision : le Product Owner (Couthaïer FARFRA) a tranché le 2026-09-23 pour inclure ce cas dans le périmètre, traité comme les trois autres erreurs explicites.
Éléments modifiés : ajout de l'exigence EX-16 ; EX-01 ne présuppose plus la validité du fichier.
Statut : résolue.

## Questions ouvertes

### QO-01 — Numérotation des commandes

Question de l'intention : « Les commandes sont-elles numérotées à partir de 0 ou de 1 ? »
Réponse humaine : le Product Owner (Couthaïer FARFRA) a répondu le 2026-09-23 : à partir de 0.
Effet sur le passage à la phase Build : EX-10 précise désormais cette numérotation ; n'est plus bloquant.
Statut : résolue.

### QO-02 — Structure exacte du JSON d'entrée et de sortie

Question de l'intention : « Quelle est la structure exacte du JSON d'entrée et de sortie : noms des champs, représentation de la carte (tableau de lignes de symboles ou autre) ? »
Réponse humaine : le Product Owner (Couthaïer FARFRA) a répondu le 2026-09-23 :
- carte : tableau de tableaux de symboles (une case par élément, pour éviter toute ambiguïté de découpage des emojis) ;
- noms de champs : anglais, snake_case — `map`, `start`, `orientation`, `commands`, `blockages` ;
- position visée hors carte dans un blocage de bord : coordonnées réellement tentées, y compris négatives.
Effet sur le passage à la phase Build : EX-01, EX-08, EX-09, EX-10 précisent désormais cette structure ; n'est plus bloquant.
Statut : résolue.

### QO-03 — Forme des erreurs

Question de l'intention : « Sous quelle forme les erreurs sont-elles produites : JSON, message sur la sortie d'erreur, code de retour ? »
Réponse humaine : le Product Owner (Couthaïer FARFRA) a répondu le 2026-09-23 : les deux — un objet JSON `{"error": "..."}` sur la sortie standard, et un code de retour non nul.
Effet sur le passage à la phase Build : EX-11, EX-12, EX-13, EX-16 précisent désormais cette forme ; n'est plus bloquant.
Statut : résolue.

## Contexte de génération

### Demande initiale

Commande : `/spec intent/mars-rover/intent.md`

### Skills utilisées

| Chemin | Commit Git de la version utilisée |
| --- | --- |
| [.claude/skills/spec/SKILL.md](.claude/skills/spec/SKILL.md) | 219107548628140ec878cef5ae9071708de9a046 |

### Révisions

Aucune révision pour le moment.
