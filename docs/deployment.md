# Guide de Déploiement — Immo-Express

Ce guide décrit la procédure recommandée pour déployer l'application Immo-Express en environnement de production.

## 1. Prérequis Système
- Serveur Linux (Ubuntu/Debian recommandé)
- Node.js (v18 ou supérieur)
- Nginx
- PM2 (gestionnaire de processus Node.js)

## 2. Installation de l'environnement

Mettez à jour le serveur et installez Node.js & Nginx :
```bash
sudo apt update
sudo apt install -y curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

## 3. Déploiement du Backend (API)

Placez-vous dans le répertoire de l'application et installez les dépendances :
```bash
cd /var/www/immo-express
npm install
```

Lancez le backend via PM2 pour garantir qu'il redémarre automatiquement en cas de crash ou de redémarrage du serveur :
```bash
pm2 start backend/server.js --name "immo-express-backend"
pm2 save
pm2 startup
```
Le backend tournera sur le port **8000** par défaut (vérifiez votre fichier `.env`).

## 4. Déploiement du Frontend (Fichiers Statiques)

Le Frontend est composé de fichiers statiques situés dans le répertoire `/public`. Nginx se chargera de les distribuer directement pour des performances maximales.

Assurez-vous que le fichier `config/nginx.conf` est correctement configuré. Notez que la configuration par défaut assume l'utilisation de Docker (le backend est pointé vers `http://backend:8000`). Si vous déployez sur une seule VM sans Docker, modifiez `backend:8000` par `127.0.0.1:8000`.

Copiez ou créez un lien symbolique de la configuration Nginx :
```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/immo-express.conf
sudo ln -s /etc/nginx/sites-available/immo-express.conf /etc/nginx/sites-enabled/
```

Vérifiez la configuration Nginx et redémarrez le service :
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Sécurisation (HTTPS)

Il est indispensable de sécuriser le domaine avec Let's Encrypt / Certbot :
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## 6. Maintenance & Logs

- Pour voir les logs en temps réel du Backend : `pm2 logs immo-express-backend`
- Pour redémarrer l'application après une mise à jour : `pm2 restart immo-express-backend`
- Sauvegarde : Planifiez une tâche `cron` pour copier régulièrement le fichier SQLite utilisé en base de données.
