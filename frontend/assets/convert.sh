#!/bin/bash

# Resolve script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Locate cwebp: prefer PATH, fallback to bundled binary next to the script
if command -v cwebp >/dev/null 2>&1; then
  CWEBP_BIN="cwebp"
elif [ -x "$SCRIPT_DIR/cwebp" ]; then
  CWEBP_BIN="$SCRIPT_DIR/cwebp"
else
  echo "Error: cwebp not found. Install with 'brew install webp' or place a 'cwebp' binary next to this script: $SCRIPT_DIR"
  exit 1
fi

convert_directory() {
  local dir="$1"
  echo "Processing directory: $dir"

  for f in "$dir"/*.png; do
    if [[ -f "$f" ]]; then
      echo "Converting $f"
      ff="${f%.*}"
      echo "Output file: ${ff##*/}.webp"

      if [[ -f "${ff}.webp" ]]; then
        echo "  Skipping - ${ff##*/}.webp already exists"
        continue
      fi

      if "$CWEBP_BIN" -q 100 -lossless -m 6 "$f" -o "${ff}.webp"; then
        echo "  ✓ Successfully converted ${f##*/}"

        if rm "$f"; then
          echo "  ✓ Deleted original ${f##*/}"
        else
          echo "  ✗ Failed to delete ${f##*/}"
        fi
      else
        echo "  ✗ Failed to convert ${f##*/}"
      fi
    fi
  done

  for subdir in "$dir"/*; do
    if [[ -d "$subdir" ]]; then
      convert_directory "$subdir"
    fi
  done
}

TARGET_DIR="${1:-$SCRIPT_DIR}"

convert_directory "$TARGET_DIR"

echo "Conversion complete!"
