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

À chaque push sur `main`, `.github/workflows/ci-cd.yml` :

1. construit l'image et la publie sur `ghcr.io/augustinde/front-demo` (tags `sha-<commit>` et `latest`) ;
2. la déploie sur le cluster k3s-test (namespace `demo`) avec Helm, en s'authentifiant par OIDC GitHub
   derrière Cloudflare Access. Aucun jeton Kubernetes n'est stocké chez GitHub.

Le déploiement est ignoré tant que la variable `K8S_API_HOST` n'est pas définie.
Configuration côté GitHub : voir l'étape 0 de la procédure k3s.

| Fichier | Rôle |
| --- | --- |
| `deploy/chart/` | chart Helm générique (copie de `k3s-lab/helmfile/charts/app`) |
| `deploy/values-test.yaml` | valeurs de l'environnement de test |
| `deploy/write-kubeconfig.sh` | kubeconfig sans secret pour le job |
| `deploy/github-oidc-credential.sh` | fournit le jeton OIDC GitHub à kubectl/helm |
