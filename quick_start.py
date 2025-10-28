#!/usr/bin/env python3
"""
Template Copilot Quick Start Script

This interactive script helps you set up a new project using the template_copilot template.
It will guide you through replacing all placeholders with your project information.
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(text.center(70))
    print("=" * 70 + "\n")

def print_section(text):
    """Print a section header."""
    print("\n" + "-" * 70)
    print(text)
    print("-" * 70)

def get_input(prompt, default=None):
    """Get user input with optional default value."""
    if default:
        prompt = f"{prompt} [{default}]: "
    else:
        prompt = f"{prompt}: "
    
    value = input(prompt).strip()
    return value if value else default

def replace_in_file(file_path, replacements):
    """Replace placeholders in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main entry point."""
    print_header("Template Copilot Quick Start")
    
    print("Welcome to Template Copilot!")
    print("This script will help you customize the template for your project.")
    print("\nPlease answer the following questions:\n")
    
    # Gather project information
    print_section("Project Information")
    
    project_name = get_input("Project name")
    if not project_name:
        print("❌ Project name is required!")
        sys.exit(1)
    
    project_desc = get_input("Brief project description")
    if not project_desc:
        project_desc = f"A project created using Template Copilot"
    
    repo_url = get_input("GitHub repository URL (e.g., https://github.com/user/repo)")
    if not repo_url:
        repo_url = "https://github.com/your-org/your-repo"
    
    version = get_input("Initial version", "0.1.0")
    
    license_type = get_input("License type", "MIT")
    
    author_name = get_input("Your name/organization")
    
    # Target audience
    print_section("Target Audience")
    
    primary_audience = get_input("Primary user group", "Developers")
    secondary_audience = get_input("Secondary user group", "DevOps Engineers")
    
    # Current date
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Build replacement dictionary
    replacements = {
        "[Project Name]": project_name,
        "[brief description]": project_desc,
        "[GitHub repository URL]": repo_url,
        "[Current version number]": version,
        "[Date]": current_date,
        "[Primary user group]": primary_audience,
        "[Secondary user group]": secondary_audience,
        "[License type and link]": license_type,
    }
    
    # Files to update
    files_to_update = [
        "README.md",
        "docs/project-overview.md",
        "docs/roadmap.md",
        "docs/backlog.md",
    ]
    
    # Apply replacements
    print_section("Applying Changes")
    
    repo_root = Path(__file__).parent
    success_count = 0
    
    for file_path_str in files_to_update:
        file_path = repo_root / file_path_str
        if file_path.exists():
            if replace_in_file(file_path, replacements):
                print(f"✅ Updated {file_path_str}")
                success_count += 1
            else:
                print(f"❌ Failed to update {file_path_str}")
        else:
            print(f"⚠️  {file_path_str} not found, skipping")
    
    # Summary
    print_section("Summary")
    
    print(f"Project Name: {project_name}")
    print(f"Description: {project_desc}")
    print(f"Repository: {repo_url}")
    print(f"Version: {version}")
    print(f"License: {license_type}")
    print(f"\nUpdated {success_count} of {len(files_to_update)} files")
    
    print_header("Next Steps")
    
    print("1. Review the updated files and customize further as needed")
    print("2. Update feature descriptions in docs/project-overview.md")
    print("3. Set your actual roadmap in docs/roadmap.md")
    print("4. Configure your backlog in docs/backlog.md")
    print("5. Run validation: python validate_template.py")
    print("6. Create initial GitHub issues and link them in your backlog")
    print("7. Enable GitHub Copilot for your repository")
    print("\nFor detailed instructions, see TEMPLATE_USAGE.md")
    
    print("\n" + "=" * 70)
    print("Setup complete! Happy coding! 🚀".center(70))
    print("=" * 70 + "\n")

if __name__ == '__main__':
    main()
