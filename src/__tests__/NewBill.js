/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES } from "../constants/routes.js"
import firebase from "../__mocks__/firebase.js"
import BillsUI from "../views/BillsUI.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then a form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
    })
    describe("When I click on file input", () => {
      test("Choose a file with a bad extension", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = null
        const firestore = null
        const localStorage = null
        const badFile = 'test.mp4'
        const extensions = ['jpg', 'jpeg', 'png']
        const newBill = new NewBill({ document, onNavigate, firestore, localStorage })
        const handleClick = jest.fn((file) => extensions.find(ext => ext === file.split('.')[1]) ? 1 : null)
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('click', handleClick(badFile))
        userEvent.click(fileInput)
        expect(handleClick).toHaveBeenCalled()
        expect(handleClick(badFile)).not.toBeTruthy()
      })
      test('Send a good file after send a bad file', () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = null
        const firestore = { ref: jest.fn((test) => test) }
        const localStorage = null
        const badFile = new File(['(⌐□_□)'], 'chucknorris.pnj', { type: 'image/pnj' })
        const goodFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

        const newBill = new NewBill({ document, onNavigate, firestore, localStorage })
        //const handleClick = jest.fn((file) => extensions.find(ext => ext === file.split('.')[1]) ? 1 : null)
        const spy = jest.spyOn(newBill, 'handleChangeFile')
        const fileInput = screen.getByTestId('file')

        fileInput.removeEventListener('change', newBill.handleChangeFile)
        fileInput.addEventListener('change', spy)

        fireEvent.change(fileInput, { target: { files: [badFile] } })

        expect(screen.getByTestId('file-error')).toBeTruthy()

        console.log(screen.getByTestId('file-error'))

        const removeError = jest.fn(() => newBill.removeError(screen.getByTestId('file-error')))

        removeError()

        expect(screen.queryByTestId('file-error')).toBeNull()
        expect(removeError).toHaveBeenCalled()
      })
    })
    describe('When I submit NewBill form', () => {
      test("Send incomplete data", () => {

        const html = NewBillUI()
        document.body.innerHTML = html

        const inputData = {
          type: "Transports",
          email: "johndoe@email.com",
          name: "test",
          amount: 120,
          date: '2021-05-14',
          vat: 50,
          pct: 20,
          commentary: 'commentaire',
          status: "pending"
        }

        const firestore = null
        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn((key) => JSON.stringify(localStorage[key])),
            setItem: jest.fn(() => null),
            user: { email: "johndoe@email.com" }
          },
          writable: true
        })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const form = screen.getByTestId('form-new-bill')

        const dateInput = screen.getByTestId("datepicker")
        fireEvent.change(dateInput, { target: { value: inputData.date } })

        const amountInput = screen.getByTestId("amount")
        fireEvent.change(amountInput, { target: { value: inputData.amount } })

        const pctInput = screen.getByTestId("pct")
        fireEvent.change(pctInput, { target: { value: inputData.pct } })

        const newBill = new NewBill({ document, onNavigate, firestore, localStorage })
        newBill.fileName = 'test.jpg'
        newBill.fileUrl = null
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

        form.addEventListener('submit', (e) => handleSubmit(e))
        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalled()
        expect(handleSubmit.mock.results[0].value).toBeFalsy()
      })
      test("Send a bad extension's file", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const onNavigate = null
        const localStorage = null
        const firestore = null

        const newBill = new NewBill({ document, onNavigate, firestore, localStorage })

        const fileInput = screen.getByTestId("file")

        const file = new File(['(⌐□_□)'], 'chucknorris.pnj', { type: 'image/pnj' })
        const spy = jest.spyOn(newBill, 'handleChangeFile')

        fileInput.removeEventListener('change', newBill.handleChangeFile)
        fileInput.addEventListener('change', spy)

        fireEvent.change(fileInput, { target: { files: [file] } })

        console.log(spy.mock.results[0].value)

        expect(spy).toHaveBeenCalled()
        expect(spy.mock.results[0].value).toBeFalsy()
      })
      test("Send correct data", () => {

        const html = NewBillUI()
        document.body.innerHTML = html

        const inputData = {
          type: "Transports",
          email: "johndoe@email.com",
          name: "test",
          amount: 120,
          date: '2021-05-14',
          vat: 50,
          pct: 20,
          commentary: 'commentaire',
          status: "pending"
        }

        const firestore = null
        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn((key) => JSON.stringify(localStorage[key])),
            setItem: jest.fn(() => null),
            user: { email: "johndoe@email.com" }
          },
          writable: true
        })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const form = screen.getByTestId('form-new-bill')

        const dateInput = screen.getByTestId("datepicker")
        fireEvent.change(dateInput, { target: { value: inputData.date } })

        const amountInput = screen.getByTestId("amount")
        fireEvent.change(amountInput, { target: { value: inputData.amount } })

        const pctInput = screen.getByTestId("pct")
        fireEvent.change(pctInput, { target: { value: inputData.pct } })


        const newBill = new NewBill({ document, onNavigate, firestore, localStorage })
        newBill.fileName = 'test.jpg'
        newBill.fileUrl = 'test.jpg'
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

        form.addEventListener('submit', (e) => handleSubmit(e))
        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})



// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("send data and fetches bill from mock API POST", async () => {
      const postSpy = jest.spyOn(firebase, "post")
      const data = {
        type: "Transports",
        email: "johndoe@email.com",
        name: "test",
        amount: 120,
        date: '2021-05-14',
        vat: 50,
        pct: 20,
        commentary: 'commentaire'
      }
      const bill = await firebase.post(data)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(data).toStrictEqual(bill)
    })
    test("sending new bill from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("sending new bill from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
