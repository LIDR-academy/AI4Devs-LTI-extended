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


}); 