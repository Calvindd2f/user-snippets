## ESLint Workflow
Removing md and activating it when first release is ready.
```yaml
name: ESLint

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  eslint:
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

      - name: Run ESLint
        run: npm run lint

```
