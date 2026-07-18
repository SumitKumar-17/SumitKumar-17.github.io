---
title: Deploying a Next.js/React/Express App on EC2
date: 2025-10-15
topic: Technology
lead:
  A comprehensive guide for deploying on an Ubuntu EC2 instance using Nginx and
  PM2.
---

This script is written for an Ubuntu EC2 instance.

**1. System update and Nginx install:**

```sh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install nginx
```

**2. Install Node.js via NVM, generate an SSH key, and clone the project:**

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 20.15.1
nvm use 20.15.1

ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub
```

Add the printed public key to your GitHub account settings, then:

```sh
git clone <repo-url> ~
cd <project-folder-name>
npm i
npm run build
```

**3. Configure Nginx as a reverse proxy** (replace `{folder_name}` with your
project's name):

```nginx
server {
    listen 80;
    server_name your_domain_name_or_public_ipv4;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```sh
sudo ln -s /etc/nginx/sites-available/{folder_name} /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx restart
```

**4. Process management with PM2:**

```sh
npm i -g pm2
pm2 start npm --name "my-app" -- start
```

Make sure your domain's DNS (e.g. AWS Route 53) points to the instance's public
IPv4 address before this step.

**5. HTTPS with Certbot:**

```sh
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain_name
```

**PM2 commands for other frameworks:**

| Framework         | PM2 command                                           |
| ----------------- | ----------------------------------------------------- |
| Vite project      | `pm2 start npm --name "vite-app" -- run preview`      |
| Next.js server    | `pm2 start npm --name "next-app" -- start`            |
| Create React App  | `pm2 start "serve -s build -l 3000" --name react-app` |
| Express.js server | `pm2 start server.js --name "express-api"`            |

**Redeploying after code changes:**

```bash
cd <project-folder-name>
git pull
npm i
npm run build

pm2 list
pm2 restart <app_name_or_id>
pm2 list
pm2 logs <app_name_or_id>   # if something looks wrong
```

**Static PHP site**, for reference:

```nginx
server {
    listen 80;
    server_name your_domain_name_or_public_ip;

    root /var/www/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
```
