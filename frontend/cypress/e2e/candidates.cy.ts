describe('Candidates API', () => {
  const API_URL = 'http://localhost:3010';

  beforeEach(() => {
    // Limpiar cualquier estado previo
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('GET /candidates', () => {
    it('should return a list of candidates successfully', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body.data).to.be.an('array');
        expect(response.body.metadata).to.be.an('object');
        expect(response.body.metadata).to.have.property('total');
        expect(response.body.metadata).to.have.property('page');
        expect(response.body.metadata).to.have.property('limit');
        expect(response.body.metadata).to.have.property('totalPages');
      });
    });

    it('should handle pagination correctly', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?page=1&limit=10`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.length.at.most(10);
        expect(response.body.metadata).to.have.property('total');
        expect(response.body.metadata).to.have.property('page');
        expect(response.body.metadata).to.have.property('limit');
        expect(response.body.metadata.page).to.eq(1);
        expect(response.body.metadata.limit).to.eq(10);
      });
    });

    it('should filter candidates by search term', () => {
      // Primero verificar que hay candidatos en la base de datos
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates`,
      }).then((initialResponse) => {
        if (initialResponse.body.data.length > 0) {
          // Si hay candidatos, usar el primer nombre para buscar
          const firstCandidate = initialResponse.body.data[0];
          const searchTerm = firstCandidate.firstName.substring(0, 3);
          
          cy.request({
            method: 'GET',
            url: `${API_URL}/candidates?search=${searchTerm}`,
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data).to.be.an('array');
            // Verificar que los resultados contienen el término de búsqueda
            response.body.data.forEach((candidate: any) => {
              expect(
                candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).to.be.true;
            });
          });
        } else {
          // Si no hay candidatos, solo verificar que la búsqueda devuelve array vacío
          cy.request({
            method: 'GET',
            url: `${API_URL}/candidates?search=test`,
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data).to.be.an('array').that.is.empty;
          });
        }
      });
    });

    it('should handle invalid page number', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?page=-1`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('must be greater than');
      });
    });

    it('should handle invalid limit number', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?limit=0`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('must be greater than');
      });
    });

    it('should return empty array when no candidates match filters', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?search=nonexistentcandidate123xyz`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array').that.is.empty;
        expect(response.body.metadata.total).to.eq(0);
      });
    });

    it('should sort candidates by specified field', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?sort=firstName&order=asc`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array');
        
        if (response.body.data.length > 1) {
          // Solo verificar ordenamiento si hay más de un candidato
          const firstNames = response.body.data.map((candidate: any) => candidate.firstName);
          const sortedFirstNames = [...firstNames].sort();
          expect(firstNames).to.deep.equal(sortedFirstNames);
        }
      });
    });

    it('should sort candidates in descending order', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/candidates?sort=firstName&order=desc`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array');
        
        if (response.body.data.length > 1) {
          // Solo verificar ordenamiento si hay más de un candidato
          const firstNames = response.body.data.map((candidate: any) => candidate.firstName);
          const sortedFirstNames = [...firstNames].sort().reverse();
          expect(firstNames).to.deep.equal(sortedFirstNames);
        }
      });
    });
  });
}); 