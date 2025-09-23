import React from 'react';
import { ManagementPageConfig, CustomWidget } from '@/types/management.type';
import GenericErrorBoundary from './GenericErrorBoundary';
import { StatCard } from './StatCard';
import { DataTable } from './Datatable';
import { useTheme } from '@/context/ThemeContext';

interface ManagementPageProps<T extends { id: string | number }> {
  config: ManagementPageConfig<T>;
}

const ManagementPage = <T extends { id: string | number }>({ config }: ManagementPageProps<T>) => {
  const { isDarkMode } = useTheme();
  const { data, isLoading } = config.useDataHook();

  const handleEdit = (id: string | number) => {
  const editAction = config.actions?.find(action => action.label === 'Edit');
  editAction?.onClick(String(id)); // 🔁 force en string
};

 const handleDelete = (id: string | number) => {
  const deleteAction = config.actions?.find(action => action.label === 'Delete');
  deleteAction?.onClick(String(id)); // 🔁 force en string
};
const handleView = (id: string | number) => {
  const viewAction = config.actions?.find(action => action.label === 'View');
  viewAction?.onClick(String(id));
};

  const filterOptions = config.filters?.map(filter => ({
    label: filter.label,
    columnId: filter.key,
    type: 'select' as const,
    options: filter.options,
    position: 'dropdown' as const,
  })) || [];

  const renderWidget = (widget: CustomWidget<T>) => {
    if (widget.showWhen && !widget.showWhen(data || [], isLoading)) {
      return null;
    }

    const content = typeof widget.component === 'function'
      ? widget.component(data || [], isLoading)
      : widget.component;

    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3',
      full: 'col-span-full'
    };

    return (
      <div
        key={widget.id}
        className={`
          ${sizeClasses[widget.size || 'medium']}
          ${widget.className || ''}
        `}
        style={{ order: widget.order || 0 }}
      >
        {widget.title && (
          <h3 className={`text-lg font-medium mb-4 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {widget.title}
          </h3>
        )}
        {content}
      </div>
    );
  };

  const getWidgetsByPosition = (position: 'top' | 'bottom' | 'left' | 'right') => {
    return config.widgets
      ?.filter(widget => widget.position === position)
      ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
  };

  const topWidgets = getWidgetsByPosition('top');
  const bottomWidgets = getWidgetsByPosition('bottom');
  const leftWidgets = getWidgetsByPosition('left');
  const rightWidgets = getWidgetsByPosition('right');

  // Classes CSS dynamiques basées sur le thème
  // const pageClasses = `min-h-screen transition-colors duration-300 ${
  //   isDarkMode 
  //     ? 'bg-gray-900 text-gray-100' 
  //     : 'bg-white text-gray-900'
  // }`;

  const cardClasses = `rounded-lg shadow-lg transition-colors duration-300 ${
    isDarkMode 
      ? 'bg-gray-800 shadow-gray-900/50' 
      : 'bg-white shadow-gray-200/50'
  }`;

  const buttonPrimaryClasses = `px-4 py-2 rounded-lg transition-all duration-300 ${
    isDarkMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50'
      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25'
  }`;

  const buttonSecondaryClasses = `px-4 py-2 border rounded-lg transition-all duration-300 ${
    isDarkMode
      ? 'border-blue-500 text-blue-400 hover:bg-blue-900/50 hover:border-blue-400'
      : 'border-brand-500 text-brand-500 hover:bg-brand-50 hover:border-brand-600'
  }`;

  return (
    <GenericErrorBoundary>
      {/* <div className={pageClasses}> */}
      <div>
        {/* Header avec titre et boutons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3 sm:gap-0">
          <h1 className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {config.title}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            {config.secondaryButton && (
              <button
                onClick={config.secondaryButton.onClick}
                className={buttonSecondaryClasses}
              >
                {config.secondaryButton.label}
              </button>
            )}
            {config.addNewButton && (
              <button
                onClick={config.addNewButton.onClick}
                className={buttonPrimaryClasses}
              >
                {config.addNewButton.label}
              </button>
            )}
          </div>
        </div>

        {/* Section des statistiques */}
        {config.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {config.stats.map((stat, index) => (
              <StatCard
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                bgColor={stat.bgColor}
                textColor={stat.textColor}
                iconBgColor={stat.iconBgColor}
              />
            ))}
          </div>
        )}

        {/* Widgets du haut */}
        {topWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {topWidgets.map(renderWidget)}
          </div>
        )}

        {/* Grille principale avec widgets latéraux et table */}
        <div className="grid grid-cols-12 gap-6">
          {/* Widgets de gauche */}
          {leftWidgets.length > 0 && (
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {leftWidgets.map(renderWidget)}
            </div>
          )}

          {/* Table de données principale */}
          <div className={`
            col-span-12
            ${leftWidgets.length > 0 && rightWidgets.length > 0 ? 'lg:col-span-6' :
              leftWidgets.length > 0 || rightWidgets.length > 0 ? 'lg:col-span-9' : ''}
          `}>
            <div className={cardClasses}>
              <DataTable<T>
                data={data || []}
                columns={config.columns}
                title={config.title}
                loading={isLoading}
                onEdit={config.actions?.some(a => a.label === 'Edit') ? handleEdit : undefined}
                onView={config.actions?.some(a => a.label === 'View') ? handleView : undefined}
                onDelete={config.actions?.some(a => a.label === 'Delete') ? handleDelete : undefined}
                filterOptions={filterOptions}
                keyExtractor={(item) => String(item.id)}
                readOnly={config.readOnly}
                onViewDetails={config.onViewDetails}
              />
            </div>
          </div>

          {/* Widgets de droite */}
          {rightWidgets.length > 0 && (
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {rightWidgets.map(renderWidget)}
            </div>
          )}
        </div>

        {/* Widgets du bas */}
        {bottomWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {bottomWidgets.map(renderWidget)}
          </div>
        )}
      </div>
    </GenericErrorBoundary>
  );
};

export default ManagementPage;