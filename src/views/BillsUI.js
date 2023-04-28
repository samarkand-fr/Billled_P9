import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

// Define a function to create a row in the bills table for a given bill object
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

// Define a function that takes an array of bill objects and returns a string of HTML table rows
  const rows = (data) => {
    //fix [Bug report] - Bill
    // Sort the bills by date in descending order
    const sortedBills = data && data.length ? data.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    }) : []
    // Map each bill object to an HTML table row and join them into a single string
    return sortedBills.map(bill => row(bill)).join("")
  }

  

export default ({ data: bills, loading, error }) => {
// Define a function to create a modal for displaying file details
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)
  // If loading state is true, render the loading page
  if (loading) {
    return LoadingPage()
  }
  // If there is an error, render the error page with the error message 
  else if (error) {
    return ErrorPage(error)
  }
  // If neither loading nor error state is true, render the bills page
  return (`
    <div class='layout'>
      ${VerticalLayout(120)} <!-- Render the vertical layout component with a height of 120 -->
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)} <!-- Render all rows of the bills table using the rows function -->
          </tbody>
          </table>
        </div>
      </div>
      ${modal()} <!--will render the modal-->
    </div>`
  )
}