#!/bin/bash

# Check if cwebp binary exists
if [ ! -f "./cwebp" ]; then
    echo "Error: cwebp binary not found in current directory"
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

      if ./cwebp -q 100 -lossless -m 6 "$f" -o "${ff}.webp"; then
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

convert_directory "$(pwd)"

echo "Conversion complete!"