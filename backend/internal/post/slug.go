package post

import (
	"strings"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

const maxSlugLength = 80

// transliterations covers letters that do not decompose into an ASCII base
// letter plus diacritics.
var transliterations = map[rune]string{
	'ı': "i", 'ß': "ss", 'æ': "ae", 'ø': "o", 'đ': "d", 'ł': "l", 'œ': "oe",
}

// Slugify turns text into a URL path segment of lowercase ASCII letters,
// digits and single hyphens, such as "Go'da Bağlam" -> "goda-baglam".
func Slugify(text string) string {
	var b strings.Builder
	pendingHyphen := false
	for _, r := range norm.NFD.String(strings.ToLower(text)) {
		switch {
		case unicode.Is(unicode.Mn, r), r == '\'', r == '’':
			// Drop diacritics and apostrophes without splitting the word.
			continue
		case r < unicode.MaxASCII && (unicode.IsLetter(r) || unicode.IsDigit(r)):
			if pendingHyphen && b.Len() > 0 {
				b.WriteByte('-')
			}
			pendingHyphen = false
			b.WriteRune(r)
		case transliterations[r] != "":
			if pendingHyphen && b.Len() > 0 {
				b.WriteByte('-')
			}
			pendingHyphen = false
			b.WriteString(transliterations[r])
		default:
			pendingHyphen = true
		}
	}
	return truncateSlug(b.String())
}

// truncateSlug shortens slug to maxSlugLength, cutting at a hyphen when
// possible so words stay whole.
func truncateSlug(slug string) string {
	if len(slug) <= maxSlugLength {
		return slug
	}
	slug = slug[:maxSlugLength]
	if i := strings.LastIndexByte(slug, '-'); i > maxSlugLength/2 {
		slug = slug[:i]
	}
	return strings.TrimRight(slug, "-")
}
