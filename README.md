# dervisgenc.com

Source of [dervisgenc.com](https://dervisgenc.com), a static about page,
and [blog.dervisgenc.com](https://blog.dervisgenc.com), a blog with an
admin panel for writing posts and following their statistics.

```
Cloudflare ── cloudflared ── nginx :80 ─┬─ dervisgenc.com       static files   /var/www/dervisgenc.com
                                        └─ blog.dervisgenc.com ─┬─ /api/   backend   127.0.0.1:7100 ─┐
                                                                └─ /       frontend  127.0.0.1:3100  │
                                                                     (Docker Compose)    PostgreSQL ─┘
```

| Path | Contents |
| --- | --- |
| `about/` | The about page: Next.js, exported as static files. |
| `backend/` | Blog API in Go (gin, GORM, PostgreSQL). `cmd/blog` is the server, `cmd/admin-user` manages admin accounts. |
| `frontend/` | Blog site and admin panel in Next.js. |
| `compose.yaml` | Production stack: PostgreSQL, backend, frontend. |
| `deploy/nginx/` | nginx sites for both domains. |
| `docs/api.md` | API reference. |

## Features

- Posts are written in Markdown in the admin panel, with a live preview,
  image uploads, a cover image, tags and drafts. Raw HTML in Markdown is
  not rendered, so a post cannot inject scripts.
- Readers can search, filter by tag, like and share posts. There are no
  reader accounts; readers are told apart by a keyed hash of their IP
  address, and IP addresses are never stored.
- The dashboard shows views, unique visitors, likes and shares per day and
  per post.

## Backend design

```
backend/internal/
  config/      environment variables, validated at startup
  database/    connection with retries, schema migration
  server/      routes and middleware
  auth/        admin accounts, session cookie, login rate limit, origin check
  post/        posts and tags: validation, slugs, repository, handlers
  engagement/  views, likes and shares from readers
  stats/       daily counters, dashboard reports, cleanup
  media/       image upload processing and serving
  visitor/     anonymous visitor hashes
  ratelimit/   per-IP rate limiting
```

Each package owns its tables (`Models()`), and the schema is created and
updated by GORM's AutoMigrate at startup. There are no SQL scripts,
triggers or database extensions.

**Statistics.** Counters are aggregated the moment an event happens: a view
increments the post's total, the post's row for the day and the site's row
for the day in one transaction. No raw request log is kept, so nothing has
to be rolled up or purged later. The only short-lived rows are the marks
used to count each visitor and each post view once per day; the backend
deletes marks older than two days every six hours. This is why the old
pg_cron job is gone: scheduling a two-line cleanup inside the application
needs no custom PostgreSQL image, no superuser rights and no
`shared_preload_libraries`, and it is tested together with the code that
writes the data.

**Security.**

- Admin sessions are signed tokens in an `HttpOnly`, `Secure`,
  `SameSite=Strict` cookie, so page scripts cannot read them. State-changing
  admin requests must come from `PUBLIC_URL` (checked via `Origin`).
- Login is rate limited per IP and takes the same time for unknown users.
- Uploads are limited in size and pixel count, and every image is decoded
  and re-encoded as JPEG or PNG under a random name. This strips EXIF data
  such as GPS coordinates and guarantees only real images are served.
- Request bodies are capped, error responses never contain internal
  details, and admin responses are not cached.
- Containers run as non-root users with read-only root filesystems and no
  Linux capabilities. PostgreSQL publishes no port, the backend and
  frontend listen on loopback only.

## Development

Requirements: Go 1.26+, Node.js 22+, Docker.

```sh
make dev-db                                  # PostgreSQL on 127.0.0.1:55432
cd backend && cp .env.example .env
go run ./cmd/admin-user -username admin      # once, to create an admin
go run ./cmd/blog                            # API on 127.0.0.1:8080

cd frontend && npm ci && npm run dev         # site on localhost:3000, proxies /api

make test               # go vet, unit tests, eslint, type check
make test-integration   # all backend tests against a throwaway PostgreSQL
```

## Production

Everything runs from a checkout of this repository on the server.

| What | Where |
| --- | --- |
| Configuration and secrets | `.env` in the checkout (mode 600, from `.env.example`) |
| Database | volume `blog-postgres` |
| Uploaded images | volume `blog-uploads` |
| Logs | `make logs` (Docker keeps 5 × 10 MB per container) |
| Backups | `~/backups/blog/` |

### First-time setup

```sh
cp .env.example .env && chmod 600 .env       # fill in JWT_SECRET and DB_PASSWORD
make up                                      # creates the volumes, builds and starts
make admin-user USERNAME=<name>

sudo install -m 644 deploy/nginx/blog.dervisgenc.com.conf /etc/nginx/sites-available/blog.dervisgenc.com
sudo ln -sf /etc/nginx/sites-available/blog.dervisgenc.com /etc/nginx/sites-enabled/blog.dervisgenc.com
sudo nginx -t && sudo systemctl reload nginx
```

### Routine operations

```sh
git pull && make up                 # deploy a new version
make ps                             # status and health
make logs SERVICE=backend           # follow logs
make admin-user USERNAME=<name>     # reset a forgotten password
make backup                         # dump the database and archive the images
make db-psql                        # interactive psql
make deploy-about                   # rebuild and publish dervisgenc.com
```

Restore a database dump with
`docker compose exec -T db sh -c 'pg_restore --clean --if-exists -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < dump`.

PostgreSQL minor versions can be updated by pulling the image again
(`docker compose pull db && make up`). A major upgrade needs a dump and a
restore into a new volume.

## License

MIT, see [LICENSE](LICENSE).
