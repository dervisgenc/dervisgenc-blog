package server

import (
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/png"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/auth"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/database/databasetest"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/engagement"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/media"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/post"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/stats"
	"github.com/dervisgenc/dervisgenc-blog/backend/internal/visitor"
)

const origin = "https://blog.example.com"

type okPinger struct{}

func (okPinger) PingContext(context.Context) error { return nil }

type client struct {
	t       *testing.T
	handler http.Handler
	cookie  *http.Cookie
}

func newClient(t *testing.T) *client {
	t.Helper()
	models := []any{&auth.Admin{}}
	models = append(models, post.Models()...)
	models = append(models, engagement.Models()...)
	db := databasetest.Open(t, append(models, stats.Models()...)...)

	log := slog.New(slog.DiscardHandler)
	secret := []byte("0123456789abcdef0123456789abcdef")
	tokens := auth.NewTokenManager(secret, time.Hour)
	authService := auth.NewService(db, tokens)
	if err := authService.SetPassword(context.Background(), "admin", "correct horse battery"); err != nil {
		t.Fatal(err)
	}
	store, err := media.NewStore(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	posts := post.NewRepository(db)

	handler, err := NewRouter(Dependencies{
		Log:            log,
		PublicURL:      origin,
		TrustedProxies: []string{"127.0.0.1"},
		Database:       okPinger{},
		Tokens:         tokens,
		Auth:           auth.NewHandler(authService, tokens, true, log),
		Posts:          post.NewHandler(post.NewService(posts), log),
		Engagement:     engagement.NewHandler(engagement.NewService(db, posts, visitor.NewHasher(secret), time.UTC), log),
		Stats:          stats.NewHandler(stats.NewService(db, time.UTC, log), log),
		Media:          media.NewHandler(store, 1<<20, log),
	})
	if err != nil {
		t.Fatal(err)
	}
	return &client{t: t, handler: handler}
}

func (c *client) do(method, path string, body any, headers ...string) *httptest.ResponseRecorder {
	c.t.Helper()
	var data []byte
	if body != nil {
		data, _ = json.Marshal(body)
	}
	req := httptest.NewRequest(method, path, bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", origin)
	for i := 0; i+1 < len(headers); i += 2 {
		req.Header.Set(headers[i], headers[i+1])
	}
	if c.cookie != nil {
		req.AddCookie(c.cookie)
	}
	rec := httptest.NewRecorder()
	c.handler.ServeHTTP(rec, req)
	return rec
}

func (c *client) login() {
	c.t.Helper()
	rec := c.do(http.MethodPost, "/api/admin/login", map[string]string{"username": "admin", "password": "correct horse battery"})
	if rec.Code != http.StatusOK {
		c.t.Fatalf("login: %d %s", rec.Code, rec.Body)
	}
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == auth.CookieName {
			if !cookie.HttpOnly || !cookie.Secure || cookie.SameSite != http.SameSiteStrictMode {
				c.t.Errorf("session cookie flags: %+v", cookie)
			}
			c.cookie = cookie
		}
	}
	if c.cookie == nil {
		c.t.Fatal("login set no session cookie")
	}
}

func decode[T any](t *testing.T, rec *httptest.ResponseRecorder) T {
	t.Helper()
	var v T
	if err := json.Unmarshal(rec.Body.Bytes(), &v); err != nil {
		t.Fatalf("decode %s: %v", rec.Body, err)
	}
	return v
}

func TestAdminRequiresSession(t *testing.T) {
	c := newClient(t)
	for _, path := range []string{"/api/admin/session", "/api/admin/posts", "/api/admin/stats/summary"} {
		if rec := c.do(http.MethodGet, path, nil); rec.Code != http.StatusUnauthorized {
			t.Errorf("GET %s without session: %d", path, rec.Code)
		}
	}
	if rec := c.do(http.MethodPost, "/api/admin/uploads", nil); rec.Code != http.StatusUnauthorized {
		t.Errorf("upload without session: %d", rec.Code)
	}

	rec := c.do(http.MethodPost, "/api/admin/login", map[string]string{"username": "admin", "password": "wrong password"})
	if rec.Code != http.StatusUnauthorized || strings.Contains(rec.Body.String(), "admin") {
		t.Errorf("bad login: %d %s", rec.Code, rec.Body)
	}
}

func TestAdminRejectsCrossOrigin(t *testing.T) {
	c := newClient(t)
	c.login()

	rec := c.do(http.MethodPost, "/api/admin/posts", post.Input{Title: "x", Status: post.StatusDraft}, "Origin", "https://evil.example")
	if rec.Code != http.StatusForbidden {
		t.Errorf("cross-origin create: %d", rec.Code)
	}
	rec = c.do(http.MethodPost, "/api/admin/login", map[string]string{"username": "admin", "password": "x"}, "Origin", "https://evil.example")
	if rec.Code != http.StatusForbidden {
		t.Errorf("cross-origin login: %d", rec.Code)
	}
	rec = c.do(http.MethodDelete, "/api/admin/posts/1", nil, "Origin", "")
	if rec.Code != http.StatusForbidden {
		t.Errorf("delete without Origin: %d", rec.Code)
	}
	rec = c.do(http.MethodDelete, "/api/admin/posts/1", nil, "Origin", "", "Sec-Fetch-Site", "same-origin")
	if rec.Code != http.StatusNotFound {
		t.Errorf("same-origin delete without Origin: %d, want it to reach the handler", rec.Code)
	}
}

func TestLoginIsRateLimited(t *testing.T) {
	c := newClient(t)
	var last int
	for i := 0; i < 7; i++ {
		last = c.do(http.MethodPost, "/api/admin/login", map[string]string{"username": "admin", "password": "wrong"}).Code
	}
	if last != http.StatusTooManyRequests {
		t.Errorf("7th failed login: %d, want 429", last)
	}
}

func TestPublishAndRead(t *testing.T) {
	c := newClient(t)
	c.login()

	if rec := c.do(http.MethodGet, "/api/admin/session", nil); rec.Code != http.StatusOK {
		t.Fatalf("session: %d", rec.Code)
	}

	rec := c.do(http.MethodPost, "/api/admin/posts", post.Input{Title: "Hello", Content: "# Hi", Status: post.StatusDraft, Tags: []string{"Go"}})
	if rec.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", rec.Code, rec.Body)
	}
	created := decode[post.AdminDetail](t, rec)

	if rec := c.do(http.MethodGet, "/api/posts/hello", nil); rec.Code != http.StatusNotFound {
		t.Errorf("draft is public: %d", rec.Code)
	}

	rec = c.do(http.MethodPut, "/api/admin/posts/"+itoa(created.ID), post.Input{Title: "Hello", Content: "# Hi", Status: post.StatusPublished, Tags: []string{"go"}})
	if rec.Code != http.StatusOK {
		t.Fatalf("publish: %d %s", rec.Code, rec.Body)
	}

	rec = c.do(http.MethodGet, "/api/posts/hello", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("read: %d %s", rec.Code, rec.Body)
	}
	detail := decode[post.Detail](t, rec)
	if detail.Content != "# Hi" || len(detail.Tags) != 1 || detail.Tags[0] != "go" {
		t.Errorf("detail = %+v", detail)
	}

	if rec := c.do(http.MethodPost, "/api/posts/hello/views", nil, "X-Real-IP", "198.51.100.7"); rec.Code != http.StatusNoContent {
		t.Errorf("view: %d", rec.Code)
	}
	rec = c.do(http.MethodPut, "/api/posts/hello/like", nil, "X-Real-IP", "198.51.100.7")
	if state := decode[engagement.LikeState](t, rec); !state.Liked || state.LikeCount != 1 {
		t.Errorf("like = %+v", state)
	}
	if rec := c.do(http.MethodPost, "/api/posts/hello/shares", map[string]string{"channel": "mastodon"}); rec.Code != http.StatusBadRequest {
		t.Errorf("unknown share channel: %d", rec.Code)
	}

	summary := decode[stats.Summary](t, c.do(http.MethodGet, "/api/admin/stats/summary", nil))
	if summary.PostsPublished != 1 || summary.ViewsToday != 1 || summary.TotalLikes != 1 {
		t.Errorf("summary = %+v", summary)
	}

	rec = c.do(http.MethodPost, "/api/admin/posts", post.Input{Title: "Other", Slug: "hello", Status: post.StatusDraft})
	if rec.Code != http.StatusConflict {
		t.Errorf("duplicate slug: %d", rec.Code)
	}
	rec = c.do(http.MethodPost, "/api/admin/posts", post.Input{Title: "", Status: post.StatusDraft})
	if rec.Code != http.StatusBadRequest {
		t.Errorf("empty title: %d", rec.Code)
	}

	if rec := c.do(http.MethodDelete, "/api/admin/posts/"+itoa(created.ID), nil); rec.Code != http.StatusNoContent {
		t.Errorf("delete: %d", rec.Code)
	}
	if rec := c.do(http.MethodGet, "/api/posts/hello", nil); rec.Code != http.StatusNotFound {
		t.Errorf("deleted post still public: %d", rec.Code)
	}
}

func TestUploadAndServe(t *testing.T) {
	c := newClient(t)
	c.login()

	var img bytes.Buffer
	png.Encode(&img, image.NewRGBA(image.Rect(0, 0, 8, 8)))
	upload := func(data []byte) *httptest.ResponseRecorder {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		part, _ := w.CreateFormFile("file", "photo.png")
		part.Write(data)
		w.Close()
		req := httptest.NewRequest(http.MethodPost, "/api/admin/uploads", &body)
		req.Header.Set("Content-Type", w.FormDataContentType())
		req.Header.Set("Origin", origin)
		req.AddCookie(c.cookie)
		rec := httptest.NewRecorder()
		c.handler.ServeHTTP(rec, req)
		return rec
	}

	rec := upload(img.Bytes())
	if rec.Code != http.StatusCreated {
		t.Fatalf("upload: %d %s", rec.Code, rec.Body)
	}
	url := decode[struct{ URL string }](t, rec).URL

	rec = c.do(http.MethodGet, url, nil)
	if rec.Code != http.StatusOK || rec.Header().Get("Content-Type") != "image/png" {
		t.Errorf("serve: %d %q", rec.Code, rec.Header().Get("Content-Type"))
	}
	if rec := c.do(http.MethodGet, "/api/uploads/..%2Fsecret.png", nil); rec.Code != http.StatusNotFound {
		t.Errorf("traversal: %d", rec.Code)
	}

	if rec := upload([]byte("<script>alert(1)</script>")); rec.Code != http.StatusUnsupportedMediaType {
		t.Errorf("html upload: %d", rec.Code)
	}
	if rec := upload(make([]byte, 2<<20)); rec.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("oversized upload: %d", rec.Code)
	}
}

func itoa(id uint) string {
	return strconv.FormatUint(uint64(id), 10)
}
