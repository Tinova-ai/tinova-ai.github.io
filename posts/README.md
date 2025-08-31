# Blog Content Repository

This private repository contains blog post content for the Tinova.ai technical blog.

## Structure

- All blog posts are markdown files with YAML frontmatter
- Posts are used as a Git submodule in the main `tinova-web` repository
- Content is served via Next.js static site generation

## Adding New Posts

1. Create a new markdown file with the following frontmatter:

```yaml
---
title: 'Your Post Title'
date: 'YYYY-MM-DD'
author: 'Author Name'
excerpt: 'Brief description of the post'
category: 'Category'
---
```

2. Commit and push the new post
3. Update the submodule in the main `tinova-web` repository

## Current Posts

- `welcome-to-tinova-ai.md` - Company introduction and vision
- `nginx-cloudflare-tunnel-setup.md` - Technical infrastructure guide