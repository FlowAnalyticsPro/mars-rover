# Intent : Simulateur Mars Rover
Auteur : Couthaïer FARFRA (membre de l'équipe Mars Rover).

## Problème
L'équipe doit pouvoir tester le rover avant de l'utiliser en conditions réelles. Le rover opérera dans un milieu hostile, à des millions de kilomètres de la Terre. Il doit donc être conçu pour « s'adapter, improviser et dominer », c'est-à-dire s'adapter à toutes les situations. Aujourd'hui, l'équipe n'a aucun moyen de vérifier ce que produit une suite de commandes avant de l'exécuter pour de vrai.

## Résultat proposé
Un simulateur en ligne de commande qui lit un fichier JSON décrivant la carte, le point de départ, l'orientation et la suite de commandes. Il exécute les commandes une par une et produit un résultat JSON qui contient :
- la position finale du rover ;
- son orientation finale ;
- la liste des blocages rencontrés.

## Utilisateurs et systèmes concernés
- L'équipe qui construit Mars Rover, qui utilise le simulateur pour tester le rover.
- Le rover, dont le simulateur reproduit le comportement.

## Contraintes
- **Entrée.** Le simulateur reçoit en argument de la ligne de commande un fichier JSON qui contient :
  - la carte ;
  - la position de départ (x, y) ;
  - l'orientation, parmi N, S, E ou W ;
  - la suite de commandes.
- **Repère.**
  - L'origine (0, 0) est en haut à gauche de la carte.
  - x augmente vers la droite et y vers le bas.
  - N correspond au haut de la carte : avancer vers le nord fait diminuer y.
- **Carte.**
  - 🟩 et 🟫 sont des cases libres.
  - 🌳 et 🪨 sont des obstacles.
  - Une même carte peut mélanger les deux styles.
- **Commandes.**
  - `F` fait avancer le rover d'une case.
  - `L` le fait tourner de 90 degrés à gauche.
  - `R` le fait tourner de 90 degrés à droite.
- **Blocage.**
  - Si un obstacle bloque `F`, le rover reste sur place, le simulateur signale un blocage de cause « obstacle », puis le rover exécute les commandes suivantes.
  - Si `F` ferait sortir le rover de la carte, il reste sur place, le simulateur signale un blocage de cause « bord », distincte d'un obstacle, puis le rover exécute les commandes suivantes. La carte ne boucle pas.
- **Sortie.** Le simulateur produit un résultat JSON qui contient :
  - la position finale ;
  - l'orientation finale ;
  - la liste des blocages. Chaque blocage indique le numéro de la commande, la position visée et la cause (obstacle ou bord). La liste est vide si aucun mouvement n'a été bloqué.
- **Erreurs.** Le simulateur produit une erreur explicite dans trois cas :
  - une commande inconnue ;
  - un départ hors de la carte ;
  - un départ sur un obstacle.
- **Interface.** La première version est en ligne de commande.
- **Rover.** Le simulateur gère un seul rover à la fois.

## Questions ouvertes
- Les commandes sont-elles numérotées à partir de 0 ou de 1 ?
- Quelle est la structure exacte du JSON d'entrée et de sortie : noms des champs, représentation de la carte (tableau de lignes de symboles ou autre) ?
- Sous quelle forme les erreurs sont-elles produites : JSON, message sur la sortie d'erreur, code de retour ?
