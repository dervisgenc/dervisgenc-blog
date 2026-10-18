package ratelimit

import (
	"testing"

	"golang.org/x/time/rate"
)

func TestAllowPerIP(t *testing.T) {
	l := newIPLimiters(rate.Limit(0), 2)

	for i := 0; i < 2; i++ {
		if !l.allow("192.0.2.1") {
			t.Fatalf("request %d rejected within burst", i+1)
		}
	}
	if l.allow("192.0.2.1") {
		t.Error("request past burst allowed")
	}
	if !l.allow("192.0.2.2") {
		t.Error("other IP rejected")
	}
}
