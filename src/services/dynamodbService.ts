import { DynamoDBClient, Select } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { FusionData, CustomData, CacheEntry, PaginationParams } from '../types';
import { fromIni } from '@aws-sdk/credential-providers';

export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;
  private fusionTable: string;
  private customTable: string;
  private cacheTable: string;

  constructor() {
    // Configuración directa para AWS (sin modo offline)
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromIni({ profile: 'serverless2' }),
    });

    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
    this.fusionTable = process.env.DYNAMODB_TABLE_FUSION!;
    this.customTable = process.env.DYNAMODB_TABLE_CUSTOM!;
    this.cacheTable = process.env.DYNAMODB_TABLE_CACHE!;
  }

  // Fusion Data Methods
  async saveFusionData(data: FusionData): Promise<void> {
    const command = new PutCommand({
      TableName: this.fusionTable,
      Item: data,
    });

    try {
      await this.docClient.send(command);
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
        Select: Select.COUNT, // Usar el enum correcto
      };

      const countResult = await this.docClient.send(
        new ScanCommand(countParams),
      );
      const total = countResult.Count || 0;

      // Simplificar la paginación usando scan
      const params = {
        TableName: this.fusionTable,
        Limit: limit,
      };

      const result = await this.docClient.send(new ScanCommand(params));
      const items = (result.Items as FusionData[]) || [];

      // Sort by timestamp descending
      items.sort((a, b) => b.timestamp - a.timestamp);

      // Paginate manually
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        hasNext: startIndex + limit < items.length,
        total,
      };
    } catch (error) {
      throw new Error(`Error fetching fusion history: ${error}`);
    }
  }

  // Custom Data Methods
  async saveCustomData(data: CustomData): Promise<void> {
    const command = new PutCommand({
      TableName: this.customTable,
      Item: data,
    });

    try {
      await this.docClient.send(command);
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
      // Get total count
      const countParams = {
        TableName: this.customTable,
        Select: Select.COUNT, // Usar el enum correcto
      };

      const countResult = await this.docClient.send(
        new ScanCommand(countParams),
      );
      const total = countResult.Count || 0;

      // Get items
      const command = new ScanCommand({
        TableName: this.customTable,
        Limit: limit,
      });

      const result = await this.docClient.send(command);
      const items = (result.Items as CustomData[]) || [];

      items.sort((a, b) => b.timestamp - a.timestamp);

      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        hasNext: startIndex + limit < items.length,
        total,
      };
    } catch (error) {
      throw new Error(`Error fetching custom history: ${error}`);
    }
  }

  // Cache Methods
  async getCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
    const command = new GetCommand({
      TableName: this.cacheTable,
      Key: { cacheKey },
    });

    try {
      const result = await this.docClient.send(command);
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

  async setCacheEntry(
    cacheKey: string,
    data: any,
    ttlMinutes: number = 30,
  ): Promise<void> {
    const ttl = Math.floor(Date.now() / 1000) + ttlMinutes * 60;

    const command = new PutCommand({
      TableName: this.cacheTable,
      Item: {
        cacheKey,
        data,
        ttl,
        createdAt: Date.now(),
      },
    });

    try {
      await this.docClient.send(command);
    } catch (error) {
      console.error(`Error setting cache entry: ${error}`);
    }
  }

  async deleteCacheEntry(cacheKey: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.cacheTable,
      Key: { cacheKey },
    });

    try {
      await this.docClient.send(command);
    } catch (error) {
      console.error(`Error deleting cache entry: ${error}`);
    }
  }

  // Utility method to generate cache keys
  generateCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
