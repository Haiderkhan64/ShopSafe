{
  description = "ShopSafe – Next.js 15 · Prisma · Sanity · Stripe · Clerk dev shell";

  inputs = {
    nixpkgs.url     = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # ── Pinned versions ───────────────────────────────────────────────────
        nodejs = pkgs.nodejs_22;
        pg     = pkgs.postgresql_16;

        # ── Local Postgres config ─────────────────────────────────────────────
        # All data/socket live inside .devdb/ — no root, no systemd.
        pgPort = "5433";     # non-standard: avoids clashing with any system PG
        pgUser = "postgres";
        pgDb   = "shopsafe";

        # ── Prisma engines ─────────────────────────────────────────────────────
        prismaEnv = {
          PRISMA_QUERY_ENGINE_BINARY             = "${pkgs.prisma-engines}/bin/query-engine";
          PRISMA_SCHEMA_ENGINE_BINARY            = "${pkgs.prisma-engines}/bin/schema-engine";
          # PRISMA_MIGRATION_ENGINE_BINARY is deprecated — SCHEMA_ENGINE takes over
          PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1";
        };

        # ─────────────────────────────────────────────────────────────────────
        # db-up — init cluster (once) + start server + create DB (idempotent)
        # ─────────────────────────────────────────────────────────────────────
        dbUp = pkgs.writeShellScriptBin "db-up" ''
          set -euo pipefail

          PGDATA="$REPO_ROOT/.devdb/data"
          PGRUN="$REPO_ROOT/.devdb/run"
          PGLOG="$REPO_ROOT/.devdb/postgres.log"

          mkdir -p "$PGRUN"

          # ── 1. First-time cluster init ─────────────────────────────────────
          if [[ ! -f "$PGDATA/PG_VERSION" ]]; then
            echo "🗄  Initialising PostgreSQL cluster …"
            ${pg}/bin/initdb \
              --pgdata="$PGDATA"     \
              --username="${pgUser}" \
              --auth=trust           \
              --no-instructions      \
              --encoding=UTF8        \
              --locale=C.UTF-8
            cat >> "$PGDATA/postgresql.conf" <<EOF
unix_socket_directories = '$PGRUN'
port                    = ${pgPort}
log_min_messages        = warning
logging_collector       = off
EOF
            echo "✔  Cluster initialised"
          fi

          # ── 2. Start server (skip if already running) ──────────────────────
          if ${pg}/bin/pg_ctl -D "$PGDATA" status &>/dev/null; then
            echo "✔  PostgreSQL already running (port ${pgPort})"
          else
            echo "▶  Starting PostgreSQL …"
            ${pg}/bin/pg_ctl -D "$PGDATA" -l "$PGLOG" -o "-k $PGRUN" start
            for i in $(seq 1 15); do
              [[ -S "$PGRUN/.s.PGSQL.${pgPort}" ]] && break
              sleep 0.3
            done
          fi

          # ── 3. Create app database (idempotent) ────────────────────────────
          if ! ${pg}/bin/psql \
                -h "$PGRUN" -p ${pgPort} -U ${pgUser} \
                -lqt | cut -d'|' -f1 | grep -qw "${pgDb}"; then
            echo "🏗  Creating database '${pgDb}' …"
            ${pg}/bin/createdb -h "$PGRUN" -p ${pgPort} -U ${pgUser} ${pgDb}
          fi

          echo ""
          echo "  ✓ PostgreSQL ready"
          echo "     socket  : $PGRUN"
          echo "     port    : ${pgPort}"
          echo "     user    : ${pgUser}"
          echo "     database: ${pgDb}"
          echo "     url     : $LOCAL_DATABASE_URL"
          echo ""
          echo "  Next step: db-migrate"
          echo ""
        '';

        # ── db-down ───────────────────────────────────────────────────────────
        dbDown = pkgs.writeShellScriptBin "db-down" ''
          set -euo pipefail
          PGDATA="$REPO_ROOT/.devdb/data"
          if ${pg}/bin/pg_ctl -D "$PGDATA" status &>/dev/null; then
            echo "⏹  Stopping PostgreSQL …"
            ${pg}/bin/pg_ctl -D "$PGDATA" stop -m fast
            echo "✔  Stopped"
          else
            echo "ℹ  PostgreSQL is not running"
          fi
        '';

        # ── db-shell ──────────────────────────────────────────────────────────
        dbShell = pkgs.writeShellScriptBin "db-shell" ''
          set -euo pipefail
          ${pg}/bin/psql \
            -h "$REPO_ROOT/.devdb/run" \
            -p ${pgPort}               \
            -U ${pgUser}               \
            ${pgDb}
        '';

        # ── db-migrate ────────────────────────────────────────────────────────
        # Always uses LOCAL_DATABASE_URL so Prisma Accelerate in DATABASE_URL
        # never interferes. Migrations CANNOT run through Accelerate.
        dbMigrate = pkgs.writeShellScriptBin "db-migrate" ''
          set -euo pipefail
          echo "⏳ Applying Prisma migrations → local Postgres …"
          DATABASE_URL="$LOCAL_DATABASE_URL" \
            npx prisma migrate deploy
          # Regenerate client (uses DATABASE_URL / Accelerate at runtime)
          npx prisma generate
          echo "✔  Migrations applied"
        '';

        # ── db-reset ──────────────────────────────────────────────────────────
        dbReset = pkgs.writeShellScriptBin "db-reset" ''
          set -euo pipefail
          echo "⚠  Resetting local database …"
          DATABASE_URL="$LOCAL_DATABASE_URL" \
            npx prisma migrate reset --force
          echo "✔  Done"
        '';

        # ── db-studio ─────────────────────────────────────────────────────────
        # Prisma Studio also needs a direct connection, not Accelerate
        dbStudio = pkgs.writeShellScriptBin "db-studio" ''
          set -euo pipefail
          echo "🔍 Opening Prisma Studio → local Postgres …"
          DATABASE_URL="$LOCAL_DATABASE_URL" \
            npx prisma studio
        '';

        # ── dev-setup ─────────────────────────────────────────────────────────
        devSetup = pkgs.writeShellScriptBin "dev-setup" ''
          set -euo pipefail
          echo "📦 Installing npm dependencies …"
          npm install
          echo "⚙  Generating Prisma client …"
          npx prisma generate
          echo ""
          echo "✔  Setup complete. Next: db-up && db-migrate && npm run dev"
          echo ""
        '';

        # ── stripe-forward ────────────────────────────────────────────────────
        stripeForward = pkgs.writeShellScriptBin "stripe-forward" ''
          set -euo pipefail
          : "''${STRIPE_WEBHOOK_SECRET:?STRIPE_WEBHOOK_SECRET must be set in .env.local}"
          echo "📡 Forwarding Stripe webhooks → localhost:3000/api/stripe/webhook"
          stripe listen \
            --forward-to localhost:3000/api/stripe/webhook \
            --events checkout.session.completed
        '';

        # ── check-env ─────────────────────────────────────────────────────────
        checkEnv = pkgs.writeShellScriptBin "check-env" ''
          set -euo pipefail
          REQUIRED=(
            NEXT_PUBLIC_SANITY_PROJECT_ID
            NEXT_PUBLIC_SANITY_DATASET
            NEXT_PUBLIC_SANITY_API_VERSION
            SANITY_API_TOKEN
            SANITY_API_READ_TOKEN
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            CLERK_SECRET_KEY
            CLERK_WEBHOOK_SECRET
            STRIPE_SECRET_KEY
            STRIPE_WEBHOOK_SECRET
            DATABASE_URL
            NEXT_PUBLIC_BASE_URL
          )
          MISSING=()
          for var in "''${REQUIRED[@]}"; do
            if [[ -z "''${!var:-}" ]]; then
              MISSING+=("$var")
            fi
          done
          if [[ ''${#MISSING[@]} -gt 0 ]]; then
            echo "✘ Missing environment variables:"
            for v in "''${MISSING[@]}"; do echo "   • $v"; done
            exit 1
          fi
          echo "✓ All required environment variables are set"
          echo ""
          echo "  DATABASE_URL (runtime/Accelerate) : ''${DATABASE_URL:0:60}…"
          echo "  LOCAL_DATABASE_URL (migrations)   : $LOCAL_DATABASE_URL"
          echo ""
        '';

      in {
        devShells.default = pkgs.mkShell {
          name = "shopsafe-dev";

          buildInputs = [
            # JS runtime
            nodejs
            pkgs.nodePackages.prisma
            pkgs.prisma-engines

            # Editor / LSP
            pkgs.typescript
            pkgs.nodePackages.typescript-language-server

            # Postgres full suite (pg_ctl, initdb, createdb, psql, pg_dump …)
            pg
            pkgs.openssl

            # Containers
            pkgs.podman
            pkgs.podman-compose

            # Payments / tunnel
            pkgs.stripe-cli
            pkgs.ngrok

            # Dev tooling
            pkgs.git
            pkgs.jq
            pkgs.curl
            pkgs.gnumake

            # Custom scripts
            dbUp
            dbDown
            dbShell
            dbMigrate
            dbReset
            dbStudio
            devSetup
            stripeForward
            checkEnv
          ];

          # Prisma engine paths (no deprecated MIGRATION_ENGINE_BINARY)
          inherit (prismaEnv)
            PRISMA_QUERY_ENGINE_BINARY
            PRISMA_SCHEMA_ENGINE_BINARY
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING;

          shellHook = ''
            # ── Repo root ──────────────────────────────────────────────────────
            export REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

            # ── Podman aliases ─────────────────────────────────────────────────
            alias docker='podman'
            alias docker-compose='podman-compose'

            # ── LOCAL_DATABASE_URL ─────────────────────────────────────────────
            # This always points at the local dev cluster.
            # Used by: db-migrate, db-reset, db-studio, db-shell
            # Never overridden by .env.local — that's intentional.
            export LOCAL_DATABASE_URL="postgresql://${pgUser}@localhost:${pgPort}/${pgDb}?host=$REPO_ROOT/.devdb/run"

            # ── DATABASE_URL ───────────────────────────────────────────────────
            # Default: also points locally. Gets overridden by .env.local when
            # your Prisma Accelerate key is present (for runtime/Next.js use).
            export DATABASE_URL="$LOCAL_DATABASE_URL"

            # ── Source .env.local ──────────────────────────────────────────────
            # This overrides DATABASE_URL with your Accelerate URL for the app,
            # but LOCAL_DATABASE_URL remains untouched for migration scripts.
            if [[ -f "$REPO_ROOT/.env.local" ]]; then
              set -a
              source "$REPO_ROOT/.env.local" 2>/dev/null || true
              set +a
            fi

            # ── Welcome banner ─────────────────────────────────────────────────
            echo ""
            echo "  ╔══════════════════════════════════════════════╗"
            echo "  ║           ShopSafe Dev Environment           ║"
            echo "  ╚══════════════════════════════════════════════╝"
            echo ""
            echo "  Node  : $(node -v)"
            echo "  npm   : $(npm -v)"
            echo "  TSC   : $(tsc --version 2>/dev/null || echo 'n/a')"
            echo "  psql  : $(psql --version | head -1)"
            echo "  Podman: $(podman --version | head -1)"
            echo ""
            echo "  ── Database ─────────────────────────────────────"
            echo "  db-up           Init + start local Postgres"
            echo "  db-down         Stop local Postgres"
            echo "  db-shell        psql → ${pgDb}"
            echo "  db-migrate      Deploy migrations (always local)"
            echo "  db-reset        Wipe + re-migrate (dev only)"
            echo "  db-studio       Prisma Studio (local)"
            echo ""
            echo "  ── App ──────────────────────────────────────────"
            echo "  dev-setup       npm install + prisma generate"
            echo "  stripe-forward  Stripe webhook tunnel"
            echo "  check-env       Validate all required secrets"
            echo ""
            echo "  ── URL split ────────────────────────────────────"
            echo "  LOCAL_DATABASE_URL → migrations / studio / psql"
            echo "  DATABASE_URL       → Next.js runtime (Accelerate)"
            echo ""
            echo "  ── First-time setup ─────────────────────────────"
            echo "  1. Fill in .env.local   (Clerk / Sanity / Stripe / Accelerate)"
            echo "  2. dev-setup"
            echo "  3. db-up"
            echo "  4. db-migrate"
            echo "  5. npm run dev"
            echo ""

            # ── Postgres status hint ───────────────────────────────────────────
            if [[ -f "$REPO_ROOT/.devdb/data/PG_VERSION" ]]; then
              if pg_ctl -D "$REPO_ROOT/.devdb/data" status &>/dev/null; then
                echo "  ✔  PostgreSQL running on port ${pgPort}"
              else
                echo "  ℹ  Postgres cluster exists but stopped — run 'db-up'"
              fi
              echo ""
            fi
          '';
        };

        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
