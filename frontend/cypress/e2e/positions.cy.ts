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

describe('Position Edit UI Workflow', () => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:3010';
  let testPositionId: number;

  before(() => {
    // Get an existing position for testing
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
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should navigate to edit page when clicking Editar button', () => {
    cy.visit('/positions');
    cy.get(`[data-testid="edit-position-${testPositionId}"]`).should('exist').click();
    cy.url().should('include', `/positions/${testPositionId}/edit`);
  });

  it('should display edit form with position data loaded', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Verify form fields are present
    cy.get('[data-testid="position-title-input"]').should('exist');
    cy.get('[data-testid="position-status-select"]').should('exist');
    cy.get('[data-testid="position-description-input"]').should('exist');
    cy.get('[data-testid="position-location-input"]').should('exist');
    cy.get('[data-testid="position-job-description-input"]').should('exist');
    cy.get('[data-testid="position-requirements-input"]').should('exist');
    cy.get('[data-testid="position-responsibilities-input"]').should('exist');
    cy.get('[data-testid="position-salary-min-input"]').should('exist');
    cy.get('[data-testid="position-salary-max-input"]').should('exist');
    cy.get('[data-testid="position-benefits-input"]').should('exist');
    cy.get('[data-testid="position-company-description-input"]').should('exist');
    cy.get('[data-testid="position-deadline-input"]').should('exist');
    cy.get('[data-testid="position-contact-info-input"]').should('exist');
    
    // Verify form is populated with data (at least title should have value)
    cy.get('[data-testid="position-title-input"]').should('have.value').and('not.be.empty');
  });

  it('should update position successfully', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Wait for form to load
    cy.get('[data-testid="position-title-input"]').should('exist');
    
    // Modify title and description
    cy.get('[data-testid="position-title-input"]').clear().type('Updated Position Title');
    cy.get('[data-testid="position-description-input"]').clear().type('Updated description text');
    
    // Click save button
    cy.get('[data-testid="save-button"]').click();
    
    // Verify success message appears
    cy.contains('Position updated successfully').should('be.visible');
    
    // Verify navigation to positions list after delay
    cy.url({ timeout: 5000 }).should('include', '/positions');
  });

  it('should update status dropdown value', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    cy.get('[data-testid="position-status-select"]').should('exist');
    cy.get('[data-testid="position-status-select"]').select('Open');
    
    cy.get('[data-testid="save-button"]').click();
    cy.contains('Position updated successfully').should('be.visible');
  });

  it('should handle salary range validation', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Enter invalid salary range (min > max)
    cy.get('[data-testid="position-salary-min-input"]').clear().type('90000');
    cy.get('[data-testid="position-salary-max-input"]').clear().type('60000');
    
    cy.get('[data-testid="save-button"]').click();
    
    // Verify validation error message displayed (from backend)
    cy.contains('mínimo no puede ser mayor que el máximo', { timeout: 5000 }).should('be.visible');
  });

  it('should navigate back when clicking Cancel button', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Make changes to form
    cy.get('[data-testid="position-title-input"]').clear().type('Unsaved Changes');
    
    // Click cancel button
    cy.get('[data-testid="cancel-button"]').click();
    
    // Verify navigation to positions list
    cy.url().should('include', '/positions');
    
    // Verify changes are not saved (title should not be updated)
    cy.visit(`/positions/${testPositionId}/edit`);
    cy.get('[data-testid="position-title-input"]').should('not.have.value', 'Unsaved Changes');
  });

  it('should display error message for invalid position ID', () => {
    cy.visit('/positions/99999/edit');
    
    // Verify error message displayed
    cy.contains('Position not found', { timeout: 5000 }).should('be.visible');
  });

  it('should show loading spinner during initial fetch', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Loading spinner should appear briefly
    cy.get('.spinner-border', { timeout: 1000 }).should('exist');
    
    // Form should load after spinner disappears
    cy.get('[data-testid="position-title-input"]', { timeout: 5000 }).should('exist');
  });

  it('should disable Save button during save operation', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    cy.get('[data-testid="position-title-input"]').clear().type('Test Save Disabled');
    
    cy.get('[data-testid="save-button"]').click();
    
    // Verify button shows "Guardando..." text
    cy.contains('Guardando...').should('be.visible');
    
    // Verify button is disabled
    cy.get('[data-testid="save-button"]').should('be.disabled');
  });

  it('should display back button and navigate correctly', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Verify back button exists
    cy.get('[data-testid="back-to-positions"]').should('exist').and('contain', 'Volver a Posiciones');
    
    // Click back button
    cy.get('[data-testid="back-to-positions"]').click();
    
    // Verify navigation to positions list
    cy.url().should('include', '/positions');
  });

  it('should format date field correctly', () => {
    cy.visit(`/positions/${testPositionId}/edit`);
    
    // Wait for form to load
    cy.get('[data-testid="position-deadline-input"]').should('exist');
    
    // Date input should accept date format YYYY-MM-DD
    cy.get('[data-testid="position-deadline-input"]').should('have.attr', 'type', 'date');
  });
}); 