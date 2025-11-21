### Test Plan

| Suite | Tool | Coverage |
| --- | --- | --- |
| Unit | Jest (todo) | Queue processors, Workbox helpers, date utilities |
| E2E | Playwright | Login, offline punch → resync, leave apply + approval, payslip render, calendar data |

#### Playwright bootstrap

```bash
npx playwright install
npx playwright codegen http://localhost:5173
# save specs under tests/e2e/*.spec.ts
```

#### Jest bootstrap

```bash
npm install -D jest @types/jest ts-jest
npx ts-jest config:init
npm run test
```

> The scaffolding is documented; add the suites once backend endpoints are finalized.

