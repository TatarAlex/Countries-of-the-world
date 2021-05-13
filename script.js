// Global variables
const countriesList = document.querySelector('.country')
const countryDetailsContent = document.querySelector('.country-details-content')
const buttons = document.querySelector('.buttons')
const searchInput = document.querySelector('.search')
const noSearch = document.querySelector('.no-search')
const myButton = document.getElementById('myBtn')
const filterBtn = document.getElementById('filter')
const modalCloseBtn = document.getElementById('modal-close-btn')

// Event listeners 
countriesList.addEventListener('click', getModalInfo)
filterBtn.addEventListener('click', () => {
  filterBtn.classList.toggle('open')
})
modalCloseBtn.addEventListener('click', () => {
  countryDetailsContent.parentElement.classList.remove('showDetails')
})

// Create a single country
const createCountry = ({
  name,
  capital,
  region,
  population,
  flag
}) => {
  const formattedCapital = capital.length > 0 ? `${capital}` : " - "
  const formattedRegion = region.length > 0 ? `${region}` : " - "
  return `<div class="countries-wrapper"> 
              <img src="${flag}" alt="Flag" />
            <div class="country-info" id="country" data-value="${name}">
              <h3 class="country-name">${name}</h3>
              <p>Capital: ${formattedCapital}</span></p>
              <p>Region: ${formattedRegion}</p>
              <p>Population: ${population.toLocaleString()} </p>
              <a href="#" class="country-btn">See More</a>
            </div>
          </div>`
}

// Filter countries based on search input 
const filterCountries = (arr, search) => {
  search = search.toLowerCase()
  const filteredCountries = arr.filter(country => {
    const {
      name,
      capital,
      alpha3Code
    } = country
    const isName = name.toLowerCase().includes(search)
    const isCapital = capital.toLowerCase().includes(search)
    const isAlpha = alpha3Code.toLowerCase().includes(search)
    return isName || isCapital || isAlpha
  })

  return filteredCountries
}

// Put all the countries in the countries div
const renderCountries = arr => {
  let contents = ""
  arr.forEach(country => (contents += createCountry(country)))
  countriesList.innerHTML = contents
}

// Sorting countries with a type
const sortCountries = (arr, type) => {
  const countries = [...arr]
  const sortedCountries = countries.sort((a, b) => {
    if (a[type] > b[type]) return 1
    if (a[type] < b[type]) return -1
    return 0
  })
  return sortedCountries
}

// Get the information for the modal depending on name
function getModalInfo(e) {
  e.preventDefault()
  if (e.target.classList.contains('country-btn')) {
    let countryItem = e.target.parentElement
    fetch(`https://restcountries.eu/rest/v2/name/${countryItem.dataset.value}`)
      .then(response => response.json())
      .then(country => {
        country = country[0]
        countryModal(country)
        countryNeighbours(country)
      })
      .catch(err => console.log("Error:", err))
  }
}

// Create clickable neighbours
function countryNeighbours(country) {
  html = 'Neighbours : '
  const neighbour = document.querySelector('.neighbour')
  for (let i = 0; i < country.borders.length; i++) {
    html += `<a href="#" class="neigh-btn">${country.borders[i]}</a> `
  }
  neighbour.innerHTML = html
  const neighbourBtn = document.querySelectorAll('.neigh-btn')
  neighbourBtn.forEach(btn => {
    btn.addEventListener('click', getModalByCode)
  })
}


// Gets the neighbours by the code
function getModalByCode(e) {
  e.preventDefault()
  let code = e.target.text
  fetch(`https://restcountries.eu/rest/v2/alpha/${code}`)
    .then(response => response.json())
    .then(code => {
      countryModal(code)
      countryNeighbours(code)
    })
}

// create a modal
function countryModal(country) {
  let current = new Date()
  let html = `<img src= "${country.flag}" alt="" width="300px">
              <div>Country : ${country.name}</span></div>
              <div id="code" data-id=${country.alpha3Code} >Alpha3Code : ${country.alpha3Code}</div>
              <div>Capital : ${country.capital}</div>
              <div>Region : ${country.region}</div>
              <div>Population : ${country.population.toLocaleString()}</div>
              <div>Latitude - Longitude : ${country.latlng.join(' - ')}</div>
              <div>Area : ${country.area}</div>
              <div>Timezone : ${country.timezones.join(', ')}</div>
              <div>Current Time : ${current.toLocaleTimeString()} </div>
              <div class="neighbour">Neighbours: </div> 
              <div>Currencies : ${country.currencies.filter(c => c.name).map(c => `${c.name} (${c.code})`).join(", ")}</div>
              <div>Official languages : ${country.languages.map(language => language.name).join(", ")}</div>`
  countryDetailsContent.innerHTML = html
  countryDetailsContent.parentElement.classList.add('showDetails')
}

// Fetching countries 
fetch("https://restcountries.eu/rest/v2/all")
  .then(response => response.json())
  .then(countries => {
    // Initialize the first sort of the cards in order of name
    renderCountries(sortCountries(countries, 'name'))

    // Filter the card in order of what you click
    buttons.addEventListener("click", e => {
      let type = e.target.className
      if (type === "name") {
        sortedCountries = sortCountries(countries, type)
        renderCountries(sortedCountries)

      } else if (type === "region") {
        sortedCountries = sortCountries(countries, type)
        renderCountries(sortedCountries)

      } else if (type === "population") {
        sortedCountries = sortCountries(countries, type)
        renderCountries(sortedCountries)

      } else if (type === "languages") {
        //sorting by the first language name
        sortedCountries = countries.sort(function (a, b) {
          return a.languages[0].name.localeCompare(b.languages[0].name)
        })
        renderCountries(sortedCountries)

      } else if (type === "timezones") {
        sortedCountries = sortCountries(countries, type)
        renderCountries(sortedCountries)

      } else if (type === "currencies") {
        // sorting by the first currency name
        sortedCountries = countries.sort(function (a, b) {
          return a.currencies[0].name.localeCompare(b.currencies[0].name)
        })
        renderCountries(sortedCountries)
      } else {
        sortedCountries = renderCountries(sortCountries(countries, 'name'))
      }
    })

    // Event listener to get search input
    searchInput.addEventListener("input", e => {
      let searchTerm = e.target.value
      renderCountries(filterCountries(countries, searchTerm))
      let html = '<div class="no-search"> There are no results for your search.</div>'
      const ifNoSearch =
        filterCountries(countries, searchTerm).length < 1 ?
        noSearch.classList.add('showDetails') :
        noSearch.classList.remove('showDetails')

      // Sets the order to be by name after deleting the search input
      if (searchTerm === '') {
        renderCountries(sortCountries(countries, 'name'))
      }

    })
  })

// Scrolls down 20px from the top of the document, show the button
window.onscroll = () => {
  document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 ?
    myButton.style.display = "block" :
    myButton.style.display = "none"
}

// When you click on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
}