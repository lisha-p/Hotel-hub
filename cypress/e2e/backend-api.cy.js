const apiUrl = () => Cypress.env("apiUrl");

describe("HotelHub backend API (read-only)", () => {
  it("returns the hotel collection and supports a no-match search", () => {
    cy.request(`${apiUrl()}/api/hotels`).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body).to.be.an("array");
    });

    cy.request(
      `${apiUrl()}/api/hotels/search?query=cypress-no-match-${Date.now()}`
    ).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body).to.deep.equal([]);
    });
  });

  it("returns 404 for a hotel ID outside the database ID range", () => {
    cy.request({
      url: `${apiUrl()}/api/hotels/9223372036854775807`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(404);
    });
  });

  it("returns booking collections and an empty result for a unique test email", () => {
    const email = `cypress-${Date.now()}@example.invalid`;

    cy.request(`${apiUrl()}/api/bookings`).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body).to.be.an("array");
    });

    cy.request(
      `${apiUrl()}/api/bookings/email/${encodeURIComponent(email)}`
    ).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body).to.deep.equal([]);
    });
  });

  it("returns review collections and correctly shaped statistics", () => {
    ["", "/verified", "/pending"].forEach((path) => {
      cy.request(`${apiUrl()}/api/reviews${path}`).then(({ status, body }) => {
        expect(status).to.equal(200);
        expect(body).to.be.an("array");
      });
    });

    cy.request(`${apiUrl()}/api/reviews/stats`).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body).to.have.all.keys(
        "totalReviews",
        "verifiedReviews",
        "averageRating",
        "pendingReviews"
      );
      expect(body.totalReviews).to.be.a("number");
      expect(body.verifiedReviews).to.be.a("number");
      expect(body.averageRating).to.be.a("number");
      expect(body.pendingReviews).to.be.a("number");
    });
  });
});
