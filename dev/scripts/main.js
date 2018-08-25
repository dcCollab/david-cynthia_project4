const app = {};

app.apiURL = 'https://statsapi.web.nhl.com/api/v1/';
app.teamURL = 'teams';
app.teamRosterURL = 'roster';
app.playerURL = 'people';
app.recentStatsURL = 'stats?stats=statsSingleSeason&season=';
app.seasons = ['20172018', '20162017','20152016' ];
app.alphabeticalRoster = [];
app.chosenTeamName;
app.currentSeason = '';
app.seasonYear;

app.ticketmasterApiURL = 'https://app.ticketmaster.com/discovery/v2/events.json';
app.ticketmasterApiKey = 'AabmVbCHA2zPjQoA1lb98cN1NQyuFGF4';
app.nextFiveGames = {};

// make an ajax call to return nhl teams then app.displayTeam is called with data.teams as the argument
app.getData = () => {
  $.ajax({
    url: app.apiURL + app.teamURL,
    method: 'GET',
    dataType: 'json',
  })
  .then((data) => {
    app.displayTeam(data.teams);
    app.addMobileMenuItems(data.teams);
  })
}

// loop through each team
// create a variable, teamName that has: 
// - li tag with the attribute of data-id and the value team.id
// - class of team-name 
// - the li contains text, team.name
app.displayTeam = (teams) => {
  //Sort team alphabetically
  app.sortArrayObjects(teams);

  // teams.sort(function (a, b) {
  //   let alc = a.name.toLowerCase(),
  //     blc = b.name.toLowerCase();
  //   return alc > blc ? 1 : alc < blc ? -1 : 0;
  // });

  teams.forEach((team) => {
    const teamContainer = $('<li>').addClass('team-container').attr('data-id', team.id).attr('data-team-name', team.name);
    const teamItem = $('<button>').addClass('team');
    const teamImageContainer = $('<div>').addClass('team-image-container');
    const teamImage = $('<img>').addClass('team-image').attr('src', `public/images/logo-${team.id}.png`);
    const teamName = $('<p>').attr('data-id', team.id).attr('data-team-name', team.name).addClass('team-name').text(team.shortName);
    $(teamImageContainer).append(teamImage);
    $(teamItem).append(teamImageContainer, teamName);
    $(teamContainer).append(teamItem)
    $('.teams ul').append(teamContainer);
  })
}; 

app.sortArrayObjects = (arrayObjects) => {
  arrayObjects.sort(function (a, b) {
    let alc = a.name.toLowerCase(),
      blc = b.name.toLowerCase();
    return alc > blc ? 1 : alc < blc ? -1 : 0;
  });
}
app.addMobileMenuItems = (teams) => {
 app.sortArrayObjects(teams);
 
 teams.forEach((team) => {
  const teamContainer = $('<li>').addClass('team-container').attr('data-id', team.id).attr('data-team-name', team.name);
  const teamItem = $('<button>').addClass('team');
  const teamImageContainer = $('<div>').addClass('team-image-container');
  const teamImage = $('<img>').addClass('team-image').attr('src', `public/images/logo-${team.id}.png`);
  const teamName = $('<p>').attr('data-id', team.id).attr('data-team-name', team.name).addClass('team-name').text(team.shortName);
  $(teamImageContainer).append(teamImage);
  $(teamItem).append(teamImageContainer, teamName);
  $(teamContainer).append(teamItem)
  $('.nav-menu').append(teamContainer);
 })
}
// When I click a team, load the roster for that team. I need to get and store the ID from the data-id when I click the team.
// make an ajax call to grab the roster information of the specific team
// pass data (player names) to displayTeamRoster
app.getTeamRoster = (id) => {
  return $.ajax({
    url: `${app.apiURL + app.teamURL}/${id}/${app.teamRosterURL}`,
    method: 'GET',
    dataType: 'json',
  })
  // .then((teamRoster) => {
  //   app.displayTeamRoster(teamRoster.roster);
  // })
}

app.getGameData = () => {
  return $.ajax({
    url: app.ticketmasterApiURL,
    method: 'GET',
    dataType: 'json',
    data: {
      apikey: app.ticketmasterApiKey,
      keyword: app.chosenTeamName,
      sort: 'date,asc',
      size: "5",
      classificationName: 'NHL'
    }
  })
}

app.aggregateGameData = (data) => {
  
  data = data._embedded.events;

  data.forEach((data) => {
    const gameLink = $('<a>').addClass('game-link').attr('href', data.url);
    const opponentsContainer = $('<div>').addClass('opponents-container');
    const opponents = $('<p>').text(data.name);
    const gameInfoContainer = $('<div>').addClass('game-info-container');
    const gameDate = $('<p>').text(data.dates.start.localDate);
    const gameTime = $('<p>').text(data.dates.start.localTime);
    const buyNow = $('<p>').addClass('buy-now').text('Buy Now')

    opponentsContainer.append(opponents);
    gameInfoContainer.append(gameDate, gameTime);
    gameLink.append(opponentsContainer,gameInfoContainer, buyNow);

    $('.games-container').append(gameLink);
  })
}

async function getRosterAndGameData(id) {
  app.teamRoster = await app.getTeamRoster(id);
  app.gameData  = await app.getGameData();
  app.displayTeamRoster(app.teamRoster.roster)
  app.aggregateGameData(app.gameData);
}

