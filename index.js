'use strict';

let apiData;

const lomake = document.querySelector('form');

function fetchData(callback) {
  fetch('https://api.scryfall.com/cards/random?q=is%3Acommander').
      then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      }).
      then(data => {
        apiData = data;
        callback(apiData);
      }).
      catch(error => {
        console.error('Fetch error:', error);
        throw error;
      });
}

function startGame(data) {

  const card_name = data.name;
  const card_art = data.image_uris && data.image_uris.art_crop;

  let card_type = data.type_line;
  card_type = card_type.split('\u2014');
  card_type = card_type[1].trim(); // Trim to remove leading/trailing whitespaces
  const card_type_components = card_type.split(' ').
      map(component => component.toUpperCase());
  const forbiddenValues = ['//', 'LEGENDARY', 'ENCHANTMENT', 'ARTIFACT'];
  const filteredComponents = card_type_components.filter(
      component => !forbiddenValues.includes(component),
  );

  const mana_cost = data.mana_cost || 'No mana cost'; // Handling case where mana_cost is undefined
  const power = data.power || 'N/A'; // Handling case where power is undefined
  const toughness = data.toughness || 'N/A'; // Handling case where toughness is undefined

  // Log data for test
  console.log('Card Name:', card_name);
  console.log('Card Art:', card_art);
  console.log('Card Type Components:', filteredComponents);
  console.log('Mana Cost:', mana_cost);
  console.log('Power/Toughness:', `${power}/${toughness}`);

  // Call other functions or write additional game logic here

  set_html(data);

  let guess_amont = 0;
  let right_guess = 0;
  let streak = getStreak();
  const subtype_amount = filteredComponents.length;

  const combo = document.getElementById('streak');
  combo.innerText = 'STREAK: ' + streak;

  lomake.addEventListener('submit', async function(event) {
    event.preventDefault();

    guess_amont++;
    console.log('guess_amount is ', guess_amont);

    const hakusana = document.querySelector('#query').value;

    if (filteredComponents.includes(hakusana.toUpperCase())) {
      right_guess++;
      streak++;
      combo.innerText = 'STREAK: ' + streak;
      console.log('Subtype was rgiht! Right guess amount is: ', right_guess);

      const index = filteredComponents.indexOf(hakusana.toUpperCase());
      if (index > -1) {
        filteredComponents.splice(index, 1); // 2nd parameter means remove one item only
        console.log(filteredComponents);
      }
      if (filteredComponents.length === 0) {
        console.log('voitto');
        alert('YOU WIN');
        setStreak(streak);

        location.reload();
      }
    } else {
      streak = 0;
    }

    document.querySelector('#query').value = '';

  });

}

function set_html(data) {
  const name = document.getElementById('commander_name');
  name.innerText = data.name;

  const image = document.getElementById('commander_image');
  image.src = data.image_uris && data.image_uris.art_crop;
  image.alt = `Picture of ${data.name}`;

  const commander_flavor = document.getElementById('commander_flavor');
  commander_flavor.innerText = 'Flavor text: ' + data.flavor_text
}

function getStreak() {
  const storedStreak = sessionStorage.getItem('streak');
  return storedStreak ? parseInt(storedStreak) : 0;
}

// Function to set streak in browser storage
function setStreak(streak) {
  sessionStorage.setItem('streak', streak.toString());
}

// MAIN
fetchData(startGame);

