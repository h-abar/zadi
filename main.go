package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image/color"
	"image/png"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/fogleman/gg"
)

// ============================================================
// Data Models
// ============================================================

type Item struct {
	Type     string `json:"type"`
	Text     string `json:"text"`
	Source   string `json:"source"`
	FullAyah string `json:"full_ayah"`
}

type Category struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
	Items []Item `json:"items"`
}

type AdhkarData struct {
	Categories []Category `json:"categories"`
}

type APIResponse struct {
	Success  bool   `json:"success"`
	Category string `json:"category,omitempty"`
	Type     string `json:"type"`
	Text     string `json:"text"`
	Source   string `json:"source"`
	FullAyah string `json:"full_ayah,omitempty"`
}

type CategoriesResponse struct {
	Success    bool            `json:"success"`
	Categories []CategoryBrief `json:"categories"`
}

type CategoryBrief struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Count int    `json:"count"`
}

var data AdhkarData

// ============================================================
// Data Loading
// ============================================================

func loadData() error {
	file, err := os.ReadFile("data/adhkar.json")
	if err != nil {
		return err
	}
	return json.Unmarshal(file, &data)
}

// ============================================================
// Helpers
// ============================================================

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func pickRandom(categoryID string) (Item, string, bool) {
	type entry struct {
		item     Item
		category string
	}
	var pool []entry

	for _, cat := range data.Categories {
		if categoryID != "" && cat.ID != categoryID {
			continue
		}
		for _, item := range cat.Items {
			pool = append(pool, entry{item, cat.Label})
		}
	}

	if len(pool) == 0 {
		return Item{}, "", false
	}

	picked := pool[rand.Intn(len(pool))]
	return picked.item, picked.category, true
}

// ============================================================
// API Handlers
// ============================================================

func randomDhikrHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	categoryID := r.URL.Query().Get("category")
	item, catLabel, ok := pickRandom(categoryID)

	if !ok {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Text:    "لا توجد نتائج للتصنيف المطلوب",
		})
		return
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success:  true,
		Category: catLabel,
		Type:     item.Type,
		Text:     item.Text,
		Source:   item.Source,
		FullAyah: item.FullAyah,
	})
}

func categoriesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	var cats []CategoryBrief
	for _, cat := range data.Categories {
		cats = append(cats, CategoryBrief{
			ID:    cat.ID,
			Label: cat.Label,
			Icon:  cat.Icon,
			Count: len(cat.Items),
		})
	}
	json.NewEncoder(w).Encode(CategoriesResponse{
		Success:    true,
		Categories: cats,
	})
}

func categoryItemsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	categoryID := r.URL.Query().Get("id")
	if categoryID == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "يرجى تحديد التصنيف",
		})
		return
	}

	for _, cat := range data.Categories {
		if cat.ID == categoryID {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":  true,
				"category": cat.Label,
				"items":    cat.Items,
			})
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   "التصنيف غير موجود",
	})
}

// ============================================================
// Image Generation with fogleman/gg
// ============================================================

// hexToColor converts a hex string like "#c9a84c" to color.RGBA
func hexToColor(hex string) color.RGBA {
	hex = strings.TrimPrefix(hex, "#")
	var r, g, b uint8
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return color.RGBA{r, g, b, 255}
}

// drawIslamicPattern draws decorative geometric patterns on the canvas
func drawIslamicPattern(dc *gg.Context, w, h float64) {
	// Subtle radial glow — top left (warm gold)
	for i := 0; i < 80; i++ {
		t := float64(i) / 80.0
		radius := 300 * (1 - t)
		dc.DrawCircle(w*0.15, h*0.15, radius)
		dc.SetRGBA(0.79, 0.66, 0.30, 0.008*(1-t))
		dc.Fill()
	}

	// Subtle radial glow — bottom right (cool blue)
	for i := 0; i < 80; i++ {
		t := float64(i) / 80.0
		radius := 300 * (1 - t)
		dc.DrawCircle(w*0.85, h*0.85, radius)
		dc.SetRGBA(0.29, 0.56, 0.64, 0.006*(1-t))
		dc.Fill()
	}

	// Islamic star pattern (8-pointed stars scattered subtly)
	dc.SetRGBA(0.79, 0.66, 0.30, 0.03)
	dc.SetLineWidth(1)
	starPositions := [][2]float64{
		{w * 0.1, h * 0.08}, {w * 0.9, h * 0.08},
		{w * 0.1, h * 0.92}, {w * 0.9, h * 0.92},
		{w * 0.5, h * 0.05}, {w * 0.5, h * 0.95},
	}
	for _, pos := range starPositions {
		drawEightPointStar(dc, pos[0], pos[1], 30, 15)
	}

	// Horizontal ornamental lines
	dc.SetRGBA(0.79, 0.66, 0.30, 0.12)
	dc.SetLineWidth(1.5)

	// Top line with fade
	topY := h * 0.2
	drawFadeLine(dc, w, topY)

	// Bottom line with fade
	bottomY := h * 0.8
	drawFadeLine(dc, w, bottomY)

	// Corner L-brackets (Islamic frame corners)
	cornerSize := 50.0
	dc.SetRGBA(0.79, 0.66, 0.30, 0.15)
	dc.SetLineWidth(2)

	// Top-left
	margin := 40.0
	dc.DrawLine(margin, topY-cornerSize, margin, topY)
	dc.DrawLine(margin, topY, margin+cornerSize, topY)
	dc.Stroke()

	// Top-right
	dc.DrawLine(w-margin, topY-cornerSize, w-margin, topY)
	dc.DrawLine(w-margin, topY, w-margin-cornerSize, topY)
	dc.Stroke()

	// Bottom-left
	dc.DrawLine(margin, bottomY+cornerSize, margin, bottomY)
	dc.DrawLine(margin, bottomY, margin+cornerSize, bottomY)
	dc.Stroke()

	// Bottom-right
	dc.DrawLine(w-margin, bottomY+cornerSize, w-margin, bottomY)
	dc.DrawLine(w-margin, bottomY, w-margin-cornerSize, bottomY)
	dc.Stroke()

	// Small diamond ornaments at line centers
	dc.SetRGBA(0.79, 0.66, 0.30, 0.2)
	drawDiamond(dc, w/2, topY, 8)
	drawDiamond(dc, w/2, bottomY, 8)
}

