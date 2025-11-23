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
  private fetchApi: typeof fetch;

  constructor(baseUrl: string, fetchApi: typeof fetch = fetch) {
    this.baseUrl = baseUrl;
    this.fetchApi = fetchApi;
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

    const response = await this.fetchApi(`${this.baseUrl}/api/v1/assessments`, {
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

  async createAssessment(
    request: CreateAssessmentRequest,
  ): Promise<Assessment> {
    const assessmentName =
      request.name || `Assessment-${new Date().toISOString()}`;

    if (!request.rvToolFile) {
      throw new Error('RVTools file is required for RVTools assessment');
    }
    return this.createFromRVTools(assessmentName, request.rvToolFile);
  }
}

// Note: Create instance with proper baseUrl from caller
