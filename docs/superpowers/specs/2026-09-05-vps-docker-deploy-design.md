# Деплой на VPS через Docker + GHCR + nginx/SSL

## Контекст

Приложение — zero-dependency Node.js HTTP-сервер (`server.js`), без build-шага
и без npm-зависимостей (`package.json` не содержит `dependencies`). Раздаёт
статику и обслуживает два API-эндпоинта: прокси на my-ERP
(`/api/my-erp/*`) и отправку уведомлений о бронях в Telegram
(`/api/telegram-booking`). Аутентификация и данные пользователей — через
облачный Supabase (self-hosted не используется).

Цель: перейти на постоянный деплой на собственный VPS с доменом
`immerscape.ru`, задействовав Docker, nginx как reverse proxy с SSL от
Let's Encrypt, и автоматический деплой при пуше в `main` через образ в
GitHub Container Registry (GHCR).

Исходное состояние на момент дизайна:
- VPS куплен, DNS A-запись на `immerscape.ru` уже настроена и указывает на сервер.
- Docker на VPS уже установлен.
- nginx и SSL ещё не настроены.
- В репозитории нет ни `Dockerfile`, ни `.github/workflows`.

## Архитектура

```
GitHub push → main
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   1. docker build → ghcr.io/<owner>/<repo>:latest, :<sha>
   2. docker push (авторизация через встроенный GITHUB_TOKEN)
   3. SSH на VPS → пересоздать .env из GitHub Secrets →
      docker login ghcr.io (GITHUB_TOKEN, валиден на время job) →
      docker compose pull && docker compose up -d → docker image prune -f
   │
   ▼
VPS
   nginx (пакет ОС, вне Docker) — :80/:443, TLS от certbot —
     proxy_pass → 127.0.0.1:3000
   Docker: контейнер app (образ immerscape:latest),
     порт опубликован только на 127.0.0.1:3000 (не наружу)
```

nginx работает на хосте, а не в контейнере — так продление сертификата
через `certbot.timer` остаётся стандартным системным механизмом, а не
дополнительной задачей внутри docker-compose.

## Компоненты

### Docker-образ

`Dockerfile` в корне репозитория:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Зависимостей нет, поэтому `npm install`/`npm ci` в образе не требуется.
Добавляется `.dockerignore`, исключающий `.git`, `tests/`, `docs/`,
`README.md`, `node_modules/` (на случай появления) — чтобы не гонять
лишнее в контекст сборки и не инвалидировать кэш зря.

### GHCR

Образ приватный (соответствует приватности репозитория). Публикуется как
`ghcr.io/<owner>/<repo>:latest` и `ghcr.io/<owner>/<repo>:<git-sha>` —
тег с sha на будущее для отката на конкретную версию вручную
(`docker compose` при этом продолжает использовать `latest`).

### Секреты приложения (Telegram)

`TELEGRAM_BOT_TOKEN` и три `TELEGRAM_CHAT_ID_*` хранятся как GitHub
Secrets репозитория. При каждом деплое workflow пересоздаёт файл
`/opt/immerscape/.env` на сервере из этих secrets (перезаписывая
предыдущую версию), так что GitHub Secrets остаются единственным
источником правды — обновление значения в репозитории при следующем
деплое само попадёт на сервер без ручного захода по SSH.
`docker-compose.yml` подключает файл через `env_file: .env`.

### docker-compose на сервере

Создаётся один раз вручную (не через CI), лежит в `/opt/immerscape/docker-compose.yml`:

```yaml
services:
  app:
    image: ghcr.io/<owner>/<repo>:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - "127.0.0.1:3000:3000"
```

Порт публикуется только на loopback-интерфейсе — снаружи достучаться до
контейнера в обход nginx нельзя.

### nginx + SSL

Настраивается один раз вручную на VPS, CI это не трогает.

`/etc/nginx/sites-available/immerscape.ru`:

