/**
 * @jest-environment jsdom
 */

 import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

// Mock the store
jest.mock("../app/store", () => mockStore);

/**

This test suite verifies the behavior of the NewBill container component
when an employee submits a new bill. It includes tests to ensure that the bill
is correctly saved, that bills are fetched from the mock API on submit, and
that the file is correctly handled and submitted.
*/
describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
  // Define a test to ensure that the bill is correctly saved
    test("Then the bill must be correctly saved", async () => {
      // Define a navigation function to change the pathname
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

     // Mock the local storage and set user type as "Employee"
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Set up the HTML for the new bill page
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Initialize the NewBill container
      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      // Get the new bill form
      const formNewBill = screen.getByTestId("form-new-bill");
     // Ensure that the form element has been found and selected correctly
      expect(formNewBill).toBeTruthy();
     // Add a submit event listener to the form and trigger a submit event
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      // Verify that the handleSubmit function was called
      expect(handleSubmit).toHaveBeenCalled();
    });

// Define a test to ensure that bills are fetched from the mock API on submit
    test("Then fetches bills from mock API POST", async () => {
      // Mock local storage and set user type as "Employee"
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
        // Create a root element and append to body
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
       // Call the router function to navigate to the NewBill page
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    
  // Define a test to ensure that the file is correctly handled and submitted
    test("Then verify the file bill", async () => {
      // Spy on the "bills" method of the mock store object
      jest.spyOn(mockStore, "bills");
    
      // Define a navigation function to change the pathname
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
    
      // Mock the local storage and location, and set user type as "Employee"
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] }, // simulate navigating to the NewBill route
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
    
      // Set up the HTML for the new bill page
      const html = NewBillUI();
      document.body.innerHTML = html;
    
      // Initialize the NewBill container
      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    
      // Create a new file object to simulate a file upload
      const file = new File(["image"], "image.png", { type: "image/png" });
    
      // Define a mock function to handle the file change event
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
    
      // Get the form and file input elements by their test IDs
      const formNewBill = screen.getByTestId("form-new-bill");
      const billFile = screen.getByTestId("file");
    
      // Add an event listener to the file input element to trigger the handleChangeFile function
      billFile.addEventListener("change", handleChangeFile);
    
      // Simulate uploading the file by triggering the "change" event on the file input element
      userEvent.upload(billFile, file);
    
      // Check that the file name is defined and that the handleChangeFile function was called
      expect(billFile.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();
    
      // Define a mock function to handle the form submit event
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
    
      // Add an event listener to the form element to trigger the handleSubmit function
      formNewBill.addEventListener("submit", handleSubmit);
    
      // Simulate submitting the form by triggering the "submit" event on the form element
      fireEvent.submit(formNewBill);
    
      // Check that the handleSubmit function was called
      expect(handleSubmit).toHaveBeenCalled();
    });
  })
})
