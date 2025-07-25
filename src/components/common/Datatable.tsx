"use client";
import { useRef } from 'react';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState,
  Row,
  Cell
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const isClickableElement = (element: HTMLElement): boolean => {
  const clickableSelectors = [
    'button',
    'a',
    '[role="button"]',
    '[data-no-row-click]',
    '.no-row-click',
    '.modal-trigger',
    '.dropdown-trigger'
  ];
 
  return clickableSelectors.some(selector => {
    return element.matches(selector) || element.closest(selector);
  });
};

export interface FilterOption {
  label: string;
  columnId: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  type: 'select' | 'radio' | 'date' | 'text';
  radioOptions?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  position?: 'left' | 'dropdown';
  placeholder?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  loading?: boolean;
  error?: string | null;
 onEdit?: (id: string) => void;        // ✅ Changé de number à string
  onDelete?: (id: string) => void;      // ✅ Changé de number à string
  onViewDetails?: (item: T) => void;
  filterOptions?: FilterOption[];
  keyExtractor: (item: T) => string;    // ✅ Changé de number à string
  readOnly?: boolean;
}

// Skeleton loader component
const SkeletonRow = ({ columnsCount, isDarkMode }: { columnsCount: number; isDarkMode: boolean }) => (
  <tr className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
    {Array.from({ length: columnsCount }, (_, index) => (
      <td key={index} className="py-3 pr-4">
        <div className={`animate-pulse h-4 rounded w-full ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}></div>
      </td>
    ))}
  </tr>
);

const SkeletonTable = ({ columnsCount, rowsCount = 5, isDarkMode }: { 
  columnsCount: number; 
  rowsCount?: number;
  isDarkMode: boolean;
}) => (
  <tbody className="text-sm">
    {Array.from({ length: rowsCount }, (_, index) => (
      <SkeletonRow key={index} columnsCount={columnsCount} isDarkMode={isDarkMode} />
    ))}
  </tbody>
);

export function DataTable<T extends object>({
  data,
  columns,
  title,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onViewDetails,
  filterOptions = [],
  keyExtractor,
  readOnly = false
}: DataTableProps<T>) {
  const { isDarkMode } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilterValues, setSelectedFilterValues] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Separate filters by position
  const leftFilters = filterOptions.filter(filter => filter.position === 'left');
  const dropdownFilters = filterOptions.filter(filter => filter.position !== 'left');
 
  // Combine provided columns with actions columns (no selection column)
  const allColumns: ColumnDef<T>[] = [
    ...columns,
    // Colonne d'actions seulement si pas en mode lecture seule ET qu'il y a des actions (edit ou delete uniquement)
    ...(readOnly ? [] : (onEdit || onDelete) ? [{
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<T> }) => (
        <div className="flex space-x-2">
          {onEdit && (
            <motion.button
              className={`p-1 rounded-full disabled:opacity-50 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-800' 
                  : 'hover:bg-gray-100'
              }`}
              whileHover={!loading ? { 
                scale: 1.15, 
                backgroundColor: isDarkMode ? "#1e293b" : "#f0f9ff" 
              } : {}}
              whileTap={!loading ? { scale: 0.9 } : {}}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(keyExtractor(row.original));
              }}
              disabled={loading}
              aria-label={`Edit item ${row.id}`}
            >
              <Edit className="h-4 w-4 text-blue-500" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              className={`p-1 rounded-full disabled:opacity-50 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-800' 
                  : 'hover:bg-gray-100'
              }`}
              whileHover={!loading ? { 
                scale: 1.15, 
                backgroundColor: isDarkMode ? "#1e293b" : "#fef2f2" 
              } : {}}
              whileTap={!loading ? { scale: 0.9 } : {}}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(keyExtractor(row.original));
              }}
              disabled={loading}
              aria-label={`Delete item ${row.id}`}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </motion.button>
          )}
        </div>
      ),
    }] : []),
  ];

  // Handle row click for view details
  const handleRowClick = (row: Row<T>, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
 
    // Ne pas naviguer si le clic provient d'un élément interactif
    if (isClickableElement(target)) {
      return;
    }
 
    if (onViewDetails && !loading) {
      onViewDetails(row.original);
    }
  };
 
  // Memoize the table instance
  const table = useReactTable({
    data: loading ? [] : data,
    columns: allColumns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
 
  // Handle refresh
  // const handleRefresh = async () => {
  //   if (onRefresh && !isRefreshing) {
  //     setIsRefreshing(true);
  //     try {
  //       await onRefresh();
  //       setMessage?.('Data refreshed successfully', 'success');
  //     } catch (error) {
  //       setMessage?.('Failed to refresh data', 'error');
  //     } finally {
  //       setIsRefreshing(false);
  //     }
  //   }
  // };
 
  // Handle filter changes
  const handleFilterChange = (columnId: string, value: string) => {
    if (loading) return;
   
    setSelectedFilterValues(prev => ({
      ...prev,
      [columnId]: value
    }));
   
    if (value && value !== `Select ${columnId}`) {
      setColumnFilters(prev => {
        const filtered = prev.filter(filter => filter.id !== columnId);
        return [...filtered, { id: columnId, value }];
      });
    } else {
      setColumnFilters(prev => prev.filter(filter => filter.id !== columnId));
    }
  };
 
  // Clear specific filter
  const clearFilter = (columnId: string) => {
    if (loading) return;
   
    setSelectedFilterValues(prev => {
      const newValues = {...prev};
      delete newValues[columnId];
      return newValues;
    });
   
    setColumnFilters(prev => prev.filter(filter => filter.id !== columnId));
  };
 
  // Reset all filters
  const resetAllFilters = () => {
    if (loading) return;
   
    setSelectedFilterValues({});
    setColumnFilters([]);
    setGlobalFilter('');
  };
 
  // Render a single filter based on its type
  const renderFilter = (filter: FilterOption) => {
    const inputClasses = `w-full py-2 pl-3 pr-10 border rounded-md appearance-none text-sm disabled:opacity-50 transition-colors ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-400' 
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
    }`;

    const textInputClasses = `w-full pl-3 pr-8 py-2 border rounded-md text-sm disabled:opacity-50 transition-colors ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }`;

    switch (filter.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              className={inputClasses}
              value={selectedFilterValues[filter.columnId] || `Select ${filter.label}`}
              onChange={(e) => handleFilterChange(filter.columnId, e.target.value)}
              disabled={loading}
              aria-label={`Filter by ${filter.label.toLowerCase()}`}
            >
              <option>Select {filter.label}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <ChevronRight className={`h-4 w-4 rotate-90 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-400'
              }`} />
            </div>
          </div>
        );
       
      case 'radio':
        return (
          <div className="space-y-2">
            {filter.radioOptions?.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  id={option.id}
                  name={filter.columnId}
                  className="mr-2"
                  disabled={loading}
                  onClick={() => handleFilterChange(filter.columnId, option.value)}
                />
                <label 
                  htmlFor={option.id} 
                  className={`text-sm ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
       
      case 'date':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="date"
                className={textInputClasses}
                value={selectedFilterValues[filter.columnId] || ''}
                disabled={loading}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    handleFilterChange(filter.columnId, date);
                  } else {
                    clearFilter(filter.columnId);
                  }
                }}
              />
              {selectedFilterValues[filter.columnId] && (
                <button
                  className={`ml-2 disabled:opacity-50 transition-colors ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={() => clearFilter(filter.columnId)}
                  disabled={loading}
                  aria-label="Clear date filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
       
      case 'text':
        return (
          <div className="relative">
            <input
              type="text"
              placeholder={filter.placeholder || `Filter by ${filter.label}`}
              className={textInputClasses}
              value={selectedFilterValues[filter.columnId] || ''}
              disabled={loading}
              onChange={(e) => handleFilterChange(filter.columnId, e.target.value)}
              aria-label={`Filter by ${filter.label.toLowerCase()}`}
            />
            {selectedFilterValues[filter.columnId] && (
              <button
                className={`absolute right-2 top-2.5 disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => clearFilter(filter.columnId)}
                disabled={loading}
                aria-label="Clear filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
       
      default:
        return null;
    }
  };
 
  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${
        isDarkMode
          ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
          : 'bg-white/70 border-slate-200 backdrop-blur-sm'
      } border`}
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-slate-100' : 'text-gray-900'
            }`}>
              {title}
            </h2>
            {/* {onRefresh && (
              <motion.button
                className={`p-2 rounded-full disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-700 text-slate-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                whileHover={!loading && !isRefreshing ? { scale: 1.1 } : {}}
                whileTap={!loading && !isRefreshing ? { scale: 0.9 } : {}}
                aria-label="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            )} */}
          </div>
         
          {/* Error message */}
          {error && (
            <div className={`text-sm px-3 py-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-red-400 bg-red-900/20' 
                : 'text-red-500 bg-red-50'
            }`}>
              {error}
            </div>
          )}
        </div>
       
        <div className="mb-4">
          {/* Left side filters + global search */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search here..."
                className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
                value={globalFilter || ''}
                disabled={loading}
                onChange={(e) => setGlobalFilter(e.target.value)}
                aria-label="Search items"
              />
              <Search className={`absolute left-3 top-2.5 h-4 w-4 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-400'
              }`} />
              {globalFilter && (
                <button
                  className={`absolute right-2 top-2.5 disabled:opacity-50 transition-colors ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={() => setGlobalFilter('')}
                  disabled={loading}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
           
            {/* Left-aligned filters */}
            {leftFilters.map((filter) => (
              <div key={filter.columnId} className="w-auto min-w-40" aria-label={`${filter.label} filter`}>
                {renderFilter(filter)}
              </div>
            ))}
         
            {dropdownFilters.length > 0 && (
              <div className="flex justify-end">
                <div className="relative">
                  <motion.button
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-md text-sm disabled:opacity-50 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    disabled={loading}
                    whileHover={!loading ? { 
                      backgroundColor: isDarkMode ? "#334155" : "#f9fafb" 
                    } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    aria-expanded={isFilterOpen}
                    aria-controls="filter-dropdown"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </motion.button>
                 
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        ref={filterRef}
                        id="filter-dropdown"
                        className={`absolute right-0 mt-2 w-64 border rounded-md shadow-lg z-10 p-4 transition-colors ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-600' 
                            : 'bg-white border-gray-200'
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {dropdownFilters.map((filter) => (
                          <div key={filter.columnId} className="mb-4">
                            <h3 className={`font-medium mb-2 text-sm ${
                              isDarkMode ? 'text-slate-200' : 'text-gray-700'
                            }`}>
                              Filter by {filter.label}
                            </h3>
                            {renderFilter(filter)}
                          </div>
                        ))}
                       
                        {/* Reset all filters button */}
                        {Object.keys(selectedFilterValues).length > 0 && (
                          <motion.button
                            className={`w-full mt-2 py-2 px-4 rounded text-sm font-medium disabled:opacity-50 transition-colors ${
                              isDarkMode 
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                            onClick={resetAllFilters}
                            disabled={loading}
                            whileHover={!loading ? { 
                              backgroundColor: isDarkMode ? "#475569" : "#f3f4f6" 
                            } : {}}
                            whileTap={!loading ? { scale: 0.97 } : {}}
                            aria-label="Reset all filters"
                          >
                            Reset all filters
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
         
          {/* Display active filters */}
          {Object.keys(selectedFilterValues).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(selectedFilterValues).map(([columnId, value]) => {
                const filterOption = filterOptions.find(option => option.columnId === columnId);
                return (
                  <div 
                    key={columnId} 
                    className={`flex items-center rounded-full px-3 py-1 text-xs transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span>{filterOption?.label}: {value}</span>
                    <button
                      className={`ml-2 disabled:opacity-50 transition-colors ${
                        isDarkMode 
                          ? 'text-blue-300 hover:text-blue-100' 
                          : 'text-blue-700 hover:text-blue-900'
                      }`}
                      onClick={() => clearFilter(columnId)}
                      disabled={loading}
                      aria-label={`Remove ${filterOption?.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {Object.keys(selectedFilterValues).length > 1 && (
                <button
                  className={`flex items-center rounded-full px-3 py-1 text-xs disabled:opacity-50 transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={resetAllFilters}
                  disabled={loading}
                  aria-label="Clear all filters"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
       
        <div className="overflow-x-auto">
          <table className="min-w-full" role="grid" aria-label={`${title} table`}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className={`text-left text-sm font-normal ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="pb-3 pr-4"
                      scope="col"
                      onClick={!loading ? header.column.getToggleSortingHandler() : undefined}
                      style={header.column.getCanSort() && !loading ? { cursor: 'pointer' } : {}}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          {loading && header.id !== 'actions' ? (
                            <div className={`animate-pulse h-4 rounded w-20 ${
                              isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                            }`}></div>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                          {!loading && (
                            {
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
           
            {loading ? (
              <SkeletonTable columnsCount={allColumns.length} isDarkMode={isDarkMode} />
            ) : (
              <tbody className="text-sm">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <motion.tr
                      key={row.id}
                      className={`border-t transition-colors ${
                        isDarkMode 
                          ? 'border-slate-700 hover:bg-slate-700/50 text-slate-200' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-900'
                      } ${onViewDetails ? 'cursor-pointer' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => handleRowClick(row, e)}
                    >
                      {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                        <td key={cell.id} className="py-3 pr-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={allColumns.length} className={`py-6 text-center ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
       
        <div className={`flex items-center justify-between mt-4 text-sm ${
          isDarkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          <div>
            {loading ? (
              <div className={`animate-pulse h-4 rounded w-32 ${
                isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
              }`}></div>
            ) : (
              table.getRowModel().rows.length > 0 ? (
                <>
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                  {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPreFilteredRowModel().rows.length)} of {table.getPreFilteredRowModel().rows.length}
                </>
              ) : (
                '0 records'
              )
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span>Items per page:</span>
              <select
                className={`border rounded p-1 text-sm disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                value={table.getState().pagination.pageSize}
                disabled={loading}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                aria-label="Items per page"
              >
                {[10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center" aria-label="Pagination">
              <motion.button
                className={`p-1 rounded border disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
                whileHover={table.getCanPreviousPage() && !loading ? { 
                  backgroundColor: isDarkMode ? "#334155" : "#f9fafb" 
                } : {}}
                whileTap={table.getCanPreviousPage() && !loading ? { scale: 0.95 } : {}}
                aria-label="Previous page"
              >
                <ChevronLeft className={`h-4 w-4 ${
                  !table.getCanPreviousPage() || loading ? 
                    (isDarkMode ? 'text-slate-600' : 'text-gray-300') : 
                    (isDarkMode ? 'text-slate-300' : 'text-gray-600')
                }`} />
              </motion.button>
              <div className="px-4" aria-current="page">
                {loading ? (
                  <div className={`animate-pulse h-4 rounded w-8 ${
                    isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}></div>
                ) : (
                  <>
                    {table.getState().pagination.pageIndex + 1}/
                    {table.getPageCount() || 1}
                  </>
                )}
              </div>
              <motion.button
                className={`p-1 rounded border disabled:opacity-50 transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
                whileHover={table.getCanNextPage() && !loading ? { 
                  backgroundColor: isDarkMode ? "#334155" : "#f9fafb" 
                } : {}}
                whileTap={table.getCanNextPage() && !loading ? { scale: 0.95 } : {}}
                aria-label="Next page"
              >
                <ChevronRight className={`h-4 w-4 ${
                  !table.getCanNextPage() || loading ? 
                    (isDarkMode ? 'text-slate-600' : 'text-gray-300') : 
                    (isDarkMode ? 'text-slate-300' : 'text-gray-600')
                }`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}