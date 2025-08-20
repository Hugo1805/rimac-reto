import { DynamoDB } from 'aws-sdk';
import { FusionData, CustomData, CacheEntry, PaginationParams } from '../types';

export class DynamoDBService {
  private dynamodb: DynamoDB.DocumentClient;
  private fusionTable: string;
  private customTable: string;
  private cacheTable: string;

  constructor() {
    this.dynamodb = new DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.STAGE === 'dev' && {
        endpoint: 'http://localhost:8000',
      }),
    });

    this.fusionTable = process.env.DYNAMODB_TABLE_FUSION!;
    this.customTable = process.env.DYNAMODB_TABLE_CUSTOM!;
    this.cacheTable = process.env.DYNAMODB_TABLE_CACHE!;
  }

  // Fusion Data Methods
  async saveFusionData(data: FusionData): Promise<void> {
    const params = {
      TableName: this.fusionTable,
      Item: data,
    };

    try {
      await this.dynamodb.put(params).promise();
    } catch (error) {
      throw new Error(`Error saving fusion data: ${error}`);
    }
  }

  async getFusionHistory(pagination: PaginationParams): Promise<{
    items: FusionData[];
    hasNext: boolean;
    total?: number;
  }> {
    const limit = pagination.limit || 10;
    const page = pagination.page || 1;

    try {
      // Get total count first
      const countParams = {
        TableName: this.fusionTable,
        Select: 'COUNT',
      };

      const countResult = await this.dynamodb.scan(countParams).promise();
      const total = countResult.Count || 0;

      // Get paginated results
      const params = {
        TableName: this.fusionTable,
        IndexName: 'TimestampIndex',
        ScanIndexForward: false, // Descending order (newest first)
        Limit: limit,
        ...(page > 1 && {
          ExclusiveStartKey: {
            timestamp: Date.now() - ((page - 1) * limit * 1000 * 60 * 60), // Rough approximation
          },
        }),
      };

      const result = await this.dynamodb.query(params).promise();
      
      return {
        items: (result.Items as FusionData[]) || [],
        hasNext: !!result.LastEvaluatedKey,
        total,
      };
    } catch (error) {
      // Fallback to scan if GSI query fails
      const params = {
        TableName: this.fusionTable,
        Limit: limit,
      };

      const result = await this.dynamodb.scan(params).promise();
      const items = (result.Items as FusionData[]) || [];
      
      // Sort by timestamp descending
      items.sort((a, b) => b.timestamp - a.timestamp);
      
      return {
        items: items.slice((page - 1) * limit, page * limit),
        hasNext: items.length > page * limit,
      };
    }
  }

  // Custom Data Methods
  async saveCustomData(data: CustomData): Promise<void> {
    const params = {
      TableName: this.customTable,
      Item: data,
    };

    try {
      await this.dynamodb.put(params).promise();
    } catch (error) {
      throw new Error(`Error saving custom data: ${error}`);
    }
  }

  async getCustomHistory(pagination: PaginationParams): Promise<{
    items: CustomData[];
    hasNext: boolean;
    total?: number;
  }> {
    const limit = pagination.limit || 10;
    const page = pagination.page || 1;

    try {
      const params = {
        TableName: this.customTable,
        Limit: limit * page, // Get more items to simulate pagination
      };

      const result = await this.dynamodb.scan(params).promise();
      const items = (result.Items as CustomData[]) || [];
      
      // Sort by timestamp descending
      items.sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);
      
      return {
        items: paginatedItems,
        hasNext: items.length > page * limit,
        total: items.length,
      };
    } catch (error) {
      throw new Error(`Error fetching custom history: ${error}`);
    }
  }

  // Cache Methods
  async getCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
    const params = {
      TableName: this.cacheTable,
      Key: { cacheKey },
    };

    try {
      const result = await this.dynamodb.get(params).promise();
      const item = result.Item as CacheEntry;
      
      if (!item) return null;
      
      // Check if cache entry has expired
      if (item.ttl * 1000 < Date.now()) {
        await this.deleteCacheEntry(cacheKey);
        return null;
      }
      
      return item;
    } catch (error) {
      console.error(`Error getting cache entry: ${error}`);
      return null;
    }
  }

  async setCacheEntry(cacheKey: string, data: any, ttlMinutes: number = 30): Promise<void> {
    const ttl = Math.floor(Date.now() / 1000) + (ttlMinutes * 60);
    
    const params = {
      TableName: this.cacheTable,
      Item: {
        cacheKey,
        data,
        ttl,
        createdAt: Date.now(),
      },
    };

    try {
      await this.dynamodb.put(params).promise();
    } catch (error) {
      console.error(`Error setting cache entry: ${error}`);
    }
  }

  async deleteCacheEntry(cacheKey: string): Promise<void> {
    const params = {
      TableName: this.cacheTable,
      Key: { cacheKey },
    };

    try {
      await this.dynamodb.delete(params).promise();
    } catch (error) {
      console.error(`Error deleting cache entry: ${error}`);
    }
  }

  // Utility method to generate cache keys
  generateCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
