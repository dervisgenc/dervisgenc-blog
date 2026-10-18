package media

import (
	"bytes"
	"errors"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"os"
	"strings"
	"testing"
)

func encodePNG(t *testing.T, img image.Image) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func TestSaveScalesAndReencodes(t *testing.T) {
	store, err := NewStore(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	src := image.NewRGBA(image.Rect(0, 0, MaxWidth*2, 1000))
	for i := range src.Pix {
		src.Pix[i] = 0xff // opaque white
	}

	img, err := store.Save(bytes.NewReader(encodePNG(t, src)))
	if err != nil {
		t.Fatalf("Save: %v", err)
	}
	if img.Width != MaxWidth || img.Height != 500 {
		t.Errorf("size = %dx%d, want %dx500", img.Width, img.Height, MaxWidth)
	}
	if !strings.HasSuffix(img.Name, ".jpg") || !fileName.MatchString(img.Name) {
		t.Errorf("name = %q, want a random .jpg name", img.Name)
	}

	f, err := os.Open(store.Path(img.Name))
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	if _, err := jpeg.Decode(f); err != nil {
		t.Errorf("stored file is not a JPEG: %v", err)
	}
}

func TestSaveKeepsTransparencyAsPNG(t *testing.T) {
	store, _ := NewStore(t.TempDir())
	src := image.NewNRGBA(image.Rect(0, 0, 10, 10))
	src.Set(0, 0, color.NRGBA{R: 255, A: 128})

	img, err := store.Save(bytes.NewReader(encodePNG(t, src)))
	if err != nil {
		t.Fatalf("Save: %v", err)
	}
	if !strings.HasSuffix(img.Name, ".png") {
		t.Errorf("name = %q, want .png for a transparent image", img.Name)
	}
}

func TestSaveRejectsNonImages(t *testing.T) {
	store, _ := NewStore(t.TempDir())
	inputs := map[string][]byte{
		"html":      []byte("<html><script>alert(1)</script></html>"),
		"svg":       []byte(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`),
		"truncated": encodePNG(t, image.NewRGBA(image.Rect(0, 0, 4, 4)))[:20],
	}
	for name, data := range inputs {
		t.Run(name, func(t *testing.T) {
			if _, err := store.Save(bytes.NewReader(data)); !errors.Is(err, ErrUnsupported) {
				t.Errorf("Save() error = %v, want ErrUnsupported", err)
			}
		})
	}
}
