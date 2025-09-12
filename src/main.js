import './style.css'

const baseURL = "https://api.scryfall.com/cards/search"


//Doing expensive document.getElement outside of any loops
const cardSearchInput = document.getElementById("cardSearchInput");
const cardResultsTarget = document.getElementById("cardResultsTarget");

//Scryfall API requires these headers
const reqData = {
  headers: {
              "User-Agent":"CooperTestAppForATLS4630",
              "Accept":"*/*"
            }
}

// Debounce function from https://www.geeksforgeeks.org/javascript/debouncing-in-javascript/
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


// Function for displaying the cards in the cardResultsTarget div
const displayCardResults = (data, searchValue) => {
        if (searchValue !== cardSearchInput.value){ //Handles any promises that take longer, so only the request that is using the latest value of the input field will be displayed
          return;
        }
        
        cardResultsTarget.style = "align-items: normal;";
        for(const card of data){ 
          const li = document.createElement("li");
          li.className = "cardContainer";

          const img = document.createElement("img");
          img.className = "cardImage";

          const cardNameText = document.createElement("h2");
          cardNameText.className = "cardNameText"
        // console.log(card);
        if(!card.image_uris){
          img.src = card.card_faces[0].image_uris.small; //Some cards are double sided and that is reflected differently in the json response
        } else {
          img.src = card.image_uris.small;  
        }
        
        cardNameText.innerText = card.name;

        li.appendChild(img);
        li.appendChild(cardNameText);
        cardResultsTarget.appendChild(li);
       }
      }


// Event Listener focused on the input field, waiting for user to change the field before requesting
// Could be expensive as we are not waiting until the user has stopped typing, we are just firing off requests for each and every keystroke       
cardSearchInput.addEventListener('input', 
  debounce(
    async () => {

      const searchValue = cardSearchInput.value; //saving the input fields value to a const, will be useful to check against
      cardResultsTarget.style = "align-items: center;";
      if (!searchValue){ //the searchbar has nothing in it, then display default message and return
          cardResultsTarget.innerHTML = '<span class="message">Begin typing the name of any Magic The Gathering card and the first 175 matches will display. If you are unsure of where to start, try typing "Dragon" to begin</span>';
          return;
        }
      cardResultsTarget.innerHTML = '<span class="loader"></span>'; //Sets the html to be our spinning loader
      const params = `?q="${searchValue}"`;

      const req = new Request(baseURL + params, reqData);

      try{
        //Makes Request
        const response = await fetch(req);
        const json = await response.json();

        if(!json.data && searchValue){ //If there is no data and the search value exists, then display no results
          // console.log("no results");
          cardResultsTarget.innerHTML = '<span class="noCardsFoundErrorMessage" class="message">No Cards Found</span>';
          return;
        }
        
        console.log(json);
        // console.log(json.data);
        cardResultsTarget.innerHTML = ''; //resets html to nothing, getting rid of messages and loaders
        displayCardResults(json.data, searchValue)

        // USED FOR DISPLAYING ALL RESULTS RECURSIVELY --- caused too much lag, sometimes tried to display 10,000+ results

        const displayNext = async (jsonResp, has_more) =>{
          if(!has_more || !searchValue){
            return;
          }
          if (has_more && searchValue === cardSearchInput.value){
            const reqMore = new Request(jsonResp.next_page, reqData);
            const responseMore = await fetch(reqMore);
            const jsonMore = await responseMore.json();
            console.log(jsonMore);
            console.log(jsonMore.data);
            displayCardResults(jsonMore.data, searchValue);
            displayNext(jsonMore,jsonMore.has_more);
          }
        }
        displayNext(json, json.has_more);
  
      } catch (e){
        console.log(e);
    }
  }, 450)

)