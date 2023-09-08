/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
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

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })


  describe('When I click on the icon eye', () => {
    test('A modal should open', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
  
      document.body.innerHTML = BillsUI({ data: bills, loading: false, error: null });
      await waitFor(() => {
        const eyes = screen.getAllByTestId('icon-eye');
        expect(eyes.length).toBeGreaterThan(0); 
  
        eyes.forEach((eye, index) => {
          console.log(`Icon Eye ${index + 1} ID:`, eye.getAttribute('data-testid'));
  
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          };
          const store = null;
          const bill = new Bills({
            document, onNavigate, store, localStorage: window.localStorage,
          });
          const handleClickIconEye = jest.fn(bill.handleClickIconEye);
  
          eye.addEventListener('click', handleClickIconEye);
          userEvent.click(eye);
          expect(handleClickIconEye).toHaveBeenCalled();
          const modale = screen.getByTestId('modaleFile');
          expect(modale).toBeTruthy();
        });
      });
    });
  });
  

});
