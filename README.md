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
  - Compact, stylish "Go" button with external link icon
  - Positioned to the left of each `uses:` reference 
  - Styled to match GitHub's UI with a clean, modern design
  - Includes hover and click effects for better user interaction
  - Tooltip shows detailed information about the linked resource
  - Optimized size to avoid interfering with code readability

## Installation
There are two ways to install this extension:

### Installation from Chrome Web Store
1. Visit the extension page in the Chrome Web Store: [GitHub Actions Linker](https://chromewebstore.google.com/detail/github-actions-linker-by/pgmijoajcjlbhpgnmckbehelkdejnfam)
2. Click on the "Add to Chrome" button
3. Confirm the installation

### Local Installation (for developers)
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

## Recent Updates
- **UI Improvements**
  - Redesigned buttons with more compact, clean visual style
  - Improved positioning to avoid overlapping with long branch names
  - Added informative tooltips that show the full path and type of the reference
  - Enhanced visual feedback on hover and click

