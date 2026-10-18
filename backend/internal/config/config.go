// Package config loads and validates the application configuration from
// environment variables.
package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const minSecretLength = 32

// Config holds every setting the application needs at runtime.
type Config struct {
	HTTPAddr string
	// PublicURL is the origin the site is served from. Admin requests that
	// change state must carry it as their Origin.
	PublicURL      string
	TrustedProxies []string

	Database Database
	Auth     Auth
	Uploads  Uploads

	// StatsLocation is the time zone used to bucket statistics into days.
	StatsLocation *time.Location
}

// Database holds the PostgreSQL connection settings.
type Database struct {
	Host           string
	Port           string
	User           string
	Password       string
	Name           string
	SSLMode        string
	ConnectTimeout time.Duration
}

// Auth holds the admin session settings.
type Auth struct {
	// Secret signs session tokens and keys the visitor hashes.
	Secret       []byte
	SessionTTL   time.Duration
	SecureCookie bool
}

// Uploads holds the image upload settings.
type Uploads struct {
	Dir      string
	MaxBytes int64
}

// Load reads the configuration from the environment and validates it.
func Load() (*Config, error) {
	var errs []error
	collect := func(err error) {
		if err != nil {
			errs = append(errs, err)
		}
	}

	cfg := &Config{
		HTTPAddr:       getEnv("HTTP_ADDR", ":8080"),
		PublicURL:      strings.TrimRight(getEnv("PUBLIC_URL", "https://blog.dervisgenc.com"), "/"),
		TrustedProxies: splitList(getEnv("TRUSTED_PROXIES", "127.0.0.1,::1")),
		Auth:           Auth{Secret: []byte(os.Getenv("JWT_SECRET"))},
		Uploads:        Uploads{Dir: getEnv("UPLOAD_DIR", "data/uploads")},
	}

	var err error
	cfg.Database, err = LoadDatabase()
	collect(err)
	cfg.Auth.SessionTTL, err = getDuration("SESSION_TTL", 12*time.Hour)
	collect(err)
	cfg.Auth.SecureCookie, err = getBool("COOKIE_SECURE", true)
	collect(err)
	cfg.Uploads.MaxBytes, err = getInt("UPLOAD_MAX_BYTES", 10<<20)
	collect(err)
	cfg.StatsLocation, err = time.LoadLocation(getEnv("STATS_TIMEZONE", "Europe/Istanbul"))
	collect(err)

	collect(cfg.validate())

	if err := errors.Join(errs...); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}
	return cfg, nil
}

// LoadDatabase reads only the database settings, for tools that need
// nothing else.
func LoadDatabase() (Database, error) {
	db := Database{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Name:     getEnv("DB_NAME", "blog"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}

	var errs []error
	if db.User == "" {
		errs = append(errs, errors.New("DB_USER is required"))
	}
	var err error
	if db.ConnectTimeout, err = getDuration("DB_CONNECT_TIMEOUT", time.Minute); err != nil {
		errs = append(errs, err)
	}
	return db, errors.Join(errs...)
}

func (c *Config) validate() error {
	var errs []error
	if len(c.Auth.Secret) < minSecretLength {
		errs = append(errs, fmt.Errorf("JWT_SECRET must be at least %d characters", minSecretLength))
	}
	if c.Auth.SessionTTL <= 0 {
		errs = append(errs, errors.New("SESSION_TTL must be positive"))
	}
	if c.Uploads.MaxBytes <= 0 {
		errs = append(errs, errors.New("UPLOAD_MAX_BYTES must be positive"))
	}
	if u, err := url.Parse(c.PublicURL); err != nil || u.Scheme == "" || u.Host == "" || u.Path != "" {
		errs = append(errs, errors.New("PUBLIC_URL must be an origin such as https://blog.example.com"))
	}
	return errors.Join(errs...)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}

func getBool(key string, fallback bool) (bool, error) {
	raw := getEnv(key, "")
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return false, fmt.Errorf("%s: %w", key, err)
	}
	return value, nil
}

func getInt(key string, fallback int64) (int64, error) {
	raw := getEnv(key, "")
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", key, err)
	}
	return value, nil
}

func getDuration(key string, fallback time.Duration) (time.Duration, error) {
	raw := getEnv(key, "")
	if raw == "" {
		return fallback, nil
	}
	value, err := time.ParseDuration(raw)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", key, err)
	}
	return value, nil
}

func splitList(raw string) []string {
	var items []string
	for _, item := range strings.Split(raw, ",") {
		if item = strings.TrimSpace(item); item != "" {
			items = append(items, item)
		}
	}
	return items
}
