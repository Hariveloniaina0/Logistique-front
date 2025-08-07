export interface FileAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  type?: string;
}

export interface ImportStep {
  step: number;
  title: string;
  completed: boolean;
  current?: boolean;
}

export interface MappingValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ImportProgress {
  currentStep: number;
  totalSteps: number;
  isProcessing: boolean;
  message?: string;
}

export interface ImportHeaders {
  headers: string[];
}

export interface ImportResult {
  message: string;
  importedCount: number;
  errors?: string[];
  skippedCount?: number;
}

export interface FieldMapping {
  [fileHeader: string]: string;
}