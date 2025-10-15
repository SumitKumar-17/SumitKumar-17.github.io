---
title: "Deploying a Next.js/React/Express Application"
description: "A comprehensive guide for deploying on an Ubuntu EC2 instance using Nginx and PM2 for process management."
publishDate: "15 October 2025"
draft: false
tags: ["deployment", "nginx", "pm2", "next.js", "react", "ec2", "ubuntu"]
---

This script is written for an Ubuntu EC2 instance.

## 1. System Update and Nginx Installation
```sh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install nginx
```

## 2\. Install Node.js via NVM

```sh
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh) | bash
source ~/.bashrc
nvm install 20.15.1
nvm use 20.15.1
```

## 3\. Generate SSH Key

```sh
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa -N ""
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub
```

Add this public SSH key to your GitHub account settings.

## 4\. Clone and Setup Project

```sh
git clone <repo-url> ~
cd <project-folder-name>
npm i
npm run build
cd ~
```

## 5\. Configure Nginx for Reverse Proxy

Create a new Nginx configuration file. Replace `{folder_name}` with your project's name for clarity.

```sh
sudo nano /etc/nginx/sites-available/{folder_name}
```

Add the following server block configuration. This proxies requests from port 80 to your application running on port 3000.

```nginx
server {
    listen 80;
    server_name your_domain_name_or_public_ipv4;

    location / {
        proxy_pass [http://127.0.0.1:3000](http://127.0.0.1:3000);
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration by creating a symbolic link, test the syntax, and restart Nginx.

```sh
sudo ln -s /etc/nginx/sites-available/{folder_name} /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx restart
```

## 6\. Process Management with PM2

Install PM2 globally and start your application.

```sh
npm i -g pm2
pm2 start npm --name "my-app" -- start
```

**Note:** Before this step, ensure your domain's DNS records (e.g., in AWS Route 53) point to your EC2 instance's public IPv4 address.

## 7\. Setup HTTPS with Certbot

Install Certbot to secure your site with a free SSL certificate from Let's Encrypt.

```sh
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain_name
```

-----

## PM2 Commands for Different Frameworks

| Framework         | PM2 Command                                      |
| ----------------- | ------------------------------------------------ |
| Vite Project      | `pm2 start npm --name "vite-app" -- run preview` |
| Next.js Server    | `pm2 start npm --name "next-app" -- start`       |
| Create React App  | `pm2 start "serve -s build -l 3000" --name react-app` |
| Express.js Server | `pm2 start server.js --name "express-api"`       |

-----

## Redeploying After Code Changes

Follow these steps to update your application on the EC2 instance after pushing new code to your repository.

### 1\. Pull the Latest Code

Navigate to your project directory, pull the latest changes, and rebuild.

```bash
cd <project-folder-name>
git pull
npm i
npm run build
```

### 2\. Restart the Application Using PM2

List all running processes to find the name or ID of your application.

```bash
pm2 list
```

Restart the specific process to apply changes with zero downtime.

```bash
pm2 restart <app_name_or_id>
```

Verify that your app is running correctly.

```bash
pm2 list
```

If the process shows an error status, check the logs for issues with the new build.

```bash
pm2 logs <app_name_or_id>
```

-----

## Nginx Configuration for a Static PHP Site

If hosting a simple PHP project, your Nginx configuration might look like this:

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
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock; # Path may vary
    }
}
```

## Useful References

  - [Nginx Installation & SSL Setup with Certbot on AWS EC2](https://dev.to/ashirbadgudu/nginx-installation-https-ssl-setup-with-certbot-in-aws-ec2-1ee6)
  - [Deploying a Next.js App on EC2 with PM2 and Nginx](https://suvankar.medium.com/deploying-a-next-js-application-on-an-ec2-instance-with-pm2-and-nginx-922975ecd611)
  - [Step-by-Step Guide to Deploy Next.js with Nginx on AWS](https://appluex.com/insights/deploy-nextjs-app-nginx-aws-ec2-ubuntu)
  - [Deploying a Node.js Server on EC2](https://medium.com/@siddhantshaha28/step-by-step-guide-to-deploy-a-node-js-server-on-amazon-ec2-72fd48f89cbd)

