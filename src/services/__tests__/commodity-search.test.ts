import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validationService } from '../validation';
import { supabaseService } from '../supabase';
import type { Commodity } from '@/types/database';

// Mock the supabase service
vi.mock('../supabase');
const mockSupabaseService = vi.mocked(supabaseService);

describe('Commodity Search Functionality', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Enhanced Commodity Validation', () => {
        it('should validate empty input correctly', async () => {
            const result = await validationService.validateCommodityWithDisambiguation('');

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Commodity name is required');
        });

        it('should handle no search results', async () => {
            mockSupabaseService.searchCommodities.mockResolvedValue([]);

            const result = await validationService.validateCommodityWithDisambiguation('nonexistent');

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('No matching commodity found');
        });

        it('should validate single commodity result', async () => {
            const mockCommodity: Commodity = {
                id: 1,
                name: 'Apple',
                type: 'fruit',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            };

            mockSupabaseService.searchCommodities.mockResolvedValue([mockCommodity]);

            const result = await validationService.validateCommodityWithDisambiguation('Apple');

            expect(result.isValid).toBe(true);
            expect(result.data).toEqual(mockCommodity);
        });

        it('should handle search errors gracefully', async () => {
            mockSupabaseService.searchCommodities.mockRejectedValue(new Error('Database error'));

            const result = await validationService.validateCommodityWithDisambiguation('apple');

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Error validating commodity. Please try again.');
        });
    });

    describe('Commodity Type Validation', () => {
        it('should validate commodity type selection', () => {
            const mockCommodities: Commodity[] = [
                { id: 1, name: 'Apple', type: 'fruit', created_at: '2024-01-01', updated_at: '2024-01-01' },
                { id: 2, name: 'Apple tree', type: 'plant', created_at: '2024-01-01', updated_at: '2024-01-01' }
            ];

            const result = validationService.validateCommodityType('Apple', mockCommodities);

            expect(result.isValid).toBe(true);
            expect(result.data).toEqual(mockCommodities[0]);
        });

        it('should reject invalid commodity type selection', () => {
            const mockCommodities: Commodity[] = [
                { id: 1, name: 'Apple', type: 'fruit', created_at: '2024-01-01', updated_at: '2024-01-01' }
            ];

            const result = validationService.validateCommodityType('Orange', mockCommodities);

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Invalid commodity type selection');
        });

        it('should reject empty commodity type selection', () => {
            const mockCommodities: Commodity[] = [
                { id: 1, name: 'Apple', type: 'fruit', created_at: '2024-01-01', updated_at: '2024-01-01' }
            ];

            const result = validationService.validateCommodityType('', mockCommodities);

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Commodity type selection is required');
        });
    });

    describe('Search Performance', () => {
        it('should make single database call for successful search', async () => {
            const mockCommodity: Commodity = {
                id: 1,
                name: 'Apple',
                type: 'fruit',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            };

            mockSupabaseService.searchCommodities.mockResolvedValue([mockCommodity]);

            await validationService.validateCommodityWithDisambiguation('Apple');

            expect(mockSupabaseService.searchCommodities).toHaveBeenCalledTimes(1);
            expect(mockSupabaseService.searchCommodities).toHaveBeenCalledWith('Apple');
        });

        it('should trim whitespace from input', async () => {
            const mockCommodity: Commodity = {
                id: 1,
                name: 'Apple',
                type: 'fruit',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            };

            mockSupabaseService.searchCommodities.mockResolvedValue([mockCommodity]);

            await validationService.validateCommodityWithDisambiguation('  Apple  ');

            expect(mockSupabaseService.searchCommodities).toHaveBeenCalledWith('Apple');
        });
    });

    describe('Integration with Existing Validation', () => {
        it('should maintain backward compatibility with original validateCommodity', async () => {
            const mockCommodity: Commodity = {
                id: 1,
                name: 'Apple',
                type: 'fruit',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            };

            mockSupabaseService.searchCommodities.mockResolvedValue([mockCommodity]);

            const result = await validationService.validateCommodity('Apple');

            expect(result.isValid).toBe(true);
            expect(result.data).toEqual(mockCommodity);
        });
    });
});
