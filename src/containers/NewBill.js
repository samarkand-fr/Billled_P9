import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

// Define the NewBill component
export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    // Save the provided document, onNavigate function, store, and localStorage
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    // Add event listeners for the form and file input
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)

    // Initialize properties for the file URL, name, and ID
    this.fileUrl = null
    this.fileName = null
    this.billId = null

    // Create a new Logout component
    new Logout({ document, localStorage, onNavigate })
  }

  // fix [BUG HUNT] - bills
  // empêcher la saisie d'un document qui a une extension différente de jpg, jpeg ou png.
  // This function is called when the user selects a file to upload.
  handleChangeFile = e => {
    e.preventDefault(); // prevents the default form submission behavior
    
    // gets the selected file and checks its extension
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i; // regex for allowed extensions
    if (!allowedExtensions.exec(file.name)) { // if the extension is not allowed
      alert("Veuillez sélectionner un fichier au format JPEG ou PNG."); // displays an alert message
      e.target.value = ""; // clears the file input
      return; // Prevent any further processing of the invalid file.
    }
    
    // extracts the file name and creates a new FormData object to send to the API
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length-1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);
  
    // sends the data to the API and sets the resulting file ID, URL, and name
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch(error => console.error(error));
  }

  // Define a function to handle when the form is submitted
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    // Get the necessary values from the form and create a new bill object
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}