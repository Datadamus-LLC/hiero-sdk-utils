# hiero-sdk-utils

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue.svg)](https://www.typescriptlang.org/)

TypeScript utilities for the Hedera/Hiero Mirror Node — typed queries, auto-pagination, and developer helpers.

## Features

- **Fully typed** — every Mirror Node response is typed, no `any` leaks
- **Auto-pagination** — list endpoints return `AsyncIterable<T>` that automatically follows `links.next`
- **Zero runtime dependencies** — uses native `fetch` (Node.js 18+)
- **Rate limiting** — built-in token-bucket rate limiter to respect API limits
- **Retry logic** — automatic retries on 429 (rate limited) and 503 (service unavailable)
- **Typed errors** — `MirrorNodeError`, `ValidationError`, `PaginationError` with error codes and cause chains
- **Input validation** — entity IDs are validated before network calls
- **9 resource modules** — accounts, transactions, tokens, topics, contracts, NFTs, balances, blocks, schedules

## Installation

```bash
npm install hiero-sdk-utils
```

## Quick Start

```typescript
import { HieroClient, Networks } from 'hiero-sdk-utils';

// Create a client pointing to testnet
const client = new HieroClient({ baseUrl: Networks.testnet });

// Fetch a single account
const account = await client.accounts.getById('0.0.1234');
console.log(account.balance.balance);

// Iterate through accounts with auto-pagination
for await (const a of client.accounts.list({ limit: 10 })) {
  console.log(a.account, a.balance.balance);
}
```

## Network Selection

```typescript
import { HieroClient, Networks } from 'hiero-sdk-utils';

// Pre-configured networks
const testnet = new HieroClient({ baseUrl: Networks.testnet });
const mainnet = new HieroClient({ baseUrl: Networks.mainnet });
const previewnet = new HieroClient({ baseUrl: Networks.previewnet });

// Custom Mirror Node
const custom = new HieroClient({ baseUrl: 'https://my-mirror-node.example.com' });
```

## Configuration

```typescript
const client = new HieroClient({
  baseUrl: Networks.testnet,       // Required: Mirror Node URL
  maxRequestsPerSecond: 20,        // Rate limit (default: 20)
  timeoutMs: 30000,                // Request timeout in ms (default: 30000)
  maxRetries: 3,                   // Retry count for 429/503 (default: 3)
  headers: {                       // Custom headers
    'X-Custom': 'value',
  },
});
```

## Resources

### Accounts

```typescript
// Get by ID
const account = await client.accounts.getById('0.0.1234');

// List with filters
for await (const a of client.accounts.list({ limit: 10, order: 'desc' })) {
  console.log(a.account);
}
```

### Transactions

```typescript
// Get by transaction ID
const tx = await client.transactions.getById('0.0.1234-1234567890-000000001');

// List with filters
for await (const tx of client.transactions.list({ result: 'success', limit: 25 })) {
  console.log(tx.transaction_id, tx.result);
}
```

### Tokens

```typescript
// Get by ID
const token = await client.tokens.getById('0.0.5678');

// List fungible tokens
for await (const t of client.tokens.list({ type: 'FUNGIBLE_COMMON' })) {
  console.log(t.name, t.symbol, t.total_supply);
}
```

### Topics

```typescript
// Get topic info
const topic = await client.topics.getById('0.0.7777');

// List messages
for await (const msg of client.topics.listMessages('0.0.7777')) {
  console.log(msg.sequence_number, msg.message);
}
```

### Contracts

```typescript
const contract = await client.contracts.getById('0.0.6666');

for await (const c of client.contracts.list()) {
  console.log(c.contract_id, c.evm_address);
}
```

### NFTs

```typescript
// Get specific NFT
const nft = await client.nfts.getByTokenAndSerial('0.0.5678', 1);

// List NFTs for a token
for await (const n of client.nfts.listByToken('0.0.5678')) {
  console.log(n.serial_number, n.account_id);
}
```

### Balances

```typescript
for await (const entry of client.balances.list({ limit: 100 })) {
  console.log(entry.account, entry.balance);
}
```

### Blocks

```typescript
// Get by number
const block = await client.blocks.getByHashOrNumber(12345);

// Get by hash
const block2 = await client.blocks.getByHashOrNumber('0xabc123...');

// List recent blocks
for await (const b of client.blocks.list({ order: 'desc', limit: 10 })) {
  console.log(b.number, b.hash);
}
```

### Schedules

```typescript
const schedule = await client.schedules.getById('0.0.9999');

for await (const s of client.schedules.list()) {
  console.log(s.schedule_id, s.executed_timestamp);
}
```

## Error Handling

```typescript
import { HieroClient, Networks, MirrorNodeError, ValidationError } from 'hiero-sdk-utils';

const client = new HieroClient({ baseUrl: Networks.testnet });

try {
  const account = await client.accounts.getById('0.0.99999999999');
} catch (error) {
  if (error instanceof ValidationError) {
    // Input was invalid — didn't hit the network
    console.log(error.code);    // 'INVALID_ACCOUNT_ID'
    console.log(error.message); // Human-readable description
  } else if (error instanceof MirrorNodeError) {
    // API returned an error
    console.log(error.status);  // 404
    console.log(error.code);    // 'NOT_FOUND'
    console.log(error.cause);   // Original error if wrapped
  }
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. This project follows [Hiero contribution standards](https://github.com/hiero-ledger/.github/blob/main/CONTRIBUTING.md).

## License

[Apache-2.0](./LICENSE)
