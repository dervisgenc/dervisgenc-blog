package post

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"
)

const (
	maxTitleLength   = 200
	maxSummaryLength = 500
	maxContentBytes  = 512 << 10
	maxTags          = 10
	maxTagLength     = 32
	wordsPerMinute   = 200
)

// uploadPath matches image URLs returned by the upload endpoint.
var uploadPath = regexp.MustCompile(`^/api/uploads/[A-Za-z0-9_-]+\.(jpg|png)$`)

// ValidationError reports input the client has to correct.
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func invalid(format string, args ...any) error {
	return &ValidationError{Message: fmt.Sprintf(format, args...)}
}

// Input is what the admin submits when creating or updating a post.
type Input struct {
	Title         string   `json:"title"`
	Slug          string   `json:"slug"`
	Summary       string   `json:"summary"`
	Content       string   `json:"content"`
	CoverImageURL string   `json:"cover_image_url"`
	Tags          []string `json:"tags"`
	Status        Status   `json:"status"`
}

// normalize trims the input and brings the slug and tags into canonical form.
func (in *Input) normalize() {
	in.Title = strings.TrimSpace(in.Title)
	in.Summary = strings.TrimSpace(in.Summary)
	in.CoverImageURL = strings.TrimSpace(in.CoverImageURL)
	in.Content = strings.TrimRight(in.Content, " \t\r\n")
	if in.Slug != "" {
		in.Slug = Slugify(in.Slug)
	}

	seen := make(map[string]bool, len(in.Tags))
	tags := make([]string, 0, len(in.Tags))
	for _, tag := range in.Tags {
		tag = strings.Join(strings.Fields(strings.ToLower(tag)), " ")
		if tag != "" && !seen[tag] {
			seen[tag] = true
			tags = append(tags, tag)
		}
	}
	in.Tags = tags
}

func (in *Input) validate() error {
	var errs []error
	switch n := utf8.RuneCountInString(in.Title); {
	case n == 0:
		errs = append(errs, invalid("title is required"))
	case n > maxTitleLength:
		errs = append(errs, invalid("title must be at most %d characters", maxTitleLength))
	}
	if utf8.RuneCountInString(in.Summary) > maxSummaryLength {
		errs = append(errs, invalid("summary must be at most %d characters", maxSummaryLength))
	}
	if len(in.Content) > maxContentBytes {
		errs = append(errs, invalid("content must be at most %d KB", maxContentBytes>>10))
	}
	switch in.Status {
	case StatusDraft:
	case StatusPublished:
		if strings.TrimSpace(in.Content) == "" {
			errs = append(errs, invalid("content is required to publish"))
		}
	default:
		errs = append(errs, invalid("status must be %q or %q", StatusDraft, StatusPublished))
	}
	if len(in.Tags) > maxTags {
		errs = append(errs, invalid("a post can have at most %d tags", maxTags))
	}
	for _, tag := range in.Tags {
		if utf8.RuneCountInString(tag) > maxTagLength || strings.ContainsAny(tag, ",/?#") {
			errs = append(errs, invalid("tag %q must be at most %d characters without , / ? #", tag, maxTagLength))
		}
	}
	if !validCoverURL(in.CoverImageURL) {
		errs = append(errs, invalid("cover image must be an uploaded image or an https URL"))
	}

	if len(errs) == 0 {
		return nil
	}
	messages := make([]string, len(errs))
	for i, err := range errs {
		messages[i] = err.Error()
	}
	return &ValidationError{Message: strings.Join(messages, "; ")}
}

func validCoverURL(raw string) bool {
	if raw == "" || uploadPath.MatchString(raw) {
		return true
	}
	u, err := url.Parse(raw)
	return err == nil && u.Scheme == "https" && u.Host != "" && len(raw) <= 500
}

// readingMinutes estimates how long the Markdown content takes to read.
func readingMinutes(content string) int {
	words := len(strings.Fields(content))
	return max(1, (words+wordsPerMinute-1)/wordsPerMinute)
}

// IsValidation reports whether err is a ValidationError.
func IsValidation(err error) bool {
	var v *ValidationError
	return errors.As(err, &v)
}
