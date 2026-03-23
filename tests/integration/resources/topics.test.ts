// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { MirrorNodeError, ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('TopicsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real topic from testnet', async () => {
    const topic = await client.topics.getById(TEST_CONFIG.knownTopicId);

    expect(topic).toHaveProperty('topic_id');
    expect(typeof topic.topic_id).toBe('string');
    expect(topic.topic_id).toMatch(/^\d+\.\d+\.\d+$/);
    expect(topic.topic_id).toBe(TEST_CONFIG.knownTopicId);
  });

  it('should throw ValidationError for invalid topic ID format', async () => {
    await expect(
      client.topics.getById('not-a-topic'),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw MirrorNodeError for non-existent topic', async () => {
    await expect(
      client.topics.getById('0.0.99999999999'),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should list real messages for a topic from testnet', async () => {
    let count = 0;
    for await (const message of client.topics.listMessages(TEST_CONFIG.knownTopicId)) {
      expect(message).toHaveProperty('topic_id');
      expect(message).toHaveProperty('sequence_number');
      expect(message.topic_id).toBe(TEST_CONFIG.knownTopicId);
      expect(typeof message.sequence_number).toBe('number');
      count++;
      if (count >= 5) break;
    }
    expect(count).toBeGreaterThan(0);
  });
});
