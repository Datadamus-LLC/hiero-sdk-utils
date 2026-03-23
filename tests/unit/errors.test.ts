// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  HieroError,
  MirrorNodeError,
  ValidationError,
  PaginationError,
} from '../../src/errors/index.js';

describe('Error Hierarchy', () => {
  describe('HieroError', () => {
    it('should create an error with message and code', () => {
      const error = new HieroError('test message', 'TEST_CODE');
      expect(error.message).toBe('test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('HieroError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HieroError);
    });

    it('should support cause chain', () => {
      const cause = new Error('original');
      const error = new HieroError('wrapped', 'WRAP', { cause });
      expect(error.cause).toBe(cause);
    });
  });

  describe('MirrorNodeError', () => {
    it('should include HTTP status', () => {
      const error = new MirrorNodeError('not found', 'NOT_FOUND', 404);
      expect(error.message).toBe('not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
      expect(error.name).toBe('MirrorNodeError');
      expect(error).toBeInstanceOf(HieroError);
      expect(error).toBeInstanceOf(MirrorNodeError);
    });

    it('should support cause chain', () => {
      const cause = new Error('network');
      const error = new MirrorNodeError('fail', 'FAIL', 500, { cause });
      expect(error.cause).toBe(cause);
    });
  });

  describe('ValidationError', () => {
    it('should create with message and code', () => {
      const error = new ValidationError('bad input', 'INVALID_INPUT');
      expect(error.message).toBe('bad input');
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(HieroError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('PaginationError', () => {
    it('should create with message and code', () => {
      const error = new PaginationError('bad shape', 'INVALID_RESPONSE_SHAPE');
      expect(error.message).toBe('bad shape');
      expect(error.code).toBe('INVALID_RESPONSE_SHAPE');
      expect(error.name).toBe('PaginationError');
      expect(error).toBeInstanceOf(HieroError);
      expect(error).toBeInstanceOf(PaginationError);
    });
  });
});
