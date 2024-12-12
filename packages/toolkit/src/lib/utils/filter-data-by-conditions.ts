import { parseDateToISO } from '.';
import { DateTime } from 'luxon';

export function filterPathsByConditions({
  conditionalPathFilters,
}: {
  conditionalPathFilters: ConditionalPathFilter[];
}) {
  if (!conditionalPathFilters || conditionalPathFilters.length === 0) {
    return [];
  } else {
    return conditionalPathFilters
      .filter((pathFilter) =>
        meetsAllConditionsUsingFilterFieldData({
          leccaFilter: pathFilter.filters,
        }),
      )
      .map((pathFilter) => pathFilter.pathId);
  }
}

export function filterDataByConditions({
  configValue,
  data,
}: {
  configValue: unknown & { leccaFilters?: LeccaFilter };
  data: unknown[];
}) {
  if (!data || data.length === 0) {
    return data;
  } else if (
    !configValue?.leccaFilters ||
    !configValue?.leccaFilters.filters ||
    configValue?.leccaFilters.filters.length === 0
  ) {
    return data;
  } else {
    return data.filter((d) =>
      meetsAllConditionsUsingInjectedData({
        data: d,
        leccaFilter: configValue.leccaFilters,
      }),
    );
  }
}

function meetsAllConditionsUsingFilterFieldData({
  leccaFilter,
}: {
  leccaFilter: LeccaFilter;
}) {
  //FilterGroups are 'OR'ed together
  //FilterFields are 'AND'ed together

  if (leccaFilter.operator === 'OR') {
    const result = leccaFilter.filters.some((filterGroup) => {
      return filterGroup.every((filterField) => {
        if (filterField.value == null) return true;

        return meetsSingleCondition({
          data: filterField.refValue,
          filterField,
        });
      });
    });

    return result;
  } else {
    throw new Error('Only OR operator is supported for conditions');
  }
}

function meetsAllConditionsUsingInjectedData({
  data,
  leccaFilter,
}: {
  data: unknown;
  leccaFilter: LeccaFilter;
}) {
  //FilterGroups are 'OR'ed together
  //FilterFields are 'AND'ed together

  if (leccaFilter.operator === 'OR') {
    const result = leccaFilter.filters.some((filterGroup) => {
      return filterGroup.every((filterField) => {
        if (filterField.value == null) return true;

        const extractedValue = extractDataUsingFieldIdPath({
          data,
          filterField,
        });

        return meetsSingleCondition({ data: extractedValue, filterField });
      });
    });

    return result;
  } else {
    throw new Error('Only OR operator is supported for conditions');
  }
}

function meetsSingleCondition({
  data,
  filterField,
}: {
  data: any;
  filterField: FilterFieldType;
}) {
  switch (filterField.condition) {
    case 'contains': {
      if (data == null) {
        return false;
      }
      return JSON.stringify(data).includes(filterField.value);
    }
    case 'does_not_contain': {
      if (data == null) {
        return false;
      }

      return !JSON.stringify(data).includes(filterField.value);
    }
    case 'equals': {
      if (data == null) {
        return false;
      }

      return JSON.stringify(data) == filterField.value; //Not === because this is all lose conditional checks
    }
    case 'does_not_equal': {
      if (data == null) {
        return false;
      }

      return JSON.stringify(data) != filterField.value; //Not !== because this is all lose conditional checks
    }
    case 'exists': {
      return data != null;
    }
    case 'does_not_exist': {
      return data == null;
    }
    case 'starts_with': {
      if (data == null) {
        return false;
      }

      return JSON.stringify(data).startsWith(filterField.value);
    }
    case 'ends_with': {
      if (data == null) {
        return false;
      }
      return JSON.stringify(data).endsWith(filterField.value);
    }
    case 'is_empty': {
      if (data == null) {
        return false;
      }

      if (typeof data === 'string') {
        return data === '';
      } else if (Array.isArray(data)) {
        return data.length === 0;
      } else if (typeof data === 'object') {
        return Object.keys(data).length === 0;
      } else {
        return false;
      }
    }
    case 'is_not_empty': {
      if (data == null) {
        return false;
      }

      if (typeof data === 'string') {
        return data !== '';
      } else if (Array.isArray(data)) {
        return data.length !== 0;
      } else if (typeof data === 'object') {
        return Object.keys(data).length !== 0;
      } else {
        return false;
      }
    }
    case 'comes_before': {
      if (data == null) {
        return false;
      }

      const extractedDate = parseDateToISO(data);

      return DateTime.fromISO(extractedDate).toMillis() <
        DateTime.fromISO(filterField.value).toMillis()
        ? true
        : false;
    }
    case 'comes_after': {
      if (data == null) {
        return false;
      }

      const extractedDate = parseDateToISO(data);

      return DateTime.fromISO(extractedDate).toMillis() >
        DateTime.fromISO(filterField.value).toMillis()
        ? true
        : false;
    }
    case 'is_in_the_past': {
      if (data == null) {
        return false;
      }

      const extractedDate = parseDateToISO(data);

      return DateTime.fromISO(extractedDate).toMillis() <
        DateTime.utc().toMillis()
        ? true
        : false;
    }
    case 'is_in_the_future': {
      if (data == null) {
        return false;
      }

      const extractedDate = parseDateToISO(data);

      return DateTime.fromISO(extractedDate).toMillis() >
        DateTime.utc().toMillis()
        ? true
        : false;
    }
    case 'is_true': {
      if (data == null) {
        return false;
      }

      return data === true || data === 'true';
    }
    case 'is_false': {
      if (data == null) {
        return false;
      }

      return data === false || data === 'false';
    }
    case 'is_truthy': {
      return !!data;
    }
    case 'is_falsey': {
      return !data;
    }
    case 'is_greater_than': {
      if (data == null) {
        return false;
      }

      return data > Number(filterField.value);
    }
    case 'is_less_than': {
      if (data == null) {
        return false;
      }

      return data < Number(filterField.value);
    }
    case 'is_greater_than_or_equal_to': {
      if (data == null) {
        return false;
      }

      return data >= Number(filterField.value);
    }
    case 'is_less_than_or_equal_to': {
      if (data == null) {
        return false;
      }

      return data <= Number(filterField.value);
    }
    case 'matches_regex': {
      if (data == null) {
        return false;
      }

      const regex = new RegExp(filterField.value);
      return regex.test(data);
    }
    case 'does_not_match_regex': {
      if (data == null) {
        return false;
      }

      const regex = new RegExp(filterField.value);
      return !regex.test(data);
    }
    default: {
      throw new Error(
        `Condition not implemented yet: ${filterField.condition}`,
      );
    }
  }
}

