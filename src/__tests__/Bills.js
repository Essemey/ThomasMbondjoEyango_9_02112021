/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import Firestore from "../app/Firestore.js"
import VerticalLayout from "../views/VerticalLayout.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import NewBill from "../containers/NewBill.js"
import Bill from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import firebase from "../__mocks__/firebase.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      Router();
      const billIcon = screen.getByTestId('icon-window')
      expect(billIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {

      const onNavigate = null
      const firestore = null
      const localStorage = null

      const bill = new Bill({ document, onNavigate, firestore, localStorage })

      const spyChrono = jest.spyOn(bill, 'antiChrono')

      const billsForTest = bills.map(bill => ({ ...bill, rawDate: bill.date }))
      const sortedBills = billsForTest.sort(spyChrono)

      const html = BillsUI({ data: sortedBills })
      document.body.innerHTML = html

      const datesScreen = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const sortedDates = sortedBills.map(bill => bill.rawDate)

      console.log(sortedDates)

      expect(datesScreen).toEqual(sortedDates)
    })
    describe("When I click on iconEye button", () => {
      test("Then a modal should be displayed", () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const iconEyeButton = screen.getAllByTestId('icon-eye')[0]
        const modale = document.getElementById('modaleFile')
        const firestore = null
        const onNavigate = null
        const localStorage = null
        const bill = new Bill({ document, onNavigate, firestore, localStorage })
        const handleClick = jest.fn(bill.handleClickIconEye(iconEyeButton))
        iconEyeButton.addEventListener('click', handleClick)
        userEvent.click(iconEyeButton)
        expect(handleClick).toHaveBeenCalled()
        expect(modale).toBeTruthy()
      })
    })
    describe('When I click on new bill button', () => {
      test("Then I should be send to NewBill page", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const firestore = null
        document.body.innerHTML = BillsUI({ data: bills })
        const bill = new Bill({ document, onNavigate, firestore, localStorage })
        const handleClick = jest.fn(bill.handleClickNewBill)

        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.addEventListener('click', handleClick)
        userEvent.click(newBillButton)
        expect(handleClick).toHaveBeenCalled()
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
  })
  describe('I get an error on Bills page', () => {
    test('I should return ErrorPage', () => {
      const loading = null
      const error = 'Erreur'
      document.body.innerHTML = BillsUI({ data: bills, loading, error })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})




// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


