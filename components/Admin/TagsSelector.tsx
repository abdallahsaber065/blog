'use client';

import React from 'react';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import type { MultiValueRemoveProps } from 'react-select';
import { X } from 'lucide-react';

const animatedComponents = makeAnimated();

/**
 * Only customize the remove *button* (icon + handler). We do NOT replace MultiValue.
 * Replacing MultiValue caused the selected list to not re-render when value prop
 * changed (remove worked in state/submit but pill stayed visible). Using the default
 * MultiValue keeps the list driven by the library's value prop so UI stays in sync.
 */
function TagsMultiValueRemove<Option>({ innerProps }: MultiValueRemoveProps<Option, true>) {
  return (
    <span
      {...innerProps}
      className="ml-0.5 -mr-0.5 inline-flex shrink-0 cursor-pointer items-center rounded p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
      aria-label="Remove tag"
    >
      <X className="h-3 w-3" />
    </span>
  );
}

const components = {
  ...animatedComponents,
  MultiValueRemove: TagsMultiValueRemove,
  ClearIndicator: () => null,
};

/** Design-system-aware styles for react-select (gold focus, radius, surfaces) */
const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused?: boolean }) => ({
    ...base,
    minHeight: 42,
    borderRadius: 'var(--radius)',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.3)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: 'var(--radius)',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--popover))',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    padding: 4,
    maxHeight: 280,
  }),
  option: (base: Record<string, unknown>, state: { isFocused?: boolean; isSelected?: boolean }) => ({
    ...base,
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: '10px 12px',
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? 'hsl(var(--primary) / 0.2)' : state.isFocused ? 'hsl(var(--muted))' : 'transparent',
    color: 'hsl(var(--foreground))',
    cursor: 'pointer',
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    gap: '8px',
    padding: '6px',
    flexWrap: 'wrap' as const,
  }),
  multiValue: (base: Record<string, unknown>) => ({
    ...base,
    margin: 0,
    borderRadius: '0.5rem',
    border: '1px solid hsl(var(--primary) / 0.4)',
    backgroundColor: 'hsl(var(--primary) / 0.15)',
    padding: '2px 6px 2px 10px',
    alignItems: 'center',
  }),
  multiValueLabel: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
    maxWidth: '160px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValueRemove: () => ({}),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    padding: '8px',
    '&:hover': { color: 'hsl(var(--foreground))' },
  }),
  clearIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': { color: 'hsl(var(--foreground))' },
  }),
};

export type TagsOption = { label: string; value: string } | { id: number; name: string };

export interface TagsSelectorProps<
  Option extends TagsOption = { label: string; value: string },
  IsMulti extends boolean = true,
> {
  value: Option[] | { label: string; value: string }[];
  onChange: (value: Option[] | { label: string; value: string }[] | null) => void;
  options: Option[] | { label: string; value: string }[];
  onCreateOption?: (inputValue: string) => void;
  getOptionLabel?: (option: Option) => string;
  getOptionValue?: (option: Option) => string;
  formatCreateLabel?: (inputValue: string) => string;
  placeholder?: string;
  className?: string;
  classNamePrefix?: string;
  isDisabled?: boolean;
  'data-tour'?: string;
}

function TagsSelector<
  Option extends TagsOption = { label: string; value: string },
  IsMulti extends boolean = true,
>({
  value,
  onChange,
  options,
  onCreateOption,
  getOptionLabel,
  getOptionValue,
  formatCreateLabel,
  placeholder = 'Select or create tags...',
  className = 'tags-select my-react-select-container',
  classNamePrefix = 'my-react-select',
  isDisabled,
  'data-tour': dataTour,
}: TagsSelectorProps<Option, IsMulti>) {
  return (
    <CreatableSelect<Option, true>
      isMulti
      components={components}
      value={value as Option[]}
      onChange={(selected) => onChange(selected as Option[] | null)}
      options={options as readonly Option[]}
      onCreateOption={onCreateOption}
      getOptionLabel={getOptionLabel as (option: Option) => string}
      getOptionValue={getOptionValue as (option: Option) => string}
      formatCreateLabel={formatCreateLabel}
      placeholder={placeholder}
      className={className}
      classNamePrefix={classNamePrefix}
      styles={selectStyles}
      isDisabled={isDisabled}
      data-tour={dataTour}
      noOptionsMessage={() => 'Type to create a new tag'}
      isClearable={false}
    />
  );
}

export default TagsSelector;
