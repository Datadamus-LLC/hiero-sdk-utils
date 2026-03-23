// SPDX-License-Identifier: Apache-2.0

/**
 * Base error class for all hiero-sdk-utils errors.
 * All errors thrown by this library extend this class.
 *
 * @example
 * ```ts
 * try {
 *   await client.accounts.getById('invalid');
 * } catch (error) {
 *   if (error instanceof HieroError) {
 *     console.log(error.code); // e.g., 'INVALID_ACCOUNT_ID'
 *   }
 * }
 * ```
 */
export class HieroError extends Error {
  /**
   * @param message - Human-readable error description
   * @param code - Machine-readable error code (e.g., 'ACCOUNT_NOT_FOUND')
   * @param options - Standard ErrorOptions including cause chain
   */
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when the Mirror Node API returns an error response.
 * Includes the HTTP status code for programmatic handling.
 *
 * @example
 * ```ts
 * try {
 *   await client.accounts.getById('0.0.99999999999');
 * } catch (error) {
 *   if (error instanceof MirrorNodeError) {
 *     console.log(error.status); // 404
 *     console.log(error.code);   // 'MIRROR_NODE_ERROR'
 *   }
 * }
 * ```
 */
export class MirrorNodeError extends HieroError {
  /**
   * @param message - Human-readable error description
   * @param code - Machine-readable error code
   * @param status - HTTP status code from the Mirror Node response
   * @param options - Standard ErrorOptions including cause chain
   */
  constructor(
    message: string,
    code: string,
    public readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, code, options);
  }
}

/**
 * Error thrown when input validation fails before making a network request.
 *
 * @example
 * ```ts
 * try {
 *   await client.accounts.getById('not-an-id');
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.log(error.code); // 'INVALID_ACCOUNT_ID'
 *   }
 * }
 * ```
 */
export class ValidationError extends HieroError {
  /**
   * @param message - Human-readable description of what was invalid
   * @param code - Machine-readable error code
   * @param options - Standard ErrorOptions including cause chain
   */
  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, code, options);
  }
}

/**
 * Error thrown when pagination encounters an unexpected state.
 *
 * @example
 * ```ts
 * try {
 *   for await (const item of client.accounts.list()) { ... }
 * } catch (error) {
 *   if (error instanceof PaginationError) {
 *     console.log(error.code); // 'INVALID_RESPONSE_SHAPE'
 *   }
 * }
 * ```
 */
export class PaginationError extends HieroError {
  /**
   * @param message - Human-readable description of the pagination failure
   * @param code - Machine-readable error code
   * @param options - Standard ErrorOptions including cause chain
   */
  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, code, options);
  }
}
