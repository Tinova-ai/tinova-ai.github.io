# Blog Content Submodule Setup

This document explains how the blog content system works using Git submodules.

## Overview

The blog posts for this website are stored in a separate private repository (`Tinova-ai/blog-content`) and included as a Git submodule at the `posts/` directory.

## Architecture Benefits

- **Centralized Content Management**: Blog posts are managed in a dedicated repository
- **Private Content**: Blog content can be kept private while the main site is public
- **Version Control**: Independent versioning for content vs. application code
- **Team Collaboration**: Content creators can work separately from developers
- **Build Integration**: Works seamlessly with Next.js static generation

## Repository Structure

```
tinova-web/
├── posts/                    # Git submodule → Tinova-ai/blog-content
│   ├── README.md            # Blog content repository documentation
│   ├── welcome-to-tinova-ai.md
│   └── nginx-cloudflare-tunnel-setup.md
├── .gitmodules              # Git submodule configuration
└── lib/blog.ts              # Blog loading logic (unchanged)
```

## How It Works

### At Build Time
1. GitHub Actions checks out the main repository
2. `submodules: recursive` fetches the blog content from the private repository
3. Next.js reads markdown files from `posts/` directory (same as before)
4. Static pages are generated for each blog post
5. Built site is deployed to GitHub Pages

### At Runtime
- No changes - blog pages are served as static HTML files
- No API calls or dynamic fetching required
- Same performance as the original local files approach

## Updating Blog Content

### Adding New Posts
1. Clone or access the `blog-content` repository
2. Add new markdown files with proper frontmatter:
   ```yaml
   ---
   title: 'Your Post Title'
   date: 'YYYY-MM-DD'
   author: 'Author Name'
   excerpt: 'Brief description'
   category: 'Category'
   ---
   ```
3. Commit and push to the blog-content repository
4. Update the submodule in the main repository

### Updating the Submodule
```bash
# In the main tinova-web repository
git submodule update --remote posts
git add posts
git commit -m "Update blog content submodule"
git push
```

### Automatic Updates (Future Enhancement)
Could add GitHub Actions webhook to automatically update the submodule when blog content changes.

## Local Development

### Initial Setup
```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/your-org/tinova-web.git

# Or if already cloned
git submodule update --init --recursive
```

### Working with Submodules
```bash
# Update to latest blog content
git submodule update --remote posts

# Check submodule status
git submodule status

# Make changes to blog content (if you have access)
cd posts
# Make changes, commit, push
cd ..
git add posts
git commit -m "Update blog content"
```

## Testing

Run the test script to verify everything is working:

```bash
node test-submodule.js
```

This tests:
- Submodule directory exists and is populated
- Required blog posts are present
- Frontmatter is valid
- Build output was generated correctly

## Troubleshooting

### Submodule Not Found
```bash
# Initialize and fetch submodule
git submodule update --init --recursive
```

### Permission Issues
- Ensure you have access to the private `blog-content` repository
- Check that GitHub Actions has appropriate permissions

### Build Failures
- Verify the submodule was fetched during GitHub Actions
- Check that all required blog posts have valid frontmatter
- Run local tests with `node test-submodule.js`

## GitHub Actions Integration

The deployment workflow (`.github/workflows/deploy.yml`) includes:

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    submodules: recursive  # Fetch the blog content submodule
    token: ${{ secrets.GITHUB_TOKEN }}
```

This ensures that GitHub Pages builds have access to the blog content from the private repository.