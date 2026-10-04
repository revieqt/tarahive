import { AIProviderToolDefinition, ToolCall, ToolExecutionResult } from '../ai.types';

const DEFAULT_THEME_COLOR = '#FF6B6B';
const HEADER_TYPES = new Set(['header1', 'header2', 'header3']);
const SUPPORTED_BLOCK_TYPES = new Set(['header1', 'header2', 'header3', 'text', 'location', 'toggle', 'divider']);
const SUPPORTED_ADDRESS_FIELDS = new Set([
  'country',
  'region',
  'province',
  'city',
  'district',
  'neighborhood',
  'postal_code',
]);

export interface DraftValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ItineraryDraft {
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  themeColor: string;
  content: Array<Record<string, unknown>>;
}

export const createItineraryDraftTool: AIProviderToolDefinition = {
  name: 'create_itinerary_draft',
  type: 'function',
  description: 'Validate and return a structured itinerary draft without saving anything to the database. This is for AI-assisted drafting and review before the frontend creates the itinerary.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The itinerary title.',
      },
      type: {
        type: 'string',
        description: 'The itinerary type or category.',
      },
      startDate: {
        type: 'string',
        description: 'The itinerary start date in ISO format (YYYY-MM-DD or similar valid date string).',
      },
      endDate: {
        type: 'string',
        description: 'The itinerary end date in ISO format (YYYY-MM-DD or similar valid date string).',
      },
      themeColor: {
        type: 'string',
        description: 'Optional hex color such as #FF6B6B. Defaults to #FF6B6B when omitted.',
      },
      content: {
        type: 'array',
        description: 'Array of itinerary blocks such as text, headers, checklist, divider, and location objects.',
        items: {
          type: 'object',
        },
      },
    },
    required: ['type', 'startDate', 'endDate', 'content'],
  },
};

export function validateItineraryDraft(input: unknown): {
  success: boolean;
  itinerary?: ItineraryDraft;
  errors: DraftValidationError[];
} {
  const errors: DraftValidationError[] = [];

  const raw = isRecord(input) && isRecord((input as Record<string, unknown>).itinerary)
    ? (input as Record<string, unknown>).itinerary as Record<string, unknown>
    : isRecord(input)
      ? input as Record<string, unknown>
      : {};

  if (!isRecord(input)) {
    return {
      success: false,
      errors: [
        {
          field: 'itinerary',
          code: 'INVALID_ITINERARY',
          message: 'The itinerary draft must be an object.',
        },
      ],
    };
  }

  const itineraryType = getTrimmedString(raw.type);
  const title = getTrimmedString(raw.title) ?? buildFallbackTitle(itineraryType);
  if (title.length > 200) {
    errors.push({
      field: 'title',
      code: 'INVALID_LENGTH',
      message: 'The itinerary title is too long.',
    });
  }
  if (!itineraryType) {
    errors.push({
      field: 'type',
      code: 'REQUIRED_FIELD',
      message: 'The itinerary type is required.',
    });
  } else if (itineraryType.length > 100) {
    errors.push({
      field: 'type',
      code: 'INVALID_LENGTH',
      message: 'The itinerary type is too long.',
    });
  }

  const startDateResult = validateDateValue(raw.startDate, 'startDate');
  if (!startDateResult.valid) {
    errors.push(startDateResult.error!);
  }

  const endDateResult = validateDateValue(raw.endDate, 'endDate');
  if (!endDateResult.valid) {
    errors.push(endDateResult.error!);
  }

  if (startDateResult.valid && endDateResult.valid) {
    const startTimestamp = Date.parse(startDateResult.value!);
    const endTimestamp = Date.parse(endDateResult.value!);

    if (startTimestamp > endTimestamp) {
      errors.push({
        field: 'endDate',
        code: 'INVALID_DATE_RANGE',
        message: 'The itinerary end date must be on or after the start date.',
      });
    }
  }

  let themeColor = DEFAULT_THEME_COLOR;
  const suppliedThemeColor = getTrimmedString(raw.themeColor);
  if (suppliedThemeColor) {
    if (!/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(suppliedThemeColor)) {
      errors.push({
        field: 'themeColor',
        code: 'INVALID_THEME_COLOR',
        message: 'The themeColor must be a valid hex color such as #FF6B6B.',
      });
    } else {
      themeColor = suppliedThemeColor;
    }
  }

  const content = raw.content;
  if (!Array.isArray(content)) {
    errors.push({
      field: 'content',
      code: 'INVALID_BLOCKS',
      message: 'The itinerary content must be an array of blocks.',
    });
  }

  const normalizedBlocks: Array<Record<string, unknown>> = [];
  if (Array.isArray(content)) {
    for (let index = 0; index < content.length; index += 1) {
      const block = content[index];
      const blockValidation = validateBlock(block, index);

      if (!blockValidation.valid) {
        errors.push(...blockValidation.errors);
      } else {
        normalizedBlocks.push(blockValidation.block!);
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    itinerary: {
      title,
      type: itineraryType!,
      startDate: startDateResult.value!,
      endDate: endDateResult.value!,
      themeColor,
      content: normalizedBlocks,
    },
    errors: [],
  };
}

export async function executeCreateItineraryDraftTool(toolCall: ToolCall): Promise<ToolExecutionResult> {
  const args = toolCall.arguments ?? {};

  if (!isRecord(args)) {
    return {
      toolName: 'create_itinerary_draft',
      content: JSON.stringify({
        success: false,
        message: 'The itinerary draft is malformed. Please provide a valid itinerary object.',
        errors: [{
          field: 'itinerary',
          code: 'INVALID_ARGUMENTS',
          message: 'Tool arguments must be an object.',
        }],
      }, null, 2),
      success: false,
      error: 'Invalid create_itinerary_draft arguments.',
    };
  }

  const result = validateItineraryDraft(args);

  if (!result.success || !result.itinerary) {
    return {
      toolName: 'create_itinerary_draft',
      content: JSON.stringify({
        success: false,
        message: 'The itinerary draft could not be validated. Please fix the draft and try again.',
        errors: result.errors,
      }, null, 2),
      success: false,
      error: 'Itinerary draft validation failed.',
    };
  }

  return {
    toolName: 'create_itinerary_draft',
    content: JSON.stringify({
      success: true,
      message: 'I created a structured itinerary draft for review. Please check the dates and blocks before approving it.',
      itinerary: result.itinerary,
    }, null, 2),
    success: true,
  };
}

function validateDateValue(value: unknown, fieldName: string): { valid: boolean; value?: string; error?: DraftValidationError } {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return {
      valid: false,
      error: {
        field: fieldName,
        code: 'REQUIRED_FIELD',
        message: `The ${fieldName} is required.`,
      },
    };
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return {
        valid: false,
        error: {
          field: fieldName,
          code: 'INVALID_DATE',
          message: `The ${fieldName} must be a valid date.`,
        },
      };
    }

    return {
      valid: true,
      value: value.toISOString().slice(0, 10),
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: {
        field: fieldName,
        code: 'INVALID_DATE',
        message: `The ${fieldName} must be a valid date string.`,
      },
    };
  }

  const trimmed = value.trim();
  const timestamp = Date.parse(trimmed);

  if (Number.isNaN(timestamp)) {
    return {
      valid: false,
      error: {
        field: fieldName,
        code: 'INVALID_DATE',
        message: `The ${fieldName} must be a valid date.`,
      },
    };
  }

  return {
    valid: true,
    value: trimmed,
  };
}