```nginx
server {
    listen 80;
    server_name immerscape.ru www.immerscape.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Далее:

```bash
sudo ln -s /etc/nginx/sites-available/immerscape.ru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d immerscape.ru -d www.immerscape.ru
```

`certbot --nginx` дописывает `listen 443 ssl`, пути к сертификатам и
редирект с 80 на 443 автоматически. Автопродление обеспечивается
стандартным `certbot.timer` — дополнительная настройка не нужна.
DNS A-запись должна указывать на VPS до запуска certbot (уже так).

### GitHub Actions workflow

`.github/workflows/deploy.yml`, триггер — push в `main`.

Секреты репозитория для доступа к VPS: `VPS_HOST`, `VPS_USER`,
`VPS_SSH_KEY` (приватный ключ отдельной deploy-пары; публичный ключ
добавлен в `~/.ssh/authorized_keys` нужного пользователя на VPS),
опционально `VPS_PORT`.

Для авторизации на GHCR при pull на сервере используется встроенный
`GITHUB_TOKEN`, переданный в SSH-сессию только на время выполнения job
(через `envs`/`env` в `appleboy/ssh-action`) — отдельный долгоживущий PAT
не заводится, так как деплой полностью проходит через CI.

```yaml
name: Deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}

      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          envs: GITHUB_ACTOR,GH_TOKEN,TELEGRAM_BOT_TOKEN,TELEGRAM_CHAT_ID_PROFSOYUZNAYA,TELEGRAM_CHAT_ID_IZMAYLOVSKAYA,TELEGRAM_CHAT_ID_TAGANSKAYA
          script: |
            cat > /opt/immerscape/.env <<EOF
            TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
            TELEGRAM_CHAT_ID_PROFSOYUZNAYA=$TELEGRAM_CHAT_ID_PROFSOYUZNAYA
            TELEGRAM_CHAT_ID_IZMAYLOVSKAYA=$TELEGRAM_CHAT_ID_IZMAYLOVSKAYA
            TELEGRAM_CHAT_ID_TAGANSKAYA=$TELEGRAM_CHAT_ID_TAGANSKAYA
            EOF
            chmod 600 /opt/immerscape/.env
            echo "$GH_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
            cd /opt/immerscape
            docker compose pull
            docker compose up -d
            docker image prune -f
        env:
          GITHUB_ACTOR: ${{ github.actor }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID_PROFSOYUZNAYA: ${{ secrets.TELEGRAM_CHAT_ID_PROFSOYUZNAYA }}
          TELEGRAM_CHAT_ID_IZMAYLOVSKAYA: ${{ secrets.TELEGRAM_CHAT_ID_IZMAYLOVSKAYA }}
          TELEGRAM_CHAT_ID_TAGANSKAYA: ${{ secrets.TELEGRAM_CHAT_ID_TAGANSKAYA }}
```

## Ручная первоначальная настройка сервера (один раз, вне CI)

1. Создать deploy-пару SSH-ключей, публичный ключ добавить в
   `authorized_keys` пользователя, которым будет заходить Actions;
   приватный ключ, хост, пользователя (и порт, если нестандартный)
   сохранить в GitHub Secrets (`VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`,
   `VPS_PORT`).
2. Создать каталог `/opt/immerscape/`, положить туда `docker-compose.yml`
   (см. выше).
3. Настроить nginx (`sites-available`/`sites-enabled`) и получить
   сертификат через `certbot --nginx` (см. выше).
4. Добавить в GitHub Secrets репозитория Telegram-переменные
   (`TELEGRAM_BOT_TOKEN`, три `TELEGRAM_CHAT_ID_*`).
5. Запушить `Dockerfile`, `.dockerignore` и
   `.github/workflows/deploy.yml` в `main` — первый пуш соберёт образ,
   зальёт в GHCR и выполнит первый деплой.

## Простой при деплое

`docker compose up -d` пересоздаёт контейнер — секунда-два простоя на
каждый деплой. Для этого сайта (бронирования, невысокая нагрузка) это
приемлемо; blue-green или health-check-gated rollout сознательно не
делаем, чтобы не усложнять пайплайн сверх необходимого.

## Из явного скоупа

- Self-hosted Supabase — не требуется, используется облачный сервис.
- Балансировка нагрузки, множественные реплики контейнера — не нужны
  при текущей нагрузке.
- Отдельный staging/preview-контур — не запрашивался, деплоится только `main`.
