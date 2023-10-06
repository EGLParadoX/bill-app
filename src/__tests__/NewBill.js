import '@testing-library/jest-dom';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from "../__mocks__/store"
import router from '../app/Router.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES } from '../constants/routes.js';
import NewBillUI from '../views/NewBillUI.js';
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from '../constants/routes.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );


      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

    });

    test("Then mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeInTheDocument();

    });

    test('Then it should render the NewBill page correctly', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('form-new-bill')).toBeInTheDocument();
        expect(screen.getByTestId('expense-type')).toBeInTheDocument();
        expect(screen.getByTestId('expense-name')).toBeInTheDocument();
        expect(screen.getByTestId('datepicker')).toBeInTheDocument();
        expect(screen.getByTestId('amount')).toBeInTheDocument();
        expect(screen.getByTestId('vat')).toBeInTheDocument();
        expect(screen.getByTestId('pct')).toBeInTheDocument();
        expect(screen.getByTestId('commentary')).toBeInTheDocument();
        expect(screen.getByTestId('file')).toBeInTheDocument();
        expect(screen.getByTestId('btn-send-bill')).toBeInTheDocument();
      });
    });
  });

  test('Then I can select a file', () => {
    new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const file = screen.getByTestId('file');

    const simulatedFile = bills[0].fileName;

    userEvent.upload(file, simulatedFile);

    expect(file.files[0]).toEqual(simulatedFile);
  });

  test('I cannot select a non-image file', async () => {
    new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const file = screen.getByTestId('file');

    const simulatedFile = new File(['example.txt'], 'example.txt', {
      type: 'text/plain',
    });

    userEvent.upload(file, simulatedFile);

    expect(file.value).toBe('');
  });


});


// Test d'intégration POST 
describe('Given I am connected as an employee', () => {
  describe('When I submit a completed form', () => {
    test('Then a new bill should be created', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      jest.spyOn(newBill, 'updateBill')

      const sampleBill = bills[0]

      screen.getByTestId('expense-type').value = sampleBill.type
      screen.getByTestId('expense-name').value = sampleBill.name
      screen.getByTestId('datepicker').value = sampleBill.date
      screen.getByTestId('amount').value = sampleBill.amount
      screen.getByTestId('vat').value = sampleBill.vat
      screen.getByTestId('pct').value = sampleBill.pct
      screen.getByTestId('commentary').value = sampleBill.commentary

      newBill.fileName = sampleBill.fileName
      newBill.fileUrl = sampleBill.fileUrl

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)

      fireEvent.submit(form)

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled()
        expect(newBill.updateBill).toHaveBeenCalled()
      })
    });

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

        test("Then it fetches bills from an API and fails with 404 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          const message = await screen.findByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
    
        test("Then it fetches bills from an API and fails with 500 message error", async () => {
    
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          const message = await screen.findByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    }) 
  })
})


