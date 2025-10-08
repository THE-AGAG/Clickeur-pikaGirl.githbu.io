# Clickeur-pikaGirl

Simple clicker game (static site) ready for GitHub Pages.

## Déploiement sur GitHub Pages

1. Créez un dépôt GitHub et poussez le contenu du dossier `Clickeur-pikaGirl` (ou le dossier `Clicker` si vous préférez) sur la branche `main`.

2. Dans les paramètres du repository, activez GitHub Pages et choisissez la source (par exemple `main` branch, folder `/` ou `main` + folder `/docs`).

3. Attendez quelques minutes, puis visitez `https://<votre-nom>.github.io/<repo>/`.

## Notes et limitations

- Ce projet est conçu pour fonctionner entièrement côté client (pas de base de données serveur). Les sauvegardes se font via `localStorage` du navigateur.
- Les navigateurs modernes bloquent parfois l'autoplay audio. L'application essaie d'"unlock" l'audio sur la première interaction utilisateur (clic/keydown) mais vous devrez peut-être cliquer sur la page pour démarrer la musique.
- Les fichiers audio et images sont référencés en chemins relatifs (ex: `song/...`, `img/...`). Le `base` a été ajouté à `index.html` pour sécuriser les chemins quand le site est servi depuis un sous-dossier (GitHub Pages).
- Pour tester localement, ouvrez `Clicker/index.html` dans votre navigateur (double-clic). Certaines politiques d'autoplay peuvent bloquer la lecture automatique en local; testez sur GitHub Pages si besoin.

## Commandes recommandées (facultatif)

Si vous utilisez Git en local :

```powershell
# Initialiser, ajouter et pousser
git init
git add .
git commit -m "Initial commit - Clicker"
git branch -M main
git remote add origin https://github.com/<votre-nom>/<repo>.git
git push -u origin main
```

## Vérifications après déploiement

- Vérifiez que `index.html` charge correctement les fichiers CSS/JS et médias.
- Testez l'interface : audio, sliders, persistence des paramètres.

---

Si vous voulez, je peux :

- générer automatiquement une branche `gh-pages` et y copier le contenu, créer le commit (si vous me donnez accès Git, ou je peux donner les commandes à exécuter localement),
- ajouter un petit `CNAME` si vous avez un domaine personnalisé.
