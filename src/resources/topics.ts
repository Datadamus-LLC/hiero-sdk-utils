// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { TopicInfo, TopicMessage, TopicMessagesQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node topic endpoints.
 *
 * @example
 * ```ts
 * const topic = await client.topics.getById('0.0.1234');
 * for await (const msg of client.topics.listMessages('0.0.1234')) {
 *   console.log(msg.message);
 * }
 * ```
 */
export class TopicsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves topic info by ID.
   *
   * @param topicId - Topic in `0.0.X` format
   * @returns The topic info including keys and memo
   * @throws {ValidationError} If topicId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(topicId: string): Promise<TopicInfo> {
    this.validateTopicId(topicId);
    return this.client.get<TopicInfo>(`/api/v1/topics/${topicId}`);
  }

  /**
   * Lists messages for a topic. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param topicId - Topic in `0.0.X` format
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of topic message objects
   * @throws {ValidationError} If topicId format is invalid
   */
  listMessages(topicId: string, params?: TopicMessagesQueryParams): AsyncIterable<TopicMessage> {
    this.validateTopicId(topicId);
    return paginate<TopicMessage>(
      this.client,
      `/api/v1/topics/${topicId}/messages`,
      'messages',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateTopicId(id: string): void {
    if (!ENTITY_ID_PATTERN.test(id)) {
      throw new ValidationError(
        `Invalid topic ID format: "${id}". Expected "shard.realm.num" format (e.g., "0.0.1234").`,
        'INVALID_TOPIC_ID',
      );
    }
  }
}
