/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";

// Mock the store
jest.mock("../app/store", () => mockedStore);

// Tests to ensure that the bills page functions correctly for a user who is connected as an employee.
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    // Test to check that the bill icon in vertical layout is highlighted
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Set up the local storage with user data
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Create the root element and append it to the document body
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Call the router and navigate to the bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for the window icon to be displayed and check that it has the class "active-icon"
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => windowIcon);
      // [Bug Hunt] - Bills:la modale doit afficher l'image.
      // add the expect() function  to perform a test assertion to verify
      // that the windowIcon element has the expected class of "active-icon"
      expect(windowIcon).toHaveClass("active-icon");
    });
  })
})
    // Test to check that bills are ordered from earliest to latest
    test("Then bills should be ordered from earliest to latest", () => {
      // Render the bills UI with the bills data
      document.body.innerHTML = BillsUI({
        data: bills,
      });

      // Get all the dates and sort them in descending order
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // Check that the dates are equal to the sorted dates
      expect(dates).toEqual(datesSorted);
    });







      
    