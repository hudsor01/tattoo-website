#!/bin/bash

# Get all TS/TSX/JS/JSX files in src
echo "Collecting all source files..."
files=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | sort)

# Create a temporary file to store results
temp_unused="/tmp/unused_files.txt"
> "$temp_unused"

echo "Checking for files with no imports..."
total=$(echo "$files" | wc -l)
current=0

for file in $files; do
    current=$((current + 1))
    basename=$(basename "$file")
    filename="${basename%.*}"
    
    # Skip entry point files that might not be imported
    if [[ "$file" == "src/app/"*"/page."* ]] || \
       [[ "$file" == "src/app/"*"/layout."* ]] || \
       [[ "$file" == "src/app/"*"/error."* ]] || \
       [[ "$file" == "src/app/"*"/loading."* ]] || \
       [[ "$file" == "src/app/"*"/not-found."* ]] || \
       [[ "$file" == "src/app/"*"/route."* ]] || \
       [[ "$file" == "src/middleware."* ]] || \
       [[ "$file" == *".d.ts" ]]; then
        continue
    fi
    
    # Search for imports of this file
    import_count=$(rg -l --type-add 'code:*.{ts,tsx,js,jsx}' --type code \
        -e "from ['\"].*${filename}['\"]" \
        -e "import.*['\"].*${filename}['\"]" \
        -e "require\(.*${filename}" \
        src | wc -l)
    
    # Also check for the file path without extension
    filepath_without_ext="${file%.*}"
    import_count2=$(rg -l --type-add 'code:*.{ts,tsx,js,jsx}' --type code \
        -e "from ['\"].*${filepath_without_ext}['\"]" \
        -e "import.*['\"].*${filepath_without_ext}['\"]" \
        src | wc -l)
    
    total_imports=$((import_count + import_count2))
    
    if [ $total_imports -eq 0 ]; then
        echo "$file" >> "$temp_unused"
    fi
    
    # Progress indicator
    if [ $((current % 20)) -eq 0 ]; then
        echo "Progress: $current/$total files checked..."
    fi
done

echo ""
echo "=== UNUSED FILES ==="
cat "$temp_unused" | sort

echo ""
echo "Total unused files: $(cat "$temp_unused" | wc -l)"