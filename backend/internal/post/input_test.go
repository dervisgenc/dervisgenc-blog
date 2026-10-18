package post

import (
	"slices"
	"strings"
	"testing"
)

func validInput() Input {
	return Input{Title: "Title", Content: "Body", Status: StatusPublished}
}

func TestNormalize(t *testing.T) {
	in := Input{
		Title: "  Title ",
		Slug:  "My Custom Slug",
		Tags:  []string{" Go ", "go", "Linux  Kernel", "", "GO"},
	}
	in.normalize()

	if in.Title != "Title" {
		t.Errorf("Title = %q", in.Title)
	}
	if in.Slug != "my-custom-slug" {
		t.Errorf("Slug = %q", in.Slug)
	}
	if want := []string{"go", "linux kernel"}; !slices.Equal(in.Tags, want) {
		t.Errorf("Tags = %q, want %q", in.Tags, want)
	}
}

func TestValidate(t *testing.T) {
	tests := map[string]func(*Input){
		"empty title":          func(in *Input) { in.Title = "" },
		"long title":           func(in *Input) { in.Title = strings.Repeat("a", maxTitleLength+1) },
		"long summary":         func(in *Input) { in.Summary = strings.Repeat("a", maxSummaryLength+1) },
		"publish without body": func(in *Input) { in.Content = "  " },
		"unknown status":       func(in *Input) { in.Status = "archived" },
		"too many tags":        func(in *Input) { in.Tags = strings.Split("a,b,c,d,e,f,g,h,i,j,k", ",") },
		"tag with slash":       func(in *Input) { in.Tags = []string{"a/b"} },
		"http cover":           func(in *Input) { in.CoverImageURL = "http://example.com/a.jpg" },
		"javascript cover":     func(in *Input) { in.CoverImageURL = "javascript:alert(1)" },
		"traversal cover":      func(in *Input) { in.CoverImageURL = "/api/uploads/../secret.jpg" },
		"other local cover":    func(in *Input) { in.CoverImageURL = "/admin/logo.png" },
		"oversized content":    func(in *Input) { in.Content = strings.Repeat("a", maxContentBytes+1) },
	}
	for name, mutate := range tests {
		t.Run(name, func(t *testing.T) {
			in := validInput()
			mutate(&in)
			if err := in.validate(); !IsValidation(err) {
				t.Errorf("validate() = %v, want a validation error", err)
			}
		})
	}

	accepted := map[string]func(*Input){
		"draft without body": func(in *Input) { in.Status = StatusDraft; in.Content = "" },
		"uploaded cover":     func(in *Input) { in.CoverImageURL = "/api/uploads/0a1b2c.jpg" },
		"https cover":        func(in *Input) { in.CoverImageURL = "https://images.example.com/a.jpg" },
	}
	for name, mutate := range accepted {
		t.Run(name, func(t *testing.T) {
			in := validInput()
			mutate(&in)
			if err := in.validate(); err != nil {
				t.Errorf("validate() = %v", err)
			}
		})
	}
}

func TestReadingMinutes(t *testing.T) {
	tests := map[int]int{0: 1, 1: 1, 200: 1, 201: 2, 1000: 5}
	for words, want := range tests {
		if got := readingMinutes(strings.Repeat("word ", words)); got != want {
			t.Errorf("readingMinutes(%d words) = %d, want %d", words, got, want)
		}
	}
}
