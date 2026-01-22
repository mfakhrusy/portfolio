FROM rust:latest as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/lab-3d-server /usr/local/bin/lab-3d-server

ENV RUST_LOG=guestbook_server=info,tower_http=info
EXPOSE 3000

CMD ["lab-3d-server"]
