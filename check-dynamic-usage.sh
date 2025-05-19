#!/bin/bash

echo "=== CHECKING FOR DYNAMIC IMPORTS AND CSS REFERENCES ==="
echo ""

# Check for dynamic imports
echo "Files possibly used via dynamic imports:"
while IFS= read -r file; do
    basename=$(basename "$file")
    filename="${basename%.*}"
    filepath_without_ext="${file%.*}"
    
    # Check for dynamic imports
    if rg -q "dynamic.*${filename}" src || rg -q "lazy.*${filename}" src; then
        echo "  - $file (dynamic import)"
    fi
    
    # Check if referenced in CSS files
    if rg -q "${filename}" --type css src; then
        echo "  - $file (CSS reference)"
    fi
done < /tmp/safe_to_delete.txt

echo ""
echo "=== CHECKING EMAIL TEMPLATES ==="
# Email templates might be used by the email service
for file in src/emails/*.tsx; do
    if grep -q "$file" /tmp/safe_to_delete.txt; then
        echo "  - $file (might be used by email service)"
    fi
done

echo ""
echo "=== CHECKING TYPE DEFINITION FILES ==="
# Check if type files are referenced
for file in src/types/*.ts src/types/*/*.ts; do
    if grep -q "$file" /tmp/safe_to_delete.txt; then
        basename=$(basename "$file")
        filename="${basename%.*}"
        
        # Check if types are imported from this file
        if rg -q "import.*type.*from.*${filename}" src; then
            echo "  - $file (type imports found)"
        fi
    fi
done

echo ""
echo "=== FINAL RECOMMENDATIONS ==="
echo ""
echo "1. Keep all Next.js special files (layout, page, metadata, etc.)"
echo "2. Keep all config files"
echo "3. Consider keeping email templates - they might be used by services"
echo "4. Review type definition files carefully before deletion"
echo "5. Check for dynamic imports before deleting component files"