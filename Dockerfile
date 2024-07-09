FROM golang:1.21.7-alpine AS builder

WORKDIR /app

RUN apk add --no-cache make

COPY --chown=app:app . .

RUN make build
RUN make migrate-up

FROM alpine:3.20.0

COPY --from=builder /app/bin /

CMD ["/chapiteau"]