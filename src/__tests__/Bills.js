// /**
//  * @jest-environment jsdom
//  */

import { screen, waitFor, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { formatStatus } from "../app/format.js";
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

      // add the expect() function  to perform a test assertion to verify
      // that the windowIcon element has the expected class of "active-icon"
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => windowIcon);
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
// Test the behavior when the bills page is loading.
describe("When I navigate to the bills page and it is loading", () => {
  test("Then the loading page should be rendered", () => {
    document.body.innerHTML = BillsUI({ loading: true });

    // Ensure that the loading message is visible.
    expect(screen.getByText("Loading...")).toBeVisible();
    document.body.innerHTML = "";
  });
});

// Test to check if the new bill button is present
describe("When the Bills page is rendered", () => {
  test("Then the new bill button should be present", () => {
    // Define the onNavigate function to render the ROUTES
    const onNavigate = pathname => {
      document.body.innerHTML = ROUTES({ pathname });
    };

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

    // Create a new bills instance and render the bills UI
    const bills = new Bills({
      document,
      onNavigate,
      store: mockedStore,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });

    // Check if the new bill button is present
    const buttonNewBill = screen.getByRole("button", {
      name: /nouvelle note de frais/i,
    });
    expect(buttonNewBill).toBeInTheDocument();
  });
});
describe("When the new bill button is clicked", () => {
  test("Then the user should be sent on New Bill form", () => {
    // Define the onNavigate function to render the ROUTES
    const onNavigate = jest.fn();

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

    // Create a new bills instance and render the bills UI
    const bills = new Bills({
      document,
      onNavigate,
      store: mockedStore,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });

    const buttonNewBill = screen.getByRole("button", {
      name: /nouvelle note de frais/i,
    });

    // Ensure that the button to add a new bill is present.
    expect(buttonNewBill).toBeTruthy();

    // Mock the event handler for when the new bill button is clicked.
    const handleClickNewBill = jest.fn(bills.handleClickNewBill);
    buttonNewBill.addEventListener("click", handleClickNewBill);

    // Simulate a user clicking the new bill button.
    userEvent.click(buttonNewBill);

    // Ensure that the event handler for the new bill button was called.
    expect(handleClickNewBill).toHaveBeenCalled();

    // Ensure that the onNavigate function was called with the correct path.
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
  });
});

// Test for  the modal behavior when clicking on icon eye
describe("When the eye icon is clicked on a bill", () => {
  let html;
  let onNavigate;
  let billsClass;
  let modale;

  // Set up the environment before each test
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // Set up the HTML content
    html = BillsUI({ data: [bills[1]] });
    document.body.innerHTML = html;

    // Set up the Bills class
    onNavigate = jest.fn();
    const Store = null;
    billsClass = new Bills({
      document,
      onNavigate,
      Store,
      localStorage: window.localStorage,
    });
    // Set up the modal
    modale = document.getElementById("modaleFile");
    $.fn.modal = jest.fn(() => modale.classList.add("show"));
  });

  // Clear mock functions after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test that the modal is displayed when the eye icon is clicked
  test("should display the bill details modal", () => {
    const iconEye = screen.getByTestId("icon-eye");
    userEvent.click(iconEye);
    expect($.fn.modal).toHaveBeenCalled();
    expect(modale.classList).toContain("show");
  });

  // Test that the modal is closed when the close button is clicked
  test("should close the bill details modal when the close button is clicked", () => {
    const closeButton = modale.querySelector(".close");
    userEvent.click(closeButton);
    expect(modale.classList).not.toContain("show");
  });
});

// Test the behavior when an error is received from the back-end.
describe("When I am on the bills page and the back-end sends an error message", () => {
  test("Then the error page should be rendered", () => {
    document.body.innerHTML = BillsUI({ error: "error message" });

    // Ensure that the error message is visible.
    expect(screen.getByText("Erreur")).toBeVisible();
    document.body.innerHTML = "";
  });
});

// The test checks whether the function returns the expected translation 
// for the input status values of "pending", "accepted", and "refused". 
// Additionally, the test checks whether the function returns "Error" for an unknown, undefined, or null status value. 
describe("When I am on the bills page and I get the status of a bill, I expect it to: ", () => {
  it("returns 'Pending' for a status of 'pending'", () => {
    const status = "pending"
    expect(formatStatus(status)).toEqual("En attente")
  })

  it("returns 'Accepted' for a status of 'accepted'", () => {
    const status = "accepted"
    expect(formatStatus(status)).toEqual("Accepté")
  })

  it("returns 'Refused' for a status of 'refused'", () => {
    const status = "refused"
    expect(formatStatus(status)).toEqual("Refused")
  })

  it("returns 'Error' for an unknown status", () => {
    const status = "unknown"
    expect(formatStatus(status)).toEqual("Error")
  })

  it("returns 'Error' for an undefined status", () => {
    const status = undefined
    expect(formatStatus(status)).toEqual("Error")
  })

  it("returns 'Error' for a null status", () => {
    const status = null
    expect(formatStatus(status)).toEqual("Error")
  })

})

///////////////////////////////////////////////////////

//  test d'intégration GET 
describe("Given I am a user connected as employer",() =>{
describe("When I navigate to Bills Page", () => {
  test("fetches bills from mock API GET", async () => {
    jest.spyOn(mockedStore, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "a@a" })
    );

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);

    await waitFor(() => screen.getByText("Mes notes de frais"));

    const newBillBtn = await screen.findByRole("button", {
      name: /nouvelle note de frais/i,
    });
    const billsTableRows = screen.getByTestId("tbody");

    expect(newBillBtn).toBeTruthy();
    expect(billsTableRows).toBeTruthy();
    expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockedStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockedStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
})
