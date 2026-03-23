# Contributing to hiero-sdk-utils

Thank you for considering contributing to `hiero-sdk-utils`! This project follows the [Hiero contribution standards](https://github.com/hiero-ledger/.github/blob/main/CONTRIBUTING.md).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/hiero-sdk-utils.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run unit tests
npm run test:unit

# Run integration tests (requires network access to Hedera testnet)
npm run test:integration

# Run all tests
npm test
```

## Code Standards

- **TypeScript strict mode** — zero `any` types, explicit return types on public functions
- **Apache-2.0 license header** — every `.ts` file must start with `// SPDX-License-Identifier: Apache-2.0`
- **Named exports only** — no `export default`
- **JSDoc on all public API** — every exported function, class, type, and interface
- **No silent errors** — every `catch` block re-throws or throws a typed error
- **No hardcoded URLs** — Mirror Node URLs come from configuration only

## Commit Standards

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(accounts): add getAccount query
fix(client): handle rate limit correctly
docs(readme): update installation instructions
test(tokens): add token list pagination test
```

### Required for every commit:

- **GPG signature**: `git commit -S`
- **DCO sign-off**: `git commit -s`

Combined: `git commit -S -s -m "feat(scope): description"`

### Developer Certificate of Origin (DCO)

By contributing to this project, you certify that your contribution was created in whole or in part by you and you have the right to submit it under the Apache-2.0 license. See [developercertificate.org](https://developercertificate.org/).

## Testing

- **Unit tests** (`tests/unit/`) — use mock fetch for speed
- **Integration tests** (`tests/integration/`) — hit real Hedera testnet Mirror Node, no mocks

Every resource module requires both unit and integration tests covering: success case, validation error, API error, and pagination.

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure type check passes: `npm run typecheck`
3. Ensure lint passes: `npm run lint`
4. Update documentation if you changed public API
5. Submit your PR with a clear description

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
