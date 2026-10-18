// Package visitor derives anonymous visitor identifiers, so that likes and
// views can be deduplicated without storing IP addresses.
package visitor

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"time"
)

// Hasher turns client attributes into keyed, irreversible identifiers.
type Hasher struct {
	key []byte
}

// NewHasher derives the hashing key from secret, so the same secret can be
// shared with other uses without the outputs being related.
func NewHasher(secret []byte) *Hasher {
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte("visitor-id"))
	return &Hasher{key: mac.Sum(nil)}
}

// Stable identifies a client by IP address across days. It is used for
// likes, which must survive until the visitor takes them back.
func (h *Hasher) Stable(ip string) string {
	return h.sum("stable", ip)
}

// Daily identifies a client for one day only, so identifiers from different
// days cannot be linked. It is used to count unique visitors and views.
func (h *Hasher) Daily(day time.Time, ip, userAgent string) string {
	return h.sum("daily", day.Format(time.DateOnly), ip, userAgent)
}

func (h *Hasher) sum(parts ...string) string {
	mac := hmac.New(sha256.New, h.key)
	for _, part := range parts {
		mac.Write([]byte(part))
		mac.Write([]byte{0})
	}
	return hex.EncodeToString(mac.Sum(nil)[:16])
}
