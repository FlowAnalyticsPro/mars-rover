.PHONY: test run

DEMO_FILE := examples/demo.json

# Exécute toute la suite de tests. Code de sortie 0 si tout passe,
# non nul dès qu'un test échoue.
test:
	@[ -d node_modules ] || npm install
	npm test

# Rejoue le scénario de démonstration et affiche la position et
# l'orientation finales du rover. Crée le fichier d'exemple s'il
# n'existe pas encore.
run:
	@[ -d node_modules ] || npm install
	@mkdir -p $(dir $(DEMO_FILE))
	@if [ ! -f $(DEMO_FILE) ]; then \
		printf '%s\n' \
			'{' \
			'  "map": [' \
			'    ["🟩", "🟩", "🟩", "🟩"],' \
			'    ["🟩", "🟩", "🟩", "🌳"]' \
			'  ],' \
			'  "start": {"x": 0, "y": 1},' \
			'  "orientation": "E",' \
			'  "commands": ["F", "F", "F", "L", "F", "F", "R", "R", "F", "L"]' \
			'}' \
			> $(DEMO_FILE); \
	fi
	@node --import tsx/esm src/cli.ts $(DEMO_FILE) | node -e "const r=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('Position finale : x='+r.position.x+', y='+r.position.y);console.log('Orientation finale : '+r.orientation);"
