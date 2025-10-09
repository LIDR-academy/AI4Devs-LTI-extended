import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import SimpleTable, { Column } from './SimpleTable';
import TablePagination from './TablePagination';

interface DemoData {
  id: number;
  name: string;
  email: string;
  position: string;
  status: string;
  date: string;
}

const TableDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos de ejemplo
  const sampleData: DemoData[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      position: 'Desarrollador Frontend',
      status: 'Activo',
      date: '12/12/2024'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria.garcia@example.com',
      position: 'Desarrollador Backend',
      status: 'En revisión',
      date: '11/12/2024'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      position: 'Diseñador UX/UI',
      status: 'Activo',
      date: '10/12/2024'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      position: 'Product Manager',
      status: 'Completado',
      date: '09/12/2024'
    },
    {
      id: 5,
      name: 'Luis Fernández',
      email: 'luis.fernandez@example.com',
      position: 'DevOps Engineer',
      status: 'Activo',
      date: '08/12/2024'
    },
    {
      id: 6,
      name: 'Sofia López',
      email: 'sofia.lopez@example.com',
      position: 'QA Engineer',
      status: 'En revisión',
      date: '07/12/2024'
    },
    {
      id: 7,
      name: 'Diego Sánchez',
      email: 'diego.sanchez@example.com',
      position: 'Data Scientist',
      status: 'Activo',
      date: '06/12/2024'
    },
    {
      id: 8,
      name: 'Laura Ramírez',
      email: 'laura.ramirez@example.com',
      position: 'Scrum Master',
      status: 'Completado',
      date: '05/12/2024'
    },
    {
      id: 9,
      name: 'Miguel Torres',
      email: 'miguel.torres@example.com',
      position: 'Desarrollador Full Stack',
      status: 'Activo',
      date: '04/12/2024'
    },
    {
      id: 10,
      name: 'Isabel Ruiz',
      email: 'isabel.ruiz@example.com',
      position: 'Mobile Developer',
      status: 'En revisión',
      date: '03/12/2024'
    }
  ];

  const columns: Column<DemoData>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'position',
      label: 'Posición',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: false,
      render: (item) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'Activo':
              return 'success';
            case 'En revisión':
              return 'warning';
            case 'Completado':
              return 'info';
            default:
              return 'secondary';
          }
        };

        return (
          <span className={`badge bg-${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        );
      }
    },
    {
      key: 'date',
      label: 'Fecha',
      sortable: true,
    }
  ];

  const handleView = (item: DemoData) => {
    alert(`Ver detalles de: ${item.name}`);
  };

  const handleEdit = (item: DemoData) => {
    alert(`Editar: ${item.name}`);
  };

  const handleDelete = (item: DemoData) => {
    if (window.confirm(`¿Eliminar a ${item.name}?`)) {
      alert(`${item.name} eliminado`);
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    console.log(`Ordenar por ${key} en orden ${order}`);
    // Aquí implementarías la lógica de ordenamiento
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title className="mb-4">
          <h5>Demo: Tabla Simple</h5>
          <small className="text-muted">
            Ejemplo de uso de SimpleTable y TablePagination
          </small>
        </Card.Title>

        <SimpleTable
          data={sampleData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(sampleData.length / itemsPerPage)}
          totalItems={sampleData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </Card.Body>
    </Card>
  );
};

export default TableDemo;
