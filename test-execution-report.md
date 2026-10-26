# HotelHub frontend test execution report

## Run summary

| Field | Result |
|---|---|
| Test scope | Static HotelHub frontend only |
| Execution date | 2026-10-13 |
| Runner | Cypress 16.1.1 |
| Browser | Electron 146, headless |
| Frontend base URL | `http://127.0.0.1:5500` |
| Command | `npm run cy:run -- --browser electron` |
| Spec | `cypress/e2e/hotelhub.cy.js` |
| Result | **7 passed, 0 failed** |
| Duration | Approximately 10 seconds |
| Screenshots/videos | No screenshots; video recording disabled |

The frontend was served locally over HTTP for the run. The suite clears browser local storage before each case.

## Case results

| Test case ID | Executed scenario | Result | Evidence |
|---|---|---|---|
| HOME-01 | Home hero and popular-hotel cards render | Passed | Cypress asserted visible hero text and exactly three popular-hotel cards. |
| SEARCH-06 | Search no-match empty state | Passed | Cypress searched `no-such-hotel`, asserted “No hotels found”, and asserted pagination was hidden. |
| SEARCH-07 | Search filter and reset regression | Passed | Cypress verified the initial six-card page, a Miami name/city match, four results for capacity 4, then reset to six cards and four pages. |
| LOGIN-02 | Invalid user credentials rejected | Passed | Cypress asserted the invalid-credentials alert for the configured user email and incorrect password. |
| LOGIN-01 | Configured demo user login succeeds | Passed | Cypress asserted the success alert, navigation to `search.html`, and one `hotelUsers` record. |
| BOOK-01 | Required booking fields rejected | Passed | Cypress asserted the required-fields alert when submitting an empty booking. |
| BOOK-02 | Online booking is stored and moves to payment | Passed | Cypress asserted URL-populated hotel/price, success message, booking fields in `hotelBookings`, and navigation to `payment.html`. |
| REVIEW-01–03 | Browser demo OTP and review happy path | Passed | Cypress captured the generated four-digit OTP from the alert, verified it, submitted a five-star review, asserted success, and checked the saved review in local storage. |

The final run output reported: `Tests: 7`, `Passing: 7`, `Failing: 0`, `Screenshots: 0`, `Video: false`, `All specs passed!`

## Known limits

- This execution did not test the Spring Boot API or MySQL.
- These frontend flows use sample data/local storage; passing does not establish server persistence or real authentication, SMS, payment, or synchronization.
- Offline booking, theme/font controls, admin dashboard, chatbot, and payment page were not exercised in this run.
- Cypress emitted a warning that Electron is deprecated as a test browser in a future Cypress release. This did not prevent the run from passing.
- The earlier exploratory Cypress runs had test-harness failures while the spec was being corrected; the final run above is the successful post-correction execution.
