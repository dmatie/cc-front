export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult extends ValidationResult {
  sanitizedValue?: string;
}

export class ValidationUtils {
  private static readonly PATTERNS = {
    COMMENT: /^[a-zA-Z0-9\sÀ-ÿ.,!?;:()'"\-\n\r@#€$%&*+=/_]+$/,
    NAME: /^[a-zA-ZÀ-ÿ\s'\-]+$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\+?[\d\s\-()]+$/,
    AMOUNT: /^\d+(\.\d{1,2})?$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  };

  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /&#\d+;/g,
    /%3C/gi,
    /%3E/gi,
  ];

  private static readonly LENGTH_LIMITS = {
    COMMENT: { min: 10, max: 1500 },
    NAME: { min: 2, max: 100 },
    EMAIL: { min: 5, max: 254 },
    PHONE: { min: 10, max: 20 },
    SHORT_TEXT: { min: 1, max: 255 },
    LONG_TEXT: { min: 1, max: 3000 },
  };

  static validateComment(
    value: string,
    fieldName: string = 'Comment'
  ): FieldValidationResult {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    const trimmed = value.trim();
    const { min, max } = this.LENGTH_LIMITS.COMMENT;

    if (trimmed.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters`);
    }

    if (trimmed.length > max) {
      errors.push(`${fieldName} must not exceed ${max} characters`);
    }

    if (!this.PATTERNS.COMMENT.test(trimmed)) {
      errors.push(
        `${fieldName} contains invalid characters. Only letters, numbers, and common punctuation are allowed`
      );
    }

    if (this.containsDangerousPatterns(trimmed)) {
      errors.push(`${fieldName} contains potentially dangerous content`);
    }

    if (this.containsControlCharacters(trimmed)) {
      errors.push(`${fieldName} contains invalid control characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : undefined,
    };
  }

  static validateName(value: string, fieldName: string = 'Name'): FieldValidationResult {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    const trimmed = value.trim();
    const { min, max } = this.LENGTH_LIMITS.NAME;

    if (trimmed.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters`);
    }

    if (trimmed.length > max) {
      errors.push(`${fieldName} must not exceed ${max} characters`);
    }

    if (!this.PATTERNS.NAME.test(trimmed)) {
      errors.push(
        `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : undefined,
    };
  }

  static validateEmail(value: string): FieldValidationResult {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    const trimmed = value.trim().toLowerCase();
    const { min, max } = this.LENGTH_LIMITS.EMAIL;

    if (trimmed.length < min || trimmed.length > max) {
      errors.push(`Email must be between ${min} and ${max} characters`);
    }

    if (!this.PATTERNS.EMAIL.test(trimmed)) {
      errors.push('Email format is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : undefined,
    };
  }

  static validatePhone(value: string): FieldValidationResult {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push('Phone number is required');
      return { isValid: false, errors };
    }

    const trimmed = value.trim();
    const { min, max } = this.LENGTH_LIMITS.PHONE;

    if (trimmed.length < min || trimmed.length > max) {
      errors.push(`Phone number must be between ${min} and ${max} characters`);
    }

    if (!this.PATTERNS.PHONE.test(trimmed)) {
      errors.push('Phone number can only contain digits, +, spaces, hyphens, and parentheses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? trimmed : undefined,
    };
  }

  static validateAmount(value: string | number, min: number = 0.01, max: number = 1000000): FieldValidationResult {
    const errors: string[] = [];

    if (value === null || value === undefined || value === '') {
      errors.push('Amount is required');
      return { isValid: false, errors };
    }

    const stringValue = String(value);

    if (!this.PATTERNS.AMOUNT.test(stringValue)) {
      errors.push('Amount must be a valid number');
    }

    const numValue = parseFloat(stringValue);

    if (isNaN(numValue)) {
      errors.push('Amount must be a valid number');
    }

    if (numValue < min) {
      errors.push(`Amount must be at least ${min}`);
    }

    if (numValue > max) {
      errors.push(`Amount must not exceed ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? stringValue : undefined,
    };
  }

  static validateRequired(value: string | number | null | undefined, fieldName: string): FieldValidationResult {
    const errors: string[] = [];

    if (value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
      errors.push(`${fieldName} is required`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): FieldValidationResult {
    const errors: string[] = [];
    const trimmed = value.trim();

    if (trimmed.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters`);
    }

    if (trimmed.length > max) {
      errors.push(`${fieldName} must not exceed ${max} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static containsDangerousPatterns(value: string): boolean {
    return this.DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
  }

  private static containsControlCharacters(value: string): boolean {
    return /[\x00-\x1F\x7F]/.test(value);
  }

  static isValidUUID(value: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(value);
  }

  static sanitizeForDisplay(value: string): string {
    if (!value) return '';

    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
