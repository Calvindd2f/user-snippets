## Not yet active
Removing the comments and markdown when deployed.

```yml
name: Plugin Release

on:
  release:
    types: [created]

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm install

      - name: Bump Version and Build
        run: |
          npm version patch
          npm run dev
          
      - name: Create Release
        run: |
          cp main.js styles.css manifest.json release/
          #TODO
```
