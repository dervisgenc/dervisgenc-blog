package config

import (
	"strings"
	"testing"
	"time"
)

func setValidEnv(t *testing.T) {
	t.Setenv("DB_USER", "blog")
	t.Setenv("JWT_SECRET", strings.Repeat("s", minSecretLength))
	t.Setenv("PUBLIC_URL", "https://blog.example.com/")
}

func TestLoadDefaults(t *testing.T) {
	setValidEnv(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.PublicURL != "https://blog.example.com" {
		t.Errorf("PublicURL = %q, trailing slash not trimmed", cfg.PublicURL)
	}
	if cfg.Auth.SessionTTL != 12*time.Hour {
		t.Errorf("SessionTTL = %v, want 12h", cfg.Auth.SessionTTL)
	}
	if !cfg.Auth.SecureCookie {
		t.Error("SecureCookie should default to true")
	}
	if cfg.StatsLocation.String() != "Europe/Istanbul" {
		t.Errorf("StatsLocation = %v", cfg.StatsLocation)
	}
}

func TestLoadRejectsInvalid(t *testing.T) {
	tests := map[string][2]string{
		"short secret":     {"JWT_SECRET", "too-short"},
		"missing db user":  {"DB_USER", ""},
		"bad ttl":          {"SESSION_TTL", "soon"},
		"negative ttl":     {"SESSION_TTL", "-1h"},
		"bad bool":         {"COOKIE_SECURE", "maybe"},
		"bad timezone":     {"STATS_TIMEZONE", "Mars/Olympus"},
		"url with path":    {"PUBLIC_URL", "https://example.com/blog"},
		"url no scheme":    {"PUBLIC_URL", "example.com"},
		"bad upload limit": {"UPLOAD_MAX_BYTES", "0"},
	}
	for name, kv := range tests {
		t.Run(name, func(t *testing.T) {
			setValidEnv(t)
			t.Setenv(kv[0], kv[1])
			if _, err := Load(); err == nil {
				t.Errorf("Load accepted %s=%q", kv[0], kv[1])
			}
		})
	}
}
