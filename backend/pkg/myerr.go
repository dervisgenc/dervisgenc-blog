package myerr

import (
	"errors"
	"net/http"
)

type statusErr struct {
	error
	status int
}

// HTTPStatus returns the 	 error.
func (e *statusErr) Unwrap() error { return e.error }

// HTTPStatus returns the HTTP status included in err. If err is nil, this
// function returns 0. If err is non-nil, and does not include an HTTP status,
// a default value of [net/http.StatusInternalServerError] is returned.
func HTTPStatus(err error) int {
	if err == nil {
		return 0
	}
	var statusErr interface {
		error
		HTTPStatus() int
	}
	if errors.As(err, &statusErr) {
		return statusErr.HTTPStatus()
	}
	return http.StatusInternalServerError
}

// WithHTTPStatus returns an error with the given HTTP status code. If err is
// nil, this function returns nil. If err is non-nil, and does not include an
// HTTP status, a new error is returned with the given status code.
func WithHTTPStatus(err error, status int) error {
	return &statusErr{err, status}
}
