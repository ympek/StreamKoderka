// algo from:
// https://en.wikipedia.org/wiki/Round-robin_tournament
const countryTeams = [
  'PAUZA', 'Szwecja', 'Holandia', 'Anglia', 'Kamerun',
  'Niemcy', 'Francja', 'Hiszpania', 'Włochy', 'Portugalia',
  'Argentyna', 'Brazylia', 'Urugwaj', 'Chile', 'Kolumbia',
  'Belgia', 'Szwajcaria', 'Dania', 'Austria', 'Czechy',
  'Słowacja', 'Słowenia', 'Grecja', 'Turcja', 'Gruzja', 'Albania'
];

const TEAMS_AMOUNT = 15;
const rounds = createRounds(TEAMS_AMOUNT);

printRounds(rounds);
check(rounds);

/// Functions:

function createRounds(teamsAmount) {
  // build circle
  let count = teamsAmount;

  const circle = [];
  for (let i = 0; i < count; i++) {
    circle[i] = i+1;
  }

  if (count % 2 !== 0) {
    circle.push(0);
    count += 1;
  }

  // create round
  const rounds = [];
  for(let i = 0; i < count-1; i++) {
    let round = [];
    for (let j = 0; j < count/2; j++) {
      let match = {
        home: circle[j],
        away: circle[count-1-j]
      };

      // a co jesli...
      if (i % 2 === 0) {
        // zamienmy home z away
        let temp = match.home;
        match.home = match.away;
        match.away = temp;
      }
      round.push(match);
    }
    rounds.push(round);

    // rotate the circle
    let left = circle[1];
    let right = circle[2];
    for (let j = 2; j < count; j+=2) {
      circle[j] = left;
      left = circle[j+1];
      circle[j+1] = right;
      if (j+2 === count) {
        circle[1] = left;
        break;
      }
      right = circle[j+2];
    }
  }

  return rounds;
}

function printRounds(rounds) {
  rounds.forEach((round, i) => {
    console.log(`Kolejka ${i+1}:`);
    round.forEach(match => {
      console.log(`   ${countryTeams[match.home]} - ${countryTeams[match.away]}`);
    });
  });
}

function check(rounds) {
  console.log("Checking if output is correct...");
  let counters = {};
  const firstRound = rounds[0];
  for (let i = 0; i < firstRound.length; i++) {
    const match = firstRound[i];
    counters[match.home] = {
      homeInARowCount: 0,
      awayInARowCount: 0
    };
    counters[match.away] = {
      homeInARowCount: 0,
      awayInARowCount: 0
    };
  }

  rounds.forEach((round, i) => {
    round.forEach(match => {
      counters[match.home].homeInARowCount++;
      counters[match.away].awayInARowCount++;
      
      if (counters[match.home].homeInARowCount > 2) {
        console.log(`Error in round ${i+1}`);
        console.log(`${countryTeams[match.home]} home in a row count ${counters[match.home].homeInARowCount}`);

      }
      if (counters[match.away].awayInARowCount > 2) {
        console.log(`Error in round ${i+1}`);
        console.log(`${countryTeams[match.away]} away in a row count ${counters[match.away].awayInARowCount}`);
      }

      counters[match.home].awayInARowCount = 0;
      counters[match.away].homeInARowCount = 0;
    });
  });

  console.log("GIT");
}
