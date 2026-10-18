
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
ENV CGO_ENABLED=0
RUN go build -trimpath -ldflags="-s -w" -o /out/blog ./cmd/blog \
 && go build -trimpath -ldflags="-s -w" -o /out/admin-user ./cmd/admin-user \
 && mkdir -p /out/data/uploads

# distroless/static has no shell or package manager, and runs as an
# unprivileged user (uid 65532).
FROM gcr.io/distroless/static-debian13:nonroot
COPY --from=build /out/blog /out/admin-user /usr/local/bin/
# A new named volume mounted at /data/uploads copies this directory,
# including its ownership, so the server can write to it.
COPY --from=build --chown=65532:65532 /out/data /data
ENV HTTP_ADDR=:8080 \
    UPLOAD_DIR=/data/uploads
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["/usr/local/bin/blog", "healthcheck"]
ENTRYPOINT ["/usr/local/bin/blog"]
