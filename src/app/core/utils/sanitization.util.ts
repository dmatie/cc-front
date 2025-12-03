export class SanitizationUtils {
  static sanitizeInput(value: string): string {
    if (!value) return '';

    let sanitized = value.trim();

    sanitized = this.removeControlCharacters(sanitized);
    sanitized = this.removeNullBytes(sanitized);
    sanitized = this.normalizeWhitespace(sanitized);

    return sanitized;
  }

  static sanitizeComment(value: string): string {
    if (!value) return '';

    let sanitized = this.sanitizeInput(value);

    sanitized = this.removeHtmlTags(sanitized);
    sanitized = this.removeJavaScriptProtocol(sanitized);
    sanitized = this.removeEventHandlers(sanitized);

    return sanitized;
  }

  static escapeHtml(value: string): string {
    if (!value) return '';

    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  static unescapeHtml(value: string): string {
    if (!value) return '';

    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent || '';
  }

  static removeHtmlTags(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }

  static removeJavaScriptProtocol(value: string): string {
    return value.replace(/javascript:/gi, '');
  }

  static removeEventHandlers(value: string): string {
    return value.replace(/on\w+\s*=/gi, '');
  }

  static removeControlCharacters(value: string): string {
    return value.replace(/[\x00-\x1F\x7F]/g, '');
  }

  static removeNullBytes(value: string): string {
    return value.replace(/\0/g, '');
  }

  static normalizeWhitespace(value: string): string {
    return value
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/  +/g, ' ');
  }

  static stripNonAlphanumeric(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, '');
  }

  static stripNonNumeric(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  static normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  static normalizePhone(value: string): string {
    return value.replace(/[\s\-()]/g, '');
  }

  static truncate(value: string, maxLength: number): string {
    if (!value || value.length <= maxLength) return value;
    return value.substring(0, maxLength);
  }

  static removeExcessiveLineBreaks(value: string, maxConsecutive: number = 2): string {
    const pattern = new RegExp(`\\n{${maxConsecutive + 1},}`, 'g');
    return value.replace(pattern, '\n'.repeat(maxConsecutive));
  }

  static removeLeadingTrailingSpaces(value: string): string {
    return value
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
  }

  static sanitizeFileName(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9\-_.]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  static sanitizeUrl(value: string): string {
    try {
      const url = new URL(value);

      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }

      return url.toString();
    } catch {
      return '';
    }
  }

  static removeScriptTags(value: string): string {
    return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  static removeIframeTags(value: string): string {
    return value.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  static removeObjectTags(value: string): string {
    return value.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  }

  static removeEmbedTags(value: string): string {
    return value.replace(/<embed\b[^>]*>/gi, '');
  }

  static removeHtmlEntities(value: string): string {
    return value.replace(/&#?\w+;/g, '');
  }

  static removeUrlEncodedChars(value: string): string {
    return value.replace(/%[0-9A-Fa-f]{2}/g, '');
  }

  static sanitizeForDatabase(value: string): string {
    let sanitized = this.sanitizeInput(value);
    sanitized = this.removeHtmlTags(sanitized);
    sanitized = this.removeJavaScriptProtocol(sanitized);
    sanitized = this.removeEventHandlers(sanitized);
    sanitized = this.removeHtmlEntities(sanitized);

    return sanitized;
  }

  static isClean(value: string): boolean {
    if (!value) return true;

    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /javascript:/i,
      /on\w+=/i,
      /&#/,
      /%3C/i,
      /%3E/i,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(value));
  }
}
