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

`.github/workflows/ci-cd.yml` :

| Événement | Ce qui se passe |
| --- | --- |
| pull request (dont Renovate) | build de contrôle, rien n'est publié |
| push sur `main` | image `ghcr.io/augustinde/front-demo:sha-<commit>`, déployée en **test** : `https://front-demo-test.augustinde.dev` (namespace `demo`) |
| tag `v1.2.3` | la même image, réétiquetée `v1.2.3`, déployée en **prod** : `https://front-demo.augustinde.dev` (namespace `demo-prod`) |

Mettre en production le commit actuellement en test :

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Le tag doit porter sur un commit déjà construit sur `main`, sinon le job `release` s'arrête.
Authentification par OIDC GitHub derrière Cloudflare Access : aucun jeton Kubernetes n'est stocké chez GitHub.
Le déploiement est ignoré tant que la variable `K8S_API_HOST` n'est pas définie.
Configuration côté GitHub : étapes 0, 10 et 11 de la procédure k3s.
Les dépendances sont suivies par Renovate (`renovate.json`) : correctifs fusionnés automatiquement, le reste à valider.

| Fichier | Rôle |
| --- | --- |
| `deploy/chart/` | chart Helm générique (copie de `k3s-lab/helmfile/charts/app`) |
| `deploy/values-test.yaml` | valeurs de l'environnement de test |
| `deploy/values-prod.yaml` | valeurs de la production |
| `.github/workflows/deploy.yml` | déploiement Helm commun à test et prod |
| `deploy/write-kubeconfig.sh` | kubeconfig sans secret pour le job |
| `deploy/github-oidc-credential.sh` | fournit le jeton OIDC GitHub à kubectl/helm |