function extractDataUsingFieldIdPath({
  data,
  filterField,
}: {
  data: unknown;
  filterField: FilterFieldType;
}) {
  if (data == null) {
    return data;
  }

  let referenceValue = data as any;

  const referencePath = filterField.fieldId.split(',');

  referencePath.forEach((path) => {
    //If path is number, it's an array index
    //If path is not a number, it's a property

    if (isNaN(parseInt(path))) {
      referenceValue = referenceValue[path];
    } else if (!isNaN(parseInt(path))) {
      referenceValue = referenceValue[parseInt(path)];
    }
  });

  return referenceValue;
}

export const CONDITIONS = [
  {
    label: 'Contains',
    value: 'contains',
    type: 'text',
  },
  {
    label: 'Does not contain',
    value: 'does_not_contain',
    type: 'text',
  },
  {
    label: 'Equals',
    value: 'equals',
    type: 'text',
  },
  {
    label: 'Does not equal',
    value: 'does_not_equal',
    type: 'text',
  },
  {
    label: 'Exists',
    value: 'exists',
    type: 'boolean',
  },
  {
    label: 'Does not exist',
    value: 'does_not_exist',
    type: 'boolean',
  },
  {
    label: 'Starts with',
    value: 'starts_with',
    type: 'text',
  },
  {
    label: 'Ends with',
    value: 'ends_with',
    type: 'text',
  },
  {
    label: 'Is empty',
    value: 'is_empty',
    type: 'boolean',
  },
  {
    label: 'Is not empty',
    value: 'is_not_empty',
    type: 'boolean',
  },
  {
    label: 'Comes before',
    value: 'comes_before',
    type: 'date',
  },
  {
    label: 'Comes after',
    value: 'comes_after',
    type: 'date',
  },
  {
    label: 'Is in the past',
    value: 'is_in_the_past',
    type: 'date',
  },
  {
    label: 'Is in the future',
    value: 'is_in_the_future',
    type: 'date',
  },
  {
    label: 'Is true',
    value: 'is_true',
    type: 'boolean',
  },
  {
    label: 'Is false',
    value: 'is_false',
    type: 'boolean',
  },
  {
    label: 'Is truthy',
    value: 'is_truthy',
    type: 'boolean',
  },
  {
    label: 'Is falsey',
    value: 'is_falsey',
    type: 'boolean',
  },
  {
    label: 'Is greater than',
    value: 'is_greater_than',
    type: 'number',
  },
  {
    label: 'Is less than',
    value: 'is_less_than',
    type: 'number',
  },
  {
    label: 'Is greater than or equal to',
    value: 'is_greater_than_or_equal_to',
    type: 'number',
  },
  {
    label: 'Is less than or equal to',
    value: 'is_less_than_or_equal_to',
    type: 'number',
  },
  {
    label: 'Matches regex',
    value: 'matches_regex',
    type: 'text',
  },
  {
    label: 'Does not match regex',
    value: 'does_not_match_regex',
    type: 'text',
  },
] as const;

type CONDITION = (typeof CONDITIONS)[number]['value'];

/**
 * Conditions are the individual conditions that make up a filter.
 */
type FilterFieldType = {
  fieldId: string;
  //It's a string when it comes from the client, but then turns into the reference value
  refValue?: string | any;
  condition: CONDITION;
  label: string;
  value: string | undefined;
};

type FilterGroup = FilterFieldType[];

type LeccaFilter = { operator: 'OR'; filters: FilterGroup[] };

export type ConditionalPathFilter = {
  /**
   * Node Name (node.data.name) of the connected node
   */
  label: string;
  /**
   * This is the edge id of the connected edge
   */
  pathId: string;
  filters: LeccaFilter;
};
