# Intent : Simulateur Mars Rover
Auteur : Couthaïer FARFRA (membre de l'équipe Mars Rover).

## Problème
L'équipe doit pouvoir tester le rover avant de l'utiliser en conditions réelles. Le rover opérera dans un milieu hostile, à des millions de kilomètres de la Terre. Il doit donc être conçu pour « s'adapter, improviser et dominer », c'est-à-dire s'adapter à toutes les situations. Aujourd'hui, l'équipe n'a aucun moyen de vérifier ce que produit une suite de commandes avant de l'exécuter pour de vrai.

## Résultat proposé
Un simulateur en ligne de commande qui reçoit un point de départ, une orientation, une carte et une liste de commandes. Il exécute les commandes une par une et affiche trois informations :
- la position finale du rover ;
- son orientation finale ;
- les éventuels blocages rencontrés.

## Utilisateurs et systèmes concernés
- L'équipe qui construit Mars Rover, qui utilise le simulateur pour tester le rover.
- Le rover, dont le simulateur reproduit le comportement.

## Contraintes
- **Entrées.** Le simulateur reçoit :
  - un point (x, y) ;
  - une orientation parmi N, S, E ou W ;
  - une carte qui place les obstacles ;
  - une liste de commandes.
- **Repère.** L'origine (0, 0) est en haut à gauche de la carte. x augmente vers la droite et y vers le bas.
- **Carte.**
  - 🟩 et 🟫 sont des cases libres.
  - 🌳 et 🪨 sont des obstacles.
  - Une même carte peut mélanger les deux styles.
- **Commandes.**
  - `F` fait avancer le rover d'une case.
  - `L` le fait tourner de 90 degrés à gauche.
  - `R` le fait tourner de 90 degrés à droite.
- **Blocage.**
  - Si un obstacle bloque `F`, le rover reste sur place, signale le blocage, puis exécute les commandes suivantes.
  - Le bord de la carte bloque aussi le déplacement : la carte ne boucle pas.
- **Erreurs.** Le simulateur produit une erreur explicite dans trois cas :
  - une commande inconnue ;
  - un départ hors de la carte ;
  - un départ sur un obstacle.
- **Interface.** La première interface est en ligne de commande.
- **Rover.** Le simulateur gère un seul rover à la fois.

## Questions ouvertes
- Quand le bord de la carte bloque `F`, le simulateur signale-t-il le blocage comme pour un obstacle ?
- N correspond-il au haut de la carte, c'est-à-dire à y qui diminue ?
- Comment la carte, le point de départ, l'orientation et les commandes sont-ils fournis à la ligne de commande : arguments, fichier, entrée standard ?
- Quel est le format exact de la sortie, en particulier pour signaler les blocages ?
