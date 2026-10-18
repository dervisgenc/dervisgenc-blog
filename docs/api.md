# API

All endpoints live under `/api` and speak JSON with `snake_case` fields.
Every non-2xx response has the body `{"error": "<message>"}`.
Timestamps are RFC 3339 strings; days are `YYYY-MM-DD` in `STATS_TIMEZONE`.

Paginated endpoints return:

```json
{ "items": [], "page": 1, "page_size": 9, "total": 42, "total_pages": 5 }
```

`page` starts at 1; `page_size` defaults to 9 and is capped at 50.

## Types

`PostSummary`

```json
{
  "id": 1,
  "slug": "hello-world",
  "title": "Hello world",
  "summary": "One or two sentences.",
  "cover_image_url": "/api/uploads/3f9c...e1.jpg",
  "tags": ["go", "linux"],
  "reading_minutes": 4,
  "published_at": "2026-10-18T10:00:00+03:00",
  "updated_at": "2026-10-18T10:00:00+03:00",
  "view_count": 120,
  "like_count": 7
}
```

`cover_image_url` is `""` when the post has no cover. Image URLs are
relative to the site origin.

`Post` is a `PostSummary` plus `"content"`: the body as Markdown
(GitHub-flavoured). Raw HTML in the Markdown is not rendered.

`AdminPostSummary` is a `PostSummary` plus:

```json
{ "status": "draft", "share_count": 3, "created_at": "..." }
```

`status` is `"draft"` or `"published"`; `published_at` is `null` for a post
that was never published. `AdminPost` adds `"content"`.

`PostInput` (admin create and update):

| Field | Rules |
| --- | --- |
| `title` | required, at most 200 characters |
| `slug` | optional; generated from the title when empty; lowercase letters, digits and `-` |
| `summary` | at most 500 characters |
| `content` | Markdown; required when `status` is `published` |
| `cover_image_url` | `""`, a path returned by the upload endpoint, or an `https://` URL |
| `tags` | at most 10, each at most 32 characters; normalised to lowercase |
| `status` | `"draft"` or `"published"` |

## Public

| Method and path | Response |
| --- | --- |
| `GET /api/health` | `{"status":"ok"}`, 503 when the database is unreachable |
| `GET /api/posts?page=&page_size=&q=&tag=` | page of published `PostSummary`, newest first. `q` searches title, summary and content; `tag` filters by tag |
| `GET /api/posts/{slug}` | `Post`; 404 unless published |
| `GET /api/posts/{slug}/related?limit=3` | `PostSummary[]`, posts sharing tags first |
| `GET /api/tags` | `[{"name":"go","count":3}]` for published posts, most used first |
| `POST /api/posts/{slug}/views` | 204; counted once per visitor, post and day |
| `GET /api/posts/{slug}/like` | `{"liked":false,"like_count":7}` for the calling visitor |
| `PUT /api/posts/{slug}/like` | `{"liked":true,"like_count":8}`; idempotent |
| `DELETE /api/posts/{slug}/like` | `{"liked":false,"like_count":7}`; idempotent |
| `POST /api/posts/{slug}/shares` | body `{"channel":"x"}` (`x`, `linkedin`, `whatsapp`, `telegram`, `copy`, `native`); 204 |
| `GET /api/uploads/{file}` | uploaded image |

Visitors are identified by a keyed hash of their IP address; raw addresses
are never stored. The view, like and share endpoints are rate limited per
client (429).

## Admin

Sessions use an HttpOnly cookie named `session`, set by the login endpoint.
State-changing admin requests must come from the site's own origin.

| Method and path | Response |
| --- | --- |
| `POST /api/admin/login` | body `{"username","password"}`; 200 `{"username","expires_at"}` and the cookie; 401 bad credentials; 429 too many attempts |
| `POST /api/admin/logout` | 204, clears the cookie |
| `GET /api/admin/session` | `{"username","expires_at"}`; 401 without a valid session |
| `GET /api/admin/posts?status=&q=&page=&page_size=` | page of `AdminPostSummary`, most recently updated first |
| `POST /api/admin/posts` | body `PostInput`; 201 `AdminPost` |
| `GET /api/admin/posts/{id}` | `AdminPost` |
| `PUT /api/admin/posts/{id}` | body `PostInput`; `AdminPost` |
| `DELETE /api/admin/posts/{id}` | 204; deletes the post and its statistics |
| `POST /api/admin/uploads` | multipart field `file` (JPEG, PNG, GIF or WebP, at most 10 MB); 201 `{"url","width","height"}` |
| `GET /api/admin/stats/summary` | `{"posts_published","posts_draft","total_views","total_likes","total_shares","views_today","visitors_today","views_30d","visitors_30d"}` |
| `GET /api/admin/stats/daily?days=30` | `[{"day","views","visitors","likes","shares"}]`, oldest first, one entry per day (1–365 days) |
| `GET /api/admin/stats/top-posts?days=30&limit=10` | `[{"id","slug","title","views","likes","shares"}]` for the period, most viewed first |
| `GET /api/admin/stats/posts/{id}/daily?days=30` | `[{"day","views","likes","shares"}]`, oldest first |

Validation errors return 400, a slug that is already taken returns 409.