function validateBlock(block: unknown, index: number): { valid: boolean; block?: Record<string, unknown>; errors: DraftValidationError[] } {
  const errors: DraftValidationError[] = [];

  if (!isRecord(block)) {
    return {
      valid: false,
      errors: [{
        field: `content[${index}]`,
        code: 'INVALID_BLOCK',
        message: 'The block does not match the expected itinerary structure.',
      }],
    };
  }

  const blockRecord = block as Record<string, unknown>;
  const type = typeof blockRecord.type === 'string' ? blockRecord.type : '';
  if (!type) {
    return {
      valid: false,
      errors: [{
        field: `content[${index}].type`,
        code: 'INVALID_BLOCK',
        message: 'Each block must include a valid type.',
      }],
    };
  }

  if (!SUPPORTED_BLOCK_TYPES.has(type)) {
    return {
      valid: false,
      errors: [{
        field: `content[${index}].type`,
        code: 'UNSUPPORTED_BLOCK_TYPE',
        message: `The block type "${type}" is not supported by the current itinerary schema.`,
      }],
    };
  }

  const supportedKeysByType: Record<string, string[]> = {
    header1: ['id', 'type', 'value'],
    header2: ['id', 'type', 'value'],
    header3: ['id', 'type', 'value'],
    text: ['id', 'type', 'value'],
    location: ['id', 'type', 'latitude', 'longitude', 'locationName', 'address'],
    toggle: ['id', 'type', 'value', 'checked'],
    divider: ['id', 'type'],
  };

  const supportedKeys = supportedKeysByType[type] ?? [];
  const unknownKeys = Object.keys(blockRecord).filter((key) => !supportedKeys.includes(key));
  for (const unknownKey of unknownKeys) {
    errors.push({
      field: `content[${index}].${unknownKey}`,
      code: 'UNSUPPORTED_PROPERTY',
      message: `The property "${unknownKey}" is not supported for a ${type} block.`,
    });
  }

  const id = getTrimmedString(blockRecord.id);
  if (!id) {
    errors.push({
      field: `content[${index}].id`,
      code: 'REQUIRED_FIELD',
      message: 'Each itinerary block requires an id.',
    });
  }

  switch (type) {
    case 'header1':
    case 'header2':
    case 'header3': {
      const value = getTrimmedString(blockRecord.value);
      if (!value) {
        errors.push({
          field: `content[${index}].value`,
          code: 'REQUIRED_FIELD',
          message: 'Header blocks require a value.',
        });
      }
      if (errors.length > 0) {
        return { valid: false, errors };
      }
      return {
        valid: true,
        block: {
          id: id!,
          type,
          value: value!,
        },
        errors: [],
      };
    }
    case 'text': {
      const value = getTrimmedString(blockRecord.value);
      if (!value) {
        errors.push({
          field: `content[${index}].value`,
          code: 'REQUIRED_FIELD',
          message: 'Text blocks require a value.',
        });
      }
      if (errors.length > 0) {
        return { valid: false, errors };
      }
      return {
        valid: true,
        block: {
          id: id!,
          type: 'text',
          value: value!,
        },
        errors: [],
      };
    }
    case 'location': {
      const latitude = typeof blockRecord.latitude === 'number' ? blockRecord.latitude : Number(blockRecord.latitude);
      const longitude = typeof blockRecord.longitude === 'number' ? blockRecord.longitude : Number(blockRecord.longitude);
      const locationName = getTrimmedString(blockRecord.locationName);

      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        errors.push({
          field: `content[${index}].latitude`,
          code: 'INVALID_LOCATION',
          message: 'Location latitude must be a number between -90 and 90.',
        });
      }

      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        errors.push({
          field: `content[${index}].longitude`,
          code: 'INVALID_LOCATION',
          message: 'Location longitude must be a number between -180 and 180.',
        });
      }

      if (!locationName) {
        errors.push({
          field: `content[${index}].locationName`,
          code: 'REQUIRED_FIELD',
          message: 'Location blocks require a locationName.',
        });
      }

      const addressValue = blockRecord.address;
      if (!isRecord(addressValue)) {
        errors.push({
          field: `content[${index}].address`,
          code: 'INVALID_LOCATION',
          message: 'Location blocks require an address object.',
        });
      } else {
        const address = addressValue as Record<string, unknown>;
        for (const addressKey of Object.keys(address)) {
          if (!SUPPORTED_ADDRESS_FIELDS.has(addressKey)) {
            errors.push({
              field: `content[${index}].address.${addressKey}`,
              code: 'UNSUPPORTED_PROPERTY',
              message: `The address field "${addressKey}" is not supported in the current schema.`,
            });
          }
        }
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return {
        valid: true,
        block: {
          id: id!,
          type: 'location',
          latitude: latitude as number,
          longitude: longitude as number,
          locationName: locationName!,
          address: sanitizeAddress(addressValue as Record<string, unknown>),
        },
        errors: [],
      };
    }
    case 'toggle': {
      const value = getTrimmedString(blockRecord.value);
      const checked = blockRecord.checked;

      if (!value) {
        errors.push({
          field: `content[${index}].value`,
          code: 'REQUIRED_FIELD',
          message: 'Checklist blocks require a value.',
        });
      }

      if (typeof checked !== 'boolean') {
        errors.push({
          field: `content[${index}].checked`,
          code: 'INVALID_CHECKLIST',
          message: 'Checklist blocks require a boolean checked value.',
        });
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return {
        valid: true,
        block: {
          id: id!,
          type: 'toggle',
          value: value!,
          checked: checked as boolean,
        },
        errors: [],
      };
    }
    case 'divider': {
      if (errors.length > 0) {
        return { valid: false, errors };
      }
      return {
        valid: true,
        block: {
          id: id!,
          type: 'divider',
        },
        errors: [],
      };
    }
    default:
      return {
        valid: false,
        errors: [{
          field: `content[${index}]`,
          code: 'INVALID_BLOCK',
          message: 'The block does not match the expected itinerary structure.',
        }],
      };
  }
}

function sanitizeAddress(address: Record<string, unknown>): Record<string, string | undefined> {
  const cleaned: Record<string, string | undefined> = {};

  for (const key of SUPPORTED_ADDRESS_FIELDS) {
    const value = address[key];
    if (typeof value === 'string' && value.trim()) {
      cleaned[key] = value.trim();
    }
  }

  return cleaned;
}

function buildFallbackTitle(itineraryType: string | null): string {
  if (itineraryType && itineraryType.trim()) {
    return `${itineraryType.trim()} itinerary`;
  }

  return 'Untitled itinerary';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
