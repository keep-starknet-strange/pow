#!/bin/bash

# Function to convert PNG files to WebP in a directory
convert_directory() {
  local dir="$1"
  echo "Processing directory: $dir"
  
  # Process PNG files in current directory
  for f in "$dir"/*.png; do
    # Check if file exists (handles case where no .png files match)
    if [[ -f "$f" ]]; then
      echo "Converting $f"
      # Get filename without extension
      ff="${f%.*}"
      echo "no ext ${ff##*/}"
      ./cwebp -q 75 -m 6 "$f" -o "${ff}.webp"
    fi
  done
  
  # Recursively process subdirectories
  for subdir in "$dir"/*; do
    if [[ -d "$subdir" ]]; then
      convert_directory "$subdir"
    fi
  done
}

# Start conversion from current directory
convert_directory "$(pwd)"