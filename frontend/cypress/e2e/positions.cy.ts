describe('Positions API - Update', () => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:3010';
  let testPositionId: number;

  before(() => {
    // Obtener una posición existente para usar en los tests
    cy.request({
      method: 'GET',
      url: `${API_URL}/positions`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      if (response.body.length > 0) {
        testPositionId = response.body[0].id;
      } else {
        throw new Error('No positions available for testing. Please ensure test data exists.');
      }
    });
  });

  beforeEach(() => {
    // Limpiar cualquier estado previo
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('PUT /positions/:id', () => {
    it('should update a position successfully with all valid fields', () => {
      const updateData = {
        title: 'Updated Test Position',
        description: 'Updated description',
        status: 'Open',
        isVisible: true,
        location: 'Updated Location',
        jobDescription: 'Updated job description',
        requirements: 'Updated requirements',
        responsibilities: 'Updated responsibilities',
        salaryMin: 60000,
        salaryMax: 90000,
        employmentType: 'Part-time',
        benefits: 'Updated benefits',
        companyDescription: 'Updated company description',
        contactInfo: 'updated@example.com'
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: updateData
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Position updated successfully');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('title', updateData.title);
        expect(response.body.data).to.have.property('status', updateData.status);
        expect(response.body.data).to.have.property('isVisible', updateData.isVisible);
        expect(response.body.data).to.have.property('location', updateData.location);
      });
    });

    it('should return error when trying to update non-existent position', () => {
      const nonExistentId = 99999;
      const updateData = {
        title: 'Updated Title'
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${nonExistentId}`,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Position not found');
        expect(response.body).to.have.property('error');
      });
    });

    it('should return error when trying to update with invalid data', () => {
      const invalidData = {
        title: '', // Campo vacío
        salaryMin: -1000, // Salario negativo
        status: 'InvalidStatus' // Estado inválido
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
        expect(response.body).to.have.property('error');
      });
    });

    it('should validate that required fields cannot be empty', () => {
      const emptyFieldsData = {
        title: '',
        description: '',
        location: '',
        jobDescription: ''
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: emptyFieldsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
        expect(response.body.error).to.include('obligatorio');
      });
    });

    it('should return updated position with new data in response', () => {
      const updateData = {
        title: 'Verified Updated Position',
        status: 'Open',
        salaryMin: 55000,
        salaryMax: 85000
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: updateData
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('title', updateData.title);
        expect(response.body.data).to.have.property('status', updateData.status);
        expect(response.body.data).to.have.property('salaryMin', updateData.salaryMin);
        expect(response.body.data).to.have.property('salaryMax', updateData.salaryMax);
      });
    });

    it('should return error when trying to update with invalid ID format', () => {
      const invalidId = 'not-a-number';
      const updateData = {
        title: 'Updated Title'
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${invalidId}`,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Invalid position ID format');
        expect(response.body).to.have.property('error', 'Position ID must be a valid number');
      });
    });

    it('should verify that unmodified fields maintain their original values', () => {
      // Primero obtenemos los datos originales de la lista de posiciones
      cy.request({
        method: 'GET',
        url: `${API_URL}/positions`
      }).then((originalResponse) => {
        const originalData = originalResponse.body.find((pos: any) => pos.id === testPositionId);
        expect(originalData).to.exist;
        
        // Actualizamos solo algunos campos
        const partialUpdate = {
          title: 'Partially Updated Position',
          status: 'Open'
        };

        cy.request({
          method: 'PUT',
          url: `${API_URL}/positions/${testPositionId}`,
          body: partialUpdate
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          const updatedData = updateResponse.body.data;
          
          // Verificar que los campos actualizados cambiaron
          expect(updatedData.title).to.eq(partialUpdate.title);
          expect(updatedData.status).to.eq(partialUpdate.status);
          
          // Verificar que los campos no modificados mantienen sus valores
          expect(updatedData.description).to.eq(originalData.description);
          expect(updatedData.location).to.eq(originalData.location);
          expect(updatedData.salaryMin).to.eq(originalData.salaryMin);
          expect(updatedData.salaryMax).to.eq(originalData.salaryMax);
        });
      });
    });

    it('should validate salary range constraints', () => {
      const invalidSalaryData = {
        salaryMin: 100000,
        salaryMax: 50000 // Máximo menor que mínimo
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidSalaryData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
        expect(response.body.error).to.include('mínimo no puede ser mayor que el máximo');
      });
    });

    it('should return error when no data is provided for update', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'No data provided for update');
        expect(response.body).to.have.property('error', 'Request body cannot be empty');
      });
    });

    it('should validate status enum values', () => {
      const validStatuses = ['Open', 'Contratado', 'Cerrado', 'Borrador'];
      
      validStatuses.forEach((status) => {
        cy.request({
          method: 'PUT',
          url: `${API_URL}/positions/${testPositionId}`,
          body: { status: status }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.status).to.eq(status);
        });
      });
    });

    it('should return error for invalid company or interview flow references', () => {
      const invalidReferenceData = {
        companyId: 99999, // ID que no existe
        interviewFlowId: 99999 // ID que no existe
      };

      cy.request({
        method: 'PUT',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidReferenceData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Invalid reference data');
        expect(response.body.error).to.satisfy((error: string) => 
          error.includes('Company not found') || error.includes('Interview flow not found')
        );
      });
    });

    it('should handle partial updates correctly', () => {
      const partialUpdates = [
        { title: 'Only Title Updated' },
        { status: 'Open' },
        { isVisible: true },
        { salaryMin: 65000 },
        { location: 'New Location Only' }
      ];

      partialUpdates.forEach((updateData, index) => {
        cy.request({
          method: 'PUT',
          url: `${API_URL}/positions/${testPositionId}`,
          body: updateData
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('message', 'Position updated successfully');
          
          // Verificar que el campo específico se actualizó
          const fieldName = Object.keys(updateData)[0];
          const fieldValue = Object.values(updateData)[0];
          expect(response.body.data[fieldName]).to.eq(fieldValue);
        });
      });
    });
  });
}); 