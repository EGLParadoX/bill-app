/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import { formatDate, formatStatus } from "../app/format.js";
import mockStore from "../__mocks__/store"
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {

  describe('When I am on  Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toBeInTheDocument();

    });

    test("Then getBills should return formatted bill data", async () => {
      const mockStore = {
        bills: () => ({
          list: async () => {
            return bills;
          },
        }),
      };

      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const [bill] = await billsInstance.getBills();
      expect(bill.date).toBe(formatDate(bills[0].date));
      expect(bill.status).toBe(formatStatus(bills[0].status));
    });




    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on the icon eye', () => {
      test('A modal should open', async () => {

        document.body.innerHTML = BillsUI({ data: bills })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })

        const handleClickIconEye = jest.fn(bill.handleClickIconEye)
        const eyeIcons = screen.getAllByTestId('icon-eye')

        eyeIcons.forEach((eyeIcon) => {
          eyeIcon.addEventListener('click', () => {
            handleClickIconEye(eyeIcon);
          });
          userEvent.click(eyeIcon);


          expect(handleClickIconEye).toHaveBeenCalled()

          const modal = screen.getByTestId('modaleFileEmployee')
          expect(modal).toBeTruthy()
        })
      })
    })
    describe("When I click on 'Nouvelle note de frais'", () => {
      test("It should display the newBillUI with the form fields", () => {
    
        document.body.innerHTML = BillsUI({ data: bills })
    
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
    
        new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
    
        const newBillButton = screen.getByTestId('btn-new-bill')
        userEvent.click(newBillButton)
    
        const fieldIds = [
          'expense-type',
          'expense-name',
          'datepicker',
          'amount',
          'vat',
          'pct',
          'commentary',
          'file',
        ]
    
        fieldIds.forEach((fieldId) => {
          const field = screen.getByTestId(fieldId)
          expect(field).toBeInTheDocument()
        })
    
        onNavigate(ROUTES_PATH.Bills)
      })
    })
    

  })

});

// * test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      expect(screen.getByTestId("tbody")).toBeTruthy();
      console.log("tbody element found.");
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        document.body.innerHTML = BillsUI({error: "Erreur 404"})
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        document.body.innerHTML = BillsUI({error: "Erreur 500"})
        console.log("Waiting for Error 500 message...");
        const message =  screen.getByText(/Erreur 500/)

        expect(message).toBeTruthy()
      })
    })
  })
})
