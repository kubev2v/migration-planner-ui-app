import { Assessment, Inventory } from '@migration-planner-ui/api-client/models';

export interface CreateAssessmentRequest {
  name: string;
  sourceType: 'inventory' | 'rvtools' | 'agent';
  inventory?: Inventory;
  sourceId?: string;
  rvToolFile?: File;
}

export class AssessmentService {
  private baseUrl: string;

  constructor(baseUrl = '/planner/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create assessment from JSON inventory
   */
  async createFromInventory(
    name: string,
    inventory: Inventory,
  ): Promise<Assessment> {
    const response = await fetch(`${this.baseUrl}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        sourceType: 'inventory',
        inventory,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create assessment from inventory: ${errorText}`,
      );
    }

    return response.json();
  }

  /**
   * Create assessment from RVTools file (Excel)
   */
  async createFromRVTools(name: string, rvToolFile: File): Promise<Assessment> {
    const formData = new FormData();
    formData.append('name', name);

    // Convert File to Blob with generic content type to avoid MIME type issues
    const blob = new Blob([rvToolFile], {
      type: 'application/octet-stream',
    });
    formData.append('file', blob, rvToolFile.name);

    const response = await fetch(`${this.baseUrl}/assessments`, {
      method: 'POST',
      // Let browser set Content-Type automatically with correct boundary
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create assessment from RVTools: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create assessment from agent/source
   */
  async createFromAgent(name: string, sourceId: string): Promise<Assessment> {
    const response = await fetch(`${this.baseUrl}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        sourceType: 'agent',
        sourceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create assessment from agent: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generic create assessment method that routes to the appropriate specific method
   */
  async createAssessment(
    request: CreateAssessmentRequest,
  ): Promise<Assessment> {
    const assessmentName =
      request.name || `Assessment-${new Date().toISOString()}`;

    switch (request.sourceType) {
      case 'inventory':
        if (!request.inventory) {
          throw new Error(
            'Inventory data is required for inventory assessment',
          );
        }
        return this.createFromInventory(assessmentName, request.inventory);

      case 'rvtools':
        if (!request.rvToolFile) {
          throw new Error('RVTools file is required for RVTools assessment');
        }
        return this.createFromRVTools(assessmentName, request.rvToolFile);

      case 'agent':
        if (!request.sourceId) {
          throw new Error('Source ID is required for agent assessment');
        }
        return this.createFromAgent(assessmentName, request.sourceId);

      default:
        throw new Error(
          `Unsupported assessment source type: ${request.sourceType}`,
        );
    }
  }
}

// Export a singleton instance
export const assessmentService = new AssessmentService();