// loop through the team roster
// create a list item and adding a class of player-info and attribute data-id with the player's id
// display player name in a p tag
// display jersey number
// display position code add attribute of data-pos to verify if player is goalie
// create displayed data as children to .roster-list
// hide team names

app.displayTeamRoster = (roster) => {
  //Sorting the roster by alphabetical order;
  $('.roster').prepend(`<h2>${app.chosenTeamName}</h2>`);
  roster.sort(function (a, b) {
    let alc = a.person.fullName.toLowerCase(),
      blc = b.person.fullName.toLowerCase();
    return alc > blc ? 1 : alc < blc ? -1 : 0;
  });

  roster.forEach((players) => {
    const playerInfo = $('<li>').addClass('player-info').attr('data-id', players.person.id)
    .attr('data-pos', players.position.name).attr('data-name', players.person.fullName).attr('data-number', players.jerseyNumber);
    const playerName = $('<p>').text(players.person.fullName);
    const playerNumber = $('<span>').text(players.jerseyNumber);
    const playerPosition = $('<p>').attr("data-pos", players.position.name).text(players.position.code);
    playerInfo.append(playerNumber, playerName, playerPosition);
    $('.roster-list').append(playerInfo);
  })

  app.updateHeader(app.chosenTeamName);
  app.addHideClass('.teams');
}



app.getPlayerStats = (season) => {
    $.ajax({
    url: `${app.apiURL + app.playerURL}/${app.playerID}/${app.recentStatsURL + season} `,
    method: 'GET',
    dataType: 'json',
  })
  .then((playerStats) => {
    const statList = playerStats.stats[0].splits[0].stat;
    app.currentSeason = season;
    if (app.playerPosition === 'Goalie') {
      app.displayGoalieStats(statList);
    } else {
      app.displayPlayerStats(statList);
    }
  })
}

app.displayGoalieStats = (player) => {
  app.addHideClass('.roster-list');
  // if goalie display: savePercentage, wins, goalsAgainstAverage, games played, shutouts
  const playerSeasonStatContainer = $('<div>').addClass('season-stats').attr('data-season', app.currentSeason); 
  const playerSavePercentage = $('<p>').text(`Save Percentage: ${player.savePercentage}`);
  const playerWins = $('<p>').text(`Wins: ${player.wins}`);
  const playerGoalsAgainstAverage = $('<p>').text(`Goals Against Average: ${player.goalsAgainstAverage}`);
  const playerGames = $('<p>').text(`Games Played: ${player.games}`);
  const playerShutouts = $('<p>').text(`Shutouts: ${player.shutouts}`);
  $(playerSeasonStatContainer).append(playerSavePercentage, playerWins, playerGoalsAgainstAverage, playerGames, playerShutouts);
  $('.stats').append(playerSeasonStatContainer);
}

// hide roster list
// display goalie stats else display other play stats
app.displayPlayerStats = (player) => {
  app.addHideClass('.roster-list');

  const playerSeasonStatContainer = $('<div>').addClass('season-stats').attr('data-season', app.currentSeason);
  const playerAssists = $('<p>').text(`assists: ${player.assists}`);
  const playerGoals = $('<p>').text(`goals: ${player.goals}`);
  const playerPoints = $('<p>').text(`points: ${player.points}`);
  const playerGames = $('<p>').text(`games played: ${player.games}`)
  const playerGameWinningGoals = $('<p>').text(`game winning goals: ${player.gameWinningGoals}`)
  const playerPlusMinus = $('<p>').text(`+-: ${player.plusMinus}`);
  $(playerSeasonStatContainer).append(playerAssists, playerGoals, playerPoints, playerGames, playerGameWinningGoals, playerPlusMinus).prepend(app.seasonYear);
  
  $('.stats').append(playerSeasonStatContainer);

  if ($('.season-stats').data('season') === 20172018) {
    $('.seaon-stats:nth-child(1)').append('<div>2017 2018</div>');
  };

}

app.updateHeader = (heading) => {
  $('header .hero h1').text(heading)
};

app.addHideClass = (selector) => {
  $(selector).addClass('hide');
}

// EVENT FUNCTIONS

// listening for a click on the class team-name
// item that is clicked, has its data-id value stored in teamID
// teamID is passed to getTeamRoster
app.getTeamID = () => {
  $('ul').on('click', '.team-container', function() {
    const teamID = $(this).data('id');
    app.chosenTeamName = $(this).data('team-name');
    // app.getTeamRoster(id);
    getRosterAndGameData(teamID);
    // app.getGameData();
  })
}

// click event on player
// pass playerID to getPlayerStats
app.getPlayerID = () => {
  $('.roster-list').on('click', '.player-info', function() {
    app.playerID = $(this).data('id');
    app.playerPosition = $(this).data('pos');
    app.seasons.map(app.getPlayerStats);
    
  })
}

app.mobileNavToggle = () => {
  $('.nav-menu').hide();
  $('.burger-menu-icon').on('click', function() {
  $('.nav-menu').slideToggle(300);
  })
}

app.events = () => {
  app.getTeamID();
  app.getPlayerID();
  app.mobileNavToggle();
};

app.init = () => {
  app.getData();
  app.events();
};

$(function() {
  app.init();
})