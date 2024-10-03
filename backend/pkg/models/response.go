package models

// Returns an error message
type ErrorResponse struct {
	Error string `json:"error"`
}

// Returns a success message
type SuccessResponse struct {
	Message string `json:"message"`
}

// Retuns a JWT token
type TokenResponse struct {
	Token string `json:"token"`
}

// CountResponse represents the count response
type CountResponse struct {
	Count int64 `json:"count" example:"42"`
}
