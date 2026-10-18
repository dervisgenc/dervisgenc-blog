package post

import (
	"strings"
	"testing"
)

func TestSlugify(t *testing.T) {
	tests := map[string]string{
		"Hello World":                        "hello-world",
		"  Go'da Bağlam (context) Kullanımı": "goda-baglam-context-kullanimi",
		"İstanbul'da Şık Çözümler":           "istanbulda-sik-cozumler",
		"C++ & Rust: 2026!":                  "c-rust-2026",
		"Ünlü ÖĞRENCİ":                       "unlu-ogrenci",
		"---":                                "",
		"multiple   spaces--and__under":      "multiple-spaces-and-under",
		"Straße":                             "strasse",
	}
	for in, want := range tests {
		if got := Slugify(in); got != want {
			t.Errorf("Slugify(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestSlugifyTruncates(t *testing.T) {
	got := Slugify(strings.Repeat("word ", 40))
	if len(got) > maxSlugLength {
		t.Fatalf("len = %d, want <= %d", len(got), maxSlugLength)
	}
	if strings.HasSuffix(got, "-") || strings.HasSuffix(got, "wor") {
		t.Errorf("slug cut badly: %q", got)
	}
}
