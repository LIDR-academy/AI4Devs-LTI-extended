import React, { useState } from 'react';
import { Table, Dropdown, Spinner } from 'react-bootstrap';
import { ThreeDots } from 'react-bootstrap-icons';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface SimpleTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
}

function SimpleTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onSort,
  onView,
  onEdit,
  onDelete,
  keyExtractor,
}: SimpleTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
    onSort(key, newOrder);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <span className="table-sort-icon table-sort-icon-inactive">▼</span>;
    }
    return (
      <span className="table-sort-icon">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`table-header ${column.sortable ? 'cursor-pointer user-select-none' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                {column.label}
                {column.sortable && renderSortIcon(column.key)}
              </th>
            ))}
            {(onView || onEdit || onDelete) && (
              <th className="table-header table-cell-narrow">
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={keyExtractor(item)}>
                {columns.map((column) => (
                  <td key={`${keyExtractor(item)}-${column.key}`} className="table-cell">
                    {column.render
                      ? column.render(item, index)
                      : item[column.key]
                    }
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="table-cell-narrow">
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="link"
                        className="p-0 border-0 text-dark table-action-btn"
                      >
                        <ThreeDots size={20} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {onView && (
                          <Dropdown.Item onClick={() => onView(item)}>
                            Ver detalles
                          </Dropdown.Item>
                        )}
                        {onEdit && (
                          <Dropdown.Item onClick={() => onEdit(item)}>
                            Editar
                          </Dropdown.Item>
                        )}
                        {onDelete && (
                          <>
                            {(onView || onEdit) && <Dropdown.Divider />}
                            <Dropdown.Item onClick={() => onDelete(item)} className="text-danger">
                              Eliminar
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default SimpleTable;
