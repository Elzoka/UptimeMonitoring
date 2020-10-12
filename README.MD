# Uptime monitor

We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds, When your site goes down, we\'ll send you a text to let you know.

## installation

make users, tokens and check directories in the .data folder to support file system writes

```bash
mkdir .data/users
mkdir .data/tokens
mkdir .data/checks
```

generate an ssh key and cert to support https communications

```bash
cd https/

openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```
