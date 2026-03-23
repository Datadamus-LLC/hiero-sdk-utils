// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('TopicsResource', () => {
  it('should fetch topic by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.topicInfo),
    });

    const topic = await client.topics.getById('0.0.7777');
    expect(topic.topic_id).toBe('0.0.7777');
  });

  it('should throw ValidationError for invalid topic ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.topics.getById('invalid')).rejects.toThrow(ValidationError);
  });

  it('should list topic messages', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        messages: [{ message: 'hello', sequence_number: 1, topic_id: '0.0.7777' }],
        links: { next: null },
      }),
    });

    const msgs: unknown[] = [];
    for await (const msg of client.topics.listMessages('0.0.7777')) {
      msgs.push(msg);
    }
    expect(msgs).toHaveLength(1);
  });
});