// drawEightPointStar draws an 8-pointed Islamic star
func drawEightPointStar(dc *gg.Context, cx, cy, outerR, innerR float64) {
	points := 8
	for i := 0; i < points*2; i++ {
		angle := float64(i) * math.Pi / float64(points) - math.Pi/2
		r := outerR
		if i%2 == 1 {
			r = innerR
		}
		x := cx + r*math.Cos(angle)
		y := cy + r*math.Sin(angle)
		if i == 0 {
			dc.MoveTo(x, y)
		} else {
			dc.LineTo(x, y)
		}
	}
	dc.ClosePath()
	dc.Stroke()
}

// drawFadeLine draws a horizontal line that fades at the edges
func drawFadeLine(dc *gg.Context, w, y float64) {
	segments := 100
	segW := w / float64(segments)
	for i := 0; i < segments; i++ {
		t := float64(i) / float64(segments)
		// Fade at edges: sin curve for smooth fade
		alpha := math.Sin(t * math.Pi)
		dc.SetRGBA(0.79, 0.66, 0.30, 0.15*alpha)
		dc.DrawLine(float64(i)*segW, y, float64(i+1)*segW, y)
		dc.Stroke()
	}
}

// drawDiamond draws a small diamond shape
func drawDiamond(dc *gg.Context, cx, cy, size float64) {
	dc.MoveTo(cx, cy-size)
	dc.LineTo(cx+size, cy)
	dc.LineTo(cx, cy+size)
	dc.LineTo(cx-size, cy)
	dc.ClosePath()
	dc.Fill()
}

