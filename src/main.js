import './style.css'

const baseURL = "https://api.scryfall.com/cards/search"



const cardSearchInput = document.getElementById("cardSearchInput");
const cardResultsTarget = document.getElementById("cardResultsTarget");

const reqData = {
  headers: {
              "User-Agent":"CooperTestAppForATLS4630",
              "Accept":"*/*"
            }
}

const displayCardResults = (data, searchValue) => {
        if (searchValue !== cardSearchInput.value){
          return;
        }

        cardResultsTarget.innerHTML = '';
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
          img.src = card.card_faces[0].image_uris.small;
        } else {
          img.src = card.image_uris.small;  
        }
        
        cardNameText.innerText = card.name;

        li.appendChild(img);
        li.appendChild(cardNameText);
        cardResultsTarget.appendChild(li);
       }
      }

cardSearchInput.addEventListener('input', 
  async () => {
    cardResultsTarget.innerHTML = '<span class="loader"></span>';
    cardResultsTarget.style = "align-items: center;";
    const searchValue = cardSearchInput.value;
    const params = `?q="${searchValue}"`;

    const req = new Request(baseURL + params, reqData);

    try{
      const response = await fetch(req);
      const json = await response.json();

      if(!json.data && searchValue){
        console.log("no results");
        cardResultsTarget.innerHTML = '<span class="noCardsFoundErrorMessage" class="message">No Cards Found</span>';
        return;
      } else if (!json.data && !searchValue){
        cardResultsTarget.innerHTML = '<span class="message">Begin typing the name of any Magic The Gathering card and the first 175 matches will display. If you are unsure of where to start, try typing "Dragon" to begin</span>';
        return;
      }
      console.log(json);
      console.log(json.data);
      displayCardResults(json.data, searchValue)

      // USED FOR DISPLAYING ALL RESULTS RECURSIVELY --- caused too much lag, sometimes tried to display 10,000+ results

      // const displayNext = async (jsonResp, has_more) =>{
      //   if (has_more && searchValue === cardSearchInput.value){
      //     const reqMore = new Request(jsonResp.next_page, reqData);
      //     const responseMore = await fetch(reqMore);
      //     const jsonMore = await responseMore.json();
      //     console.log(jsonMore);
      //     console.log(jsonMore.data);
      //     displayCardResults(jsonMore.data, searchValue);
      //     displayNext(jsonMore,jsonMore.has_more);
      //   }
      // }
      // displayNext(json, json.has_more);
  
    } catch (e){
      console.log(e);
      if(e.status === "404"){
        console.log("No cards returned")
      }
    }
  }

)