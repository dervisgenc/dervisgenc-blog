package visitor

import (
	"testing"
	"time"
)

func TestHasher(t *testing.T) {
	h := NewHasher([]byte("secret"))
	day := time.Date(2026, 10, 18, 0, 0, 0, 0, time.UTC)

	if h.Stable("192.0.2.1") != h.Stable("192.0.2.1") {
		t.Error("Stable is not deterministic")
	}
	if h.Stable("192.0.2.1") == h.Stable("192.0.2.2") {
		t.Error("Stable collides for different IPs")
	}
	if h.Daily(day, "192.0.2.1", "ua") == h.Daily(day.AddDate(0, 0, 1), "192.0.2.1", "ua") {
		t.Error("Daily links the same visitor across days")
	}
	if h.Daily(day, "192.0.2.1", "ua") == h.Daily(day, "192.0.2.1", "other") {
		t.Error("Daily ignores the user agent")
	}
	if NewHasher([]byte("other")).Stable("192.0.2.1") == h.Stable("192.0.2.1") {
		t.Error("hash does not depend on the secret")
	}
	if got := len(h.Stable("192.0.2.1")); got != 32 {
		t.Errorf("hash length = %d, want 32", got)
	}
}
