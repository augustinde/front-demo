# front-demo

Écran Angular 22 qui affiche le contenu de la table `demo` (PostgreSQL), lu par [api-demo](https://github.com/augustinde/api-demo) via `GET /api/demo`.

## Développement local

```bash
npm install
npm start            # http://localhost:4200, /api relayé vers http://localhost:8080 (proxy.conf.json)
```

Lance `api-demo` en local sur le port 8080 pour avoir des données.

## Image

```bash
docker build -t front-demo .
docker run --rm -p 8080:8080 -e API_UPSTREAM=http://host.docker.internal:8080 front-demo
```

nginx (image `nginx-unprivileged`, sans root) sert l'application et relaie `/api/` vers `API_UPSTREAM` :
le front et l'API partagent la même origine, sans CORS.

## Déploiement

Aucun déploiement automatique : `main` produit une image, les déploiements se lancent à la main dans l'onglet **Actions** (branche `main`).

| Workflow | Déclencheur | Ce qui se passe |
| --- | --- | --- |
| **CI** (`ci-cd.yml`) | pull request (dont Renovate) | build de contrôle, rien n'est publié |
| **CI** (`ci-cd.yml`) | push sur `main` | image `ghcr.io/augustinde/front-demo:sha-<commit>` publiée, rien n'est déployé |
| **Déployer** (`deploy-version.yml`) | Run workflow : environnement + version | déploie une image existante. Test : version vide = dernier commit de `main` (`https://front-demo-test.augustinde.dev`, namespace `demo`). Prod : une version `vX.Y.Z` déjà publiée, ce qui sert de retour arrière |
| **Release** (`release.yml`) | Run workflow : `patch`, `minor` ou `major` (+ commit facultatif) | version suivante calculée depuis le dernier tag, image du commit réétiquetée sans reconstruction, tag et Release GitHub avec notes, déploiement en **prod** (`https://front-demo.augustinde.dev`, namespace `demo-prod`) |

Le commit livré doit avoir été construit sur `main` ; un commit déjà publié est refusé.
Authentification par OIDC GitHub derrière Cloudflare Access : aucun jeton Kubernetes n'est stocké chez GitHub.
Le déploiement est ignoré tant que la variable `K8S_API_HOST` n'est pas définie.
Configuration côté GitHub : étapes 0, 10 et 11 de la procédure k3s.
Les dépendances sont suivies par Renovate (`renovate.json`) : correctifs fusionnés automatiquement, le reste à valider.

| Fichier | Rôle |
| --- | --- |
| `deploy/chart/` | chart Helm générique (copie de `k3s-lab/helmfile/charts/app`) |
| `deploy/values-test.yaml` | valeurs de l'environnement de test |
| `deploy/values-prod.yaml` | valeurs de la production |
| `.github/workflows/deploy.yml` | déploiement Helm commun à test et prod, appelé par Déployer et Release |
| `deploy/write-kubeconfig.sh` | kubeconfig sans secret pour le job |
| `deploy/github-oidc-credential.sh` | fournit le jeton OIDC GitHub à kubectl/helm |
