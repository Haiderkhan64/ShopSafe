{
  description = "Shop-Safe Next.js + Prisma + Sanity Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          name = "shop-safe-dev-shell";

          buildInputs = [
            pkgs.nodejs_22
            pkgs.pnpm
            pkgs.typescript
            pkgs.eslint
            pkgs.postgresql
            pkgs.openssl
            pkgs.git
            pkgs.nodePackages.prisma
            pkgs.prisma-engines
            pkgs.podman
            pkgs.podman-compose
            pkgs.stripe-cli
            pkgs.ngrok
          ];

          shellHook = ''
            # export NODE_ENV=development
            
            # ✅ Tell Prisma where the engines are
            export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
            export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
            export PRISMA_MIGRATION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/migration-engine"
            export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"


            # ✅ Create docker alias for Podman (drop-in replacement)
            alias docker='podman'
            alias docker-compose='podman-compose'

            echo "✅ Welcome to Shop-Safe Dev Shell"
            echo "Node version: $(node -v)"
            echo "TypeScript version: $(tsc --version)"
            echo "Container runtime: Podman (Docker-compatible)"
            echo ""
            echo "💡 Tip: Use 'podman' or 'docker' (aliased) commands"
          '';
        };
      });
}
