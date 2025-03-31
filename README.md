# GitHub Workflow & Action Linker Chrome Extension

## Overview
This Chrome extension enhances the GitHub experience by adding clickable links to `uses:` references in GitHub Actions and Workflows within repositories. The script scans the workflow and action YAML references in text areas and inserts a button next to each reference, allowing users to quickly navigate to the corresponding file or repository.

## Features
- **Supports multiple formats:**
  - Remote workflow file: `org/repo/.github/workflows/file.yml@ref`
  - Local workflow file: `./.github/workflows/file.yml`
  - Remote action file: `org/repo/.github/actions/action-name@ref`
  - External action reference: `org/repo@ref`
- **Dynamic URL generation**
  - Detects the repository owner, name, and branch/tag
  - Converts local references to full GitHub URLs
  - Links directly to the corresponding file or directory in GitHub
- **User-friendly buttons**
  - Styled to match GitHub's UI
  - Includes hover and click effects
  - Adds an external link icon for clarity

## Installation
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the folder containing this script.
5. The extension is now installed and active on GitHub.

## Usage
1. Open a GitHub repository and navigate to a workflow or action YAML file.
2. If the file contains `uses:` references, the extension will detect them.
3. Click the generated button next to each reference to open the corresponding GitHub page in a new tab.

## Technical Details
- The script scans the content of `textarea` elements in GitHub's UI.
- It uses regular expressions to detect workflow and action references.
- Dynamic button placement ensures proper alignment with each reference.
- The extension dynamically extracts the branch or tag from GitHub's UI for accurate URL generation.

## Limitations
- The extension works only on GitHub (`https://github.com/` URLs).
- It relies on GitHub's current UI structure; changes in GitHub's UI may require updates.

## Contributions
Contributions are welcome! Feel free to open issues or submit pull requests to improve the extension.

## License
This project is licensed under the MIT License.

