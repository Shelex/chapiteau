FROM golang:1.21.7-alpine AS builder

WORKDIR /app

RUN apk add --no-cache make
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

COPY --chown=app:app . .

RUN make build
RUN make migrate-up

FROM alpine:3.20.0

COPY --from=builder /app/bin /

CMD ["/chapiteau"]