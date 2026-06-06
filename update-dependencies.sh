#!/usr/bin/env bash
#
# update-dependencies.sh
# -----------------------
# Atualiza as dependências dos projetos do monorepo ImplantDetect:
#   - backend     (requirements.txt)  via pur
#   - prediction  (requirements.txt)  via pur
#   - frontend    (package.json)      via npm-check-updates (respeita .ncurc.json)
#
# O 'shared' (implantdetect-shared) NÃO é tratado aqui: ele usa pyproject.toml
# com lower bounds (>=) e é uma lib interna com poucas dependências — atualize-o
# manualmente quando necessário.
#
# IMPORTANTE: cada projeto Python tem seu PRÓPRIO virtualenv e seu PRÓPRIO
# arquivo de dependências. Este script apenas REESCREVE os pins de cada
# arquivo isoladamente (uma chamada de pur por arquivo — nenhum requirements
# sobrescreve o de outro projeto) e NÃO instala nada nos venvs. A instalação
# fica a seu cargo, em cada venv separadamente (ver "Próximos passos" no fim).
#
# Uso:
#   ./update-dependencies.sh            # atualiza tudo
#   ./update-dependencies.sh backend    # só um/alguns projetos
#   ./update-dependencies.sh frontend backend
#
# Flags:
#   --dry-run   Mostra o que seria atualizado, sem alterar arquivos.
#
# Requisitos:
#   - pur   (pip install pur)        -> projetos Python
#   - npx / npm-check-updates        -> frontend
#
set -euo pipefail

# Raiz do repositório = diretório deste script
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DRY_RUN=0
TARGETS=()

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    backend|prediction|frontend) TARGETS+=("$arg") ;;
    -h|--help)
      grep '^#' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Argumento desconhecido: $arg" >&2
      echo "Válidos: backend prediction frontend [--dry-run]" >&2
      exit 1
      ;;
  esac
done

# Sem alvos explícitos -> faz todos
if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=(backend prediction frontend)
fi

# --- Helpers -----------------------------------------------------------------

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m[!]\033[0m %s\n' "$*"; }
err()   { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "'$1' não encontrado no PATH. $2"
    exit 1
  fi
}

# Atualiza um arquivo de requirements (.txt) com pur.
# Cada chamada opera SOMENTE no arquivo passado — projetos não se misturam.
update_python() {
  local name="$1" file="$2"
  if [ ! -f "$file" ]; then
    warn "$name: arquivo não encontrado ($file) — pulando."
    return
  fi
  info "$name: atualizando pins em $(basename "$file") com pur..."
  local pur_args=(--requirement "$file")
  [ "$DRY_RUN" -eq 1 ] && pur_args+=(--dry-run)
  pur "${pur_args[@]}"
}

# --- Execução ----------------------------------------------------------------

info "Repositório: $ROOT_DIR"
[ "$DRY_RUN" -eq 1 ] && warn "Modo DRY-RUN: nenhum arquivo será alterado."

needs_python=0
for t in "${TARGETS[@]}"; do
  case "$t" in backend|prediction) needs_python=1 ;; esac
done

if [ "$needs_python" -eq 1 ]; then
  require pur "Instale com: pip install pur"
fi

for t in "${TARGETS[@]}"; do
  case "$t" in
    backend)
      update_python "backend" "$ROOT_DIR/implantdetect-backend/requirements.txt"
      ;;
    prediction)
      update_python "prediction" "$ROOT_DIR/implantdetect-prediction/requirements.txt"
      ;;
    frontend)
      require npx "Instale o Node.js (npx acompanha o npm)."
      info "frontend: verificando atualizações com npm-check-updates (reject via .ncurc.json)..."
      # IMPORTANTE: rodar DENTRO do diretório do frontend. O ncu lê o .ncurc.json
      # a partir do CWD do processo — '--cwd' só aponta o pacote alvo e NÃO faz o
      # config ser carregado, então o reject list seria ignorado. Passamos também
      # --configFilePath explícito como reforço.
      (
        cd "$ROOT_DIR/implantdetect-frontend"
        if [ "$DRY_RUN" -eq 1 ]; then
          # Sem -u: apenas reporta
          npx --yes npm-check-updates --configFilePath .
        else
          # -u reescreve o package.json
          npx --yes npm-check-updates --configFilePath . -u
          info "frontend: rodando npm install para sincronizar o lockfile..."
          npm install
        fi
      )
      ;;
  esac
done

info "Concluído."
if [ "$DRY_RUN" -eq 0 ] && [ "$needs_python" -eq 1 ]; then
  cat <<'EOF'

Próximos passos (Python — pur só reescreveu os arquivos, NÃO instalou nada).
Cada projeto tem seu PRÓPRIO venv; instale em cada um separadamente:

  # backend (.venv próprio)
  cd implantdetect-backend
  source .venv/Scripts/activate    # Git Bash/Windows  (ou .venv/bin/activate no Linux)
  pip install -r requirements.txt
  deactivate

  # prediction (.venv próprio)
  cd implantdetect-prediction
  source .venv/Scripts/activate
  pip install -r requirements.txt
  deactivate

Revise o diff antes de commitar:  git diff
EOF
fi
