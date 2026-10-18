package auth

import (
	"net/http"

	"github.com/dervisgenc/dervisgenc-blog/backend/internal/httpx"
	"github.com/gin-gonic/gin"
)

const claimsKey = "auth.claims"

// RequireAdmin rejects requests without a valid session cookie.
func RequireAdmin(tokens *TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie(CookieName)
		if err != nil || cookie == "" {
			httpx.Error(c, http.StatusUnauthorized, "not signed in")
			return
		}

		claims, err := tokens.Verify(cookie)
		if err != nil {
			httpx.Error(c, http.StatusUnauthorized, "session expired, sign in again")
			return
		}
		c.Set(claimsKey, claims)
		c.Next()
	}
}

// CurrentAdmin returns the session of a request that passed RequireAdmin.
func CurrentAdmin(c *gin.Context) Claims {
	claims, _ := c.MustGet(claimsKey).(Claims)
	return claims
}

// SameOrigin rejects state-changing requests sent from another site. The
// session cookie is already SameSite=Strict; this is defence in depth for
// browsers or proxies that do not honour it.
func SameOrigin(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			c.Next()
			return
		}

		// Browsers send Origin on every non-GET fetch; a request without it
		// and without Sec-Fetch-Site does not come from the admin panel.
		got, site := c.GetHeader("Origin"), c.GetHeader("Sec-Fetch-Site")
		if got != origin && !(got == "" && site == "same-origin") {
			httpx.Error(c, http.StatusForbidden, "cross-origin request rejected")
			return
		}
		c.Next()
	}
}
