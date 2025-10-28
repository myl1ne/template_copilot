#!/usr/bin/env python3
"""
Template Validation Script

This script validates that all placeholder content has been replaced
when using the template_copilot template for a new project.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple

# Placeholder patterns to check for
PLACEHOLDER_PATTERNS = [
    r'\[Project Name\]',
    r'\[brief description\]',
    r'\[GitHub repository URL\]',
    r'\[Current version number\]',
    r'\[Date\]',
    r'\[GitHub username\]',
    r'\[Primary user group\]',
    r'\[Secondary user group\]',
    r'\[Feature \d+\]',
    r'\[Primary Benefit\]',
    r'\[License type and link\]',
    r'\[count\]',
    r'#XX',
    r'\[Task Name\]',
    r'\[Bug Description\]',
]

# Files to check
FILES_TO_CHECK = [
    'README.md',
    'docs/project-overview.md',
    'docs/roadmap.md',
    'docs/backlog.md',
]

def find_placeholders_in_file(file_path: Path) -> List[Tuple[int, str, str]]:
    """
    Find all placeholder patterns in a file.
    
    Returns:
        List of tuples (line_number, placeholder_pattern, line_content)
    """
    if not file_path.exists():
        return []
    
    placeholders = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                for pattern in PLACEHOLDER_PATTERNS:
                    if re.search(pattern, line):
                        placeholders.append((line_num, pattern, line.strip()))
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return placeholders

def validate_template() -> bool:
    """
    Validate that all placeholders have been replaced.
    
    Returns:
        True if validation passes, False otherwise
    """
    repo_root = Path(__file__).parent
    all_valid = True
    total_placeholders = 0
    
    print("=" * 70)
    print("TEMPLATE VALIDATION REPORT")
    print("=" * 70)
    print()
    
    for file_path_str in FILES_TO_CHECK:
        file_path = repo_root / file_path_str
        placeholders = find_placeholders_in_file(file_path)
        
        if placeholders:
            all_valid = False
            total_placeholders += len(placeholders)
            print(f"❌ {file_path_str}")
            print(f"   Found {len(placeholders)} placeholder(s):")
            for line_num, pattern, line_content in placeholders:
                print(f"   Line {line_num}: {line_content[:80]}")
            print()
        else:
            if file_path.exists():
                print(f"✅ {file_path_str}")
            else:
                print(f"⚠️  {file_path_str} (file not found)")
    
    print()
    print("=" * 70)
    
    if all_valid:
        print("✅ VALIDATION PASSED")
        print("All placeholders have been replaced!")
    else:
        print("❌ VALIDATION FAILED")
        print(f"Found {total_placeholders} placeholder(s) that need to be replaced.")
        print()
        print("Next steps:")
        print("1. Replace all placeholder content with actual project information")
        print("2. See TEMPLATE_USAGE.md for detailed instructions")
        print("3. Run this script again to verify completeness")
    
    print("=" * 70)
    print()
    
    return all_valid

def main():
    """Main entry point."""
    is_valid = validate_template()
    sys.exit(0 if is_valid else 1)

if __name__ == '__main__':
    main()