// reverseRunes reverses a string at the rune level to fix RTL rendering
// in fogleman/gg which only supports LTR text layout.
func reverseRunes(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// drawRTL draws Arabic/RTL text centered horizontally using rune-reversal
func drawRTL(dc *gg.Context, text string, cx, y float64) {
	reversed := reverseRunes(text)
	tw, _ := dc.MeasureString(reversed)
	dc.DrawString(reversed, cx-tw/2, y)
}

// wrapTextRTL wraps Arabic text into lines that fit within maxWidth
func wrapTextRTL(dc *gg.Context, text string, maxWidth float64) []string {
	words := strings.Fields(text)
	var lines []string
	currentLine := ""

	for _, word := range words {
		testLine := word
		if currentLine != "" {
			testLine = currentLine + " " + word
		}
		tw, _ := dc.MeasureString(testLine)
		if tw > maxWidth && currentLine != "" {
			lines = append(lines, currentLine)
			currentLine = word
		} else {
			currentLine = testLine
		}
	}
	if currentLine != "" {
		lines = append(lines, currentLine)
	}
	return lines
}

// generateCardImage creates a beautiful phone wallpaper card (1080x1920)
func generateCardImage(item Item, categoryLabel string) (*bytes.Buffer, error) {
	const W = 1080
	const H = 1920

	dc := gg.NewContext(W, H)

	// === Background: deep dark blue gradient ===
	for y := 0; y < H; y++ {
		t := float64(y) / float64(H)
		// Gradient from dark navy to slightly lighter, back to dark
		r := 10 + 7*math.Sin(t*math.Pi)
		g := 22 + 11*math.Sin(t*math.Pi)
		b := 40 + 13*math.Sin(t*math.Pi)
		dc.SetRGB(r/255, g/255, b/255)
		dc.DrawLine(0, float64(y), W, float64(y))
		dc.Stroke()
	}

	// === Islamic decorative patterns ===
	drawIslamicPattern(dc, W, H)

	// === Load Arabic font ===
	// Try multiple common Arabic font paths
	fontPaths := []string{
		"fonts/Amiri-Regular.ttf",
		"fonts/NotoNaskhArabic-Regular.ttf",
		"/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf",
		"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
		"C:\\Windows\\Fonts\\arial.ttf",
	}

	fontLoaded := false
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 54); err == nil {
			fontLoaded = true
			break
		}
	}
	if !fontLoaded {
		return nil, fmt.Errorf("لم يتم العثور على خط عربي مناسب — ضع خط Amiri في مجلد fonts/")
	}

	// === Type badge ===
	typeText := "ذكر مأثور"
	if item.Type == "quran" {
		typeText = "قرآن كريم"
	}

	// Reload font at smaller size for badge
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 30); err == nil {
			break
		}
	}
	dc.SetRGBA(0.79, 0.66, 0.30, 0.6)
	drawRTL(dc, typeText, W/2, H*0.24)

	// === Main dhikr text ===
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 54); err == nil {
			break
		}
	}
	dc.SetRGB(0.91, 0.86, 0.78) // #e8dcc8

	lines := wrapTextRTL(dc, item.Text, W-140)
	lineHeight := 105.0
	totalH := float64(len(lines)) * lineHeight
	startY := (H/2.0 - totalH/2.0) + 40

	for i, line := range lines {
		y := startY + float64(i)*lineHeight
		drawRTL(dc, line, W/2, y)
	}

	// === Source text ===
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 28); err == nil {
			break
		}
	}
	dc.SetRGBA(0.42, 0.38, 0.35, 0.8)
	sourceText := "— " + item.Source
	drawRTL(dc, sourceText, W/2, startY+totalH+60)

	// === Category label ===
	if categoryLabel != "" {
		for _, fp := range fontPaths {
			if err := dc.LoadFontFace(fp, 24); err == nil {
				break
			}
		}
		dc.SetRGBA(0.79, 0.66, 0.30, 0.35)
		drawRTL(dc, categoryLabel, W/2, startY+totalH+110)
	}

	// === Branding at bottom ===
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 26); err == nil {
			break
		}
	}
	dc.SetRGBA(0.79, 0.66, 0.30, 0.35)
	brand := "زادي — za-di.com"
	drawRTL(dc, brand, W/2, H-180)

	dc.SetRGBA(0.66, 0.61, 0.55, 0.25)
	for _, fp := range fontPaths {
		if err := dc.LoadFontFace(fp, 20); err == nil {
			break
		}
	}
	sub := "صدقة جارية تقنية لأمي وأمهات المسلمين"
	drawRTL(dc, sub, W/2, H-140)

	// === Encode to PNG ===
	var buf bytes.Buffer
	if err := png.Encode(&buf, dc.Image()); err != nil {
		return nil, err
	}
	return &buf, nil
}

// generateCardHandler serves GET /api/generate-card?category=stress
func generateCardHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	categoryID := r.URL.Query().Get("category")
	item, catLabel, ok := pickRandom(categoryID)
	if !ok {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "لا توجد نتائج",
		})
		return
	}

	buf, err := generateCardImage(item, catLabel)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Build a safe filename from first few chars of dhikr text
	safeLen := 20
	if utf8.RuneCountInString(item.Text) < safeLen {
		safeLen = utf8.RuneCountInString(item.Text)
	}
	runes := []rune(item.Text)[:safeLen]
	safeName := strings.ReplaceAll(string(runes), " ", "_")

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="zadi_%s.png"`, safeName))
	w.Header().Set("Cache-Control", "no-cache")
	w.Write(buf.Bytes())
}

// ============================================================
// Main
// ============================================================

func main() {
	rand.New(rand.NewSource(time.Now().UnixNano()))

	if err := loadData(); err != nil {
		log.Fatalf("خطأ في تحميل البيانات: %v", err)
	}

	log.Printf("تم تحميل %d تصنيفات بنجاح", len(data.Categories))

	// API routes
	http.HandleFunc("/api/random-dhikr", randomDhikrHandler)
	http.HandleFunc("/api/categories", categoriesHandler)
	http.HandleFunc("/api/category", categoryItemsHandler)
	http.HandleFunc("/api/generate-card", generateCardHandler)

	// Static files with www redirect middleware
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", wwwRedirect(fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🕌 زادي (za-di.com) يعمل على المنفذ %s\n", port)
	fmt.Printf("🌐 افتح المتصفح: http://localhost:%s\n", port)
	fmt.Printf("📡 API: http://localhost:%s/api/random-dhikr\n", port)
	fmt.Printf("🖼️  بطاقة: http://localhost:%s/api/generate-card\n", port)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// wwwRedirect middleware redirects non-www requests to www
func wwwRedirect(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if host is not localhost and doesn't start with www
		host := r.Host
		if host != "" && !strings.HasPrefix(host, "www.") && !strings.HasPrefix(host, "localhost") && !strings.HasPrefix(host, "127.") {
			// Redirect to www version
			wwwURL := "https://www." + host + r.URL.Path
			if r.URL.RawQuery != "" {
				wwwURL += "?" + r.URL.RawQuery
			}
			http.Redirect(w, r, wwwURL, http.StatusMovedPermanently)
			return
		}
		handler.ServeHTTP(w, r)
	})
}
