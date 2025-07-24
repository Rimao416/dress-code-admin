import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

export interface Column<T = object> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface ActionButton {
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick: (id: string) => void;
  icon?: ReactNode;
}

export interface StatsCard {
  value: string | number;
  label: string;
  icon: ReactNode;
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
}

export interface CustomWidget<T extends { id: string | number }> {
  id: string;
  title?: string;
  component: ReactNode | ((data: T[], isLoading?: boolean) => ReactNode);
  position: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  order?: number;
  showWhen?: (data: T[], isLoading?: boolean) => boolean;
}

export interface ManagementPageConfig<T extends { id: string | number }> {
  title: string;
  useDataHook: () => {
    data: T[] | undefined;
    isLoading: boolean;
    isFetching?: boolean;
    error?: Error;
    refetch?: () => void;
  };
  columns: ColumnDef<T>[];
  actions?: ActionButton[];
  stats?: StatsCard[];
  widgets?: CustomWidget<T>[];
  addNewButton?: {
    label: string;
    onClick: () => void;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  readOnly?: boolean;
  onViewDetails?: (item: T) => void;
}