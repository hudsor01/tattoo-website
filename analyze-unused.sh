#!/bin/bash

echo "=== UNUSED FILES ANALYSIS ==="
echo ""

# Function to check if file has any exports
has_exports() {
    local file=$1
    rg -q "^export" "$file" || rg -q "module.exports" "$file"
}

# Categorize unused files
echo "1. METADATA FILES (might be needed):"
grep "metadata.ts" /tmp/unused_files.txt | sort
echo ""

echo "2. LAYOUT/PAGE FILES (Next.js entry points - KEEP):"
grep -E "(layout|page|error|loading|not-found|robots|sitemap).tsx?" /tmp/unused_files.txt | sort
echo ""

echo "3. TYPE DEFINITION FILES:"
grep "types/" /tmp/unused_files.txt | sort
echo ""

echo "4. COMPONENT FILES:"
grep "components/" /tmp/unused_files.txt | grep -v "ui/" | sort
echo ""

echo "5. UI COMPONENTS:"
grep "components/ui/" /tmp/unused_files.txt | sort
echo ""

echo "6. HOOK FILES:"
grep "hooks/" /tmp/unused_files.txt | sort
echo ""

echo "7. LIB/UTILS FILES:"
grep -E "(lib|utils)/" /tmp/unused_files.txt | sort
echo ""

echo "8. EMAIL TEMPLATES:"
grep "emails/" /tmp/unused_files.txt | sort
echo ""

echo "9. STORE FILES:"
grep "store/" /tmp/unused_files.txt | sort
echo ""

echo "10. OTHER FILES:"
grep -v -E "(metadata|layout|page|error|loading|not-found|robots|sitemap|types/|components/|hooks/|lib/|utils/|emails/|store/)" /tmp/unused_files.txt | sort

echo ""
echo "=== POTENTIALLY SAFE TO DELETE ==="
echo "(excluding metadata, Next.js entry points, and config files)"
echo ""

# Get files that are likely safe to delete
safe_to_delete="/tmp/safe_to_delete.txt"
> "$safe_to_delete"

while IFS= read -r file; do
    # Skip Next.js special files
    if [[ "$file" =~ (layout|page|error|loading|not-found|metadata|robots|sitemap|global-error|middleware)\.tsx?$ ]]; then
        continue
    fi
    
    # Skip config files
    if [[ "$file" =~ (config)\.ts$ ]]; then
        continue
    fi
    
    echo "$file" >> "$safe_to_delete"
done < /tmp/unused_files.txt

sort "$safe_to_delete"
echo ""
echo "Total files safe to delete: $(wc -l < "$safe_to_delete")"