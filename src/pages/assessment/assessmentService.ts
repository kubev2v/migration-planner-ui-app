import { Assessment } from '@migration-planner-ui/api-client/models';

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
      let errorMessage = 'Failed to create assessment from RVTools';

      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch {
        // Fallback handled below
      }

      // Handle specific status codes
      if (response.status === 409) {
        errorMessage =
          errorMessage ||
          'An assessment with this name already exists. Please choose a different name.';
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

// Note: Create instance with proper baseUrl from caller
