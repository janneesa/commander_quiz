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


  // Set html page
  set_html(data);


  // Set game parameters
  let guess_amont = 0;
  let right_guess = 0;

  let streak = getStreak();
  const combo = document.getElementById('streak');
  combo.innerText = 'STREAK: ' + streak;

  let life = get_life()

  const hp = document.getElementById('life')
  hp.innerText = 'Life: ' + life
  set_life(life)

  const answer = document.getElementById('answer');


  // Game logic inside
  lomake.addEventListener('submit', async function(event) {
    // Stop Form sending
    event.preventDefault();

    // Add a guess amount by 1
    guess_amont++;
    console.log('guess_amount is ', guess_amont);

    // Get player guess
    const player_guess = document.querySelector('#query').value;

    // Check if guess is correct
    if (filteredComponents.includes(player_guess.toUpperCase())) {
      right_guess++;
      streak++;
      combo.innerText = 'STREAK: ' + streak;
      answer.innerText = player_guess + ' Was Correct! ';

      // Delete guessed subtype from the original list
      const index = filteredComponents.indexOf(player_guess.toUpperCase());
      if (index > -1) {
        filteredComponents.splice(index, 1); // 2nd parameter means remove one item only
        console.log(filteredComponents);
      }

      // If list is empty. PLayer wins
      if (filteredComponents.length === 0) {
        console.log('voitto');
        // Add 1 life from victory
        life++

        alert('YOU WIN');
        setStreak(streak);
        set_life(life)

        location.reload();
      }

      // If subtypes remain. Guessing continues
      else {
        answer.innerText = `${player_guess} Was Correct! You have ${filteredComponents.length} subtypes left.`;
      }

      // Wrong guess resets streak and lose 1 life
    } else {
      life = life -1
      set_life(life)
      streak = 0;
      setStreak(streak);

      hp.innerText = 'Life: ' + life
      combo.innerText = 'STREAK: ' + streak;
      answer.innerText = player_guess + ' Was Wrong :(';

      // If life < 0 then game reset and session storage is cleared
      if (life < 1){
        alert('Game over')
        sessionStorage.clear();
        location.reload();
      }

    }

    // Empty typing field
    document.querySelector('#query').value = '';

  });
}


// Sets html elements
function set_html(data) {
  const name = document.getElementById('commander_name');
  name.innerText = data.name;

  const image = document.getElementById('commander_image');
  image.src = data.image_uris && data.image_uris.art_crop;
  image.alt = `Picture of ${data.name}`;

  const commander_flavor = document.getElementById('commander_flavor');
  commander_flavor.innerText = 'Flavor text: ' + data.flavor_text;
}

// Get streak or make new one
function getStreak() {
  const storedStreak = sessionStorage.getItem('streak');
  return storedStreak ? parseInt(storedStreak) : 0;
}

// Set streak in session storage
function setStreak(streak) {
  sessionStorage.setItem('streak', streak.toString());
}

// Get life or make new one
function get_life() {
  const stored_life = sessionStorage.getItem('life');
  return stored_life ? parseInt(stored_life) : 5;
}

// Set life in session storage
function set_life(life) {
  sessionStorage.setItem('life', life.toString());
}



// MAIN
fetchData(startGame);

