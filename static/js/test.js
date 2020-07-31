const FAIL = false;
const PASS = true;

function Pass(function_name) {
  console.log('%c PASS: ' + function_name, 'color: green;')
}

function Fail(actual, expected, description) {
  console.log(`%c FAIL -  ${description}`, 'color: red')
  console.log(`
  \tExpected:  ${expected}
  \tActual:    ${actual}`);
}

function ExpectEqual(actual, expected, test, description) {
  if (actual !== expected) {
    Fail(actual, expected, description);
    test.result = FAIL;
  }
}

function ExpectNotEqual(actual, not_expected, test, description) {
  if (actual == not_expected) {
    Fail(actual, not_expected, description);
    test.result = FAIL;
  }
}

async function RunUnitTests() {
  StartLoading();

  let passed_count = 0;
  let failed_count = 0;

  for (let i in test_functions) {
    let test = { result: PASS };
    await test_functions[i](test);
    if (test.result == PASS) {
      Pass(test_functions[i].name)
      ++passed_count;
    }
    else {
      ++failed_count;
    }
  }

  if (failed_count === 0) {
    $('#test-tick').css('display', 'inline');
    $('#test-button').css('background-color', 'lawngreen');
    $('#test-cross').css('display', 'none');
    $('#test-button span').text(`ALL TESTS PASS (${passed_count})`);
    $('#test-button span').css('color', 'black');
  } else {
    $('#test-cross').css('display', 'inline');
    $('#test-button').css('background-color', 'red');
    $('#test-tick').css('display', 'none');
    $('#test-button span').text(`${failed_count}/${passed_count + failed_count} TESTS FAILED`);
  }

  EndLoading();
}

function TestGetScoreTotal(test) {
  ExpectEqual(GetScoreTotal('1.1-7'), 7, test, "Score total basic");
  ExpectEqual(GetScoreTotal('1.17'), -1, test, "Score total no dash found");
  ExpectEqual(GetScoreTotal('11.11-777'), 777, test, "Score total big score");
  ExpectEqual(GetScoreTotal('1.1-0'), 0, test, "Score total zero");
  ExpectEqual(GetScoreTotal('someinvalidstring'), -1, test, "Score total invalid string");
}

function ValuesAreUnique(list) {
  for (let item of list) {
    if (item == 'def by' || item == 'drew against' || item == '') return false;

    let repeats = 0;
    for (let other_item of list) {
      if (item === other_item) {
        ++repeats;
        if (repeats < 2) continue;
        console.log(`Repeat: ${item} ${other_item}`)
        return false;
      }
    }
  }
  return true;
}

function TestPopulateWinOrLossVerb(test) {
  var game = PastContent();

  InitialiseWinningVerbs();

  // Loss
  game.score_for = "1.1-1";
  game.score_against = "1.2-2";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, 'def by', test, "Win/loss verb: loss");

  // Unchanged
  var prev = game.result;
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, prev, test, "Win/Loss verb: preserving old value");

  // Draw
  game.score_against = "1.2-1";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, 'drew against', test, "Win/Loss verb: draw");

  // Win
  game.score_for = "1.2-2";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectNotEqual(game.result, 'def by', test, "Win/Loss verb: win");

  var win_loss_verbs = [game.result];
  for (i = 0; i < 8; ++i) {
    game.result = '';
    PopulateWinOrLossVerb(game);
    win_loss_verbs.push(game.result);
  }

  ExpectEqual(ValuesAreUnique(win_loss_verbs), true, test, "Unique win/loss verbs");
}

function TestPopulateNicknames(test) {
  var game = PastContent();

  game.opposition = 'Rostrevor';
  PopulateNicknames(game);
  ExpectEqual(game.opposition_nickname, 'Ross and Trevor', test, "Populate nicknames: opposition");
  ExpectEqual(game.opposition, 'Rostrevor', test, "Populate nicknames: opposition unchanged");

  game = FutureContent();
  game.location = 'University Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Bob Neil #1', test, "Populate nicknames: BN#1");

  game.location = 'Fred Bloch Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Chocka Bloch Oval', test, "Populate nicknames: Chocka");

  game.location = 'Payneham Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, '@rse Park', test, "Populate nicknames: Override");

  game.location = 'Port Reserve';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Port Wildlife Reserve', test, "Populate nicknames: location");
}

function TestFindNickname(test) {

  nicknames = { "Edwardstown": "Edwards Clowns", "Broadview": "Abroadsview", "Athelstone": "The Raggies", "Henley Greek": "Henley Geeks", "Goodwood Saints": "Goodwood Sinners", "Port District": "Port Red Light District", "Tea Tree Gully": "Tee Hee Gully", "Kilburn": "The Kilburn Motorcyle & Tattoo Club", "PHOS Camden": "PHOS Williams", "Portland": "Flagon of Portland", "SMOSH West Lakes": "SMUSH West Fakes", "Rostrevor OC": "Ross and Trevor", "Greenacres": "Gang Green Acres", "Salisbury North": "Salisbury NSE&W", "Gaza": "Nice Gaza", "Hectorville": "Hannibal Hectorville", "Colonel Light Gardens": "Colonel Light's Garbage", "Adelaide Lutheran": "Adelaide Loos", "Glenunga": "Glenunga & Thirst", "Pembroke OS.": "Pembrokedown", "Unley": "Ugly", "CB.C.OC": "Can The Blacks Crap on the Catholics", "Mitcham": "Robert Mitchum", "Plympton": "Pimp Town", "Kenilworth": "Whats A Kenilworth", "Henley": "Henley-definitely-not-on-Drugs", "Sacred Heart OC": "Sacred Fart", "Pooraka": "The Poos", "Brahma Lodge": "Bananaramafudge", "Houghton Districts": "Hout and About", "Eastern Park": "Far Eastern Park", "Flinders University": "Karl Marx University", "Ovingham": "The Roving Hams", "Flinders Park": "Flinders Parkour", "Old Ignatians": "Very Old Ignatians", "Prince Alfred OC": "The Tarnished Spooners", "St Peters OC": "The Silver Spooners", "Scotch OC": "Scotch on the Rocks", "Seaton Ramblers": "The Seaton Trams", "Walkerville": "Max Walkerville", "Gepps Cross": "Gepps Double Cross", "Modbury": "Mudbury", "Paralowie": "Paralowsie", "Salisbury West": "Salisbury NSE&W", "Salvation Army": "The Tambourine Bangers", "Bye": "", "Wingfield Royals": "The Wingfield Dump", "Rosewater": "Sweet Smelling Rosewater", "Pulteney OS.": "Paltry Old Socks", "Ingle Farm": "Giggle Farm", "Salisbury": "Smallsbury", "Alberton United": "Al & Bert's Unit", "Central United": "Central DisUnited", "North Pines": "North Pines for a Win", "North Haven": "North Haven for Hobos", "Payneham Norwood Union": "Payneham in the Arse", "Brighton District & OS.": "Brighton Bummers", "Adelaide High OS.": "Ka Ringa Ronga Ringa", "Ethelton": "Ethel Weights a Ton", "SMOSH": "SMUSH", "West Lakes": "West Fakes", "Norwood Union": "Norwood Non-Workers Union", "Saint Pauls OS.": "Saint Paul", "Salisbury Central": "Salisbury Sickoes", "Riverside": "Down by the River Side", "Campbelltown Magill": "Donald Campbelltown", "Burnside Kensington": "Burn Down Kensington", "Lockleys": "Lock & Keys", "Hope Valley": "No Hope Valley", "West Croydon": "West Croydon Bleau", "Cedars": "The Conceders", "Greek Camden": "", "Woodville South": "Woodville NSE&W", "Edwardstown Baptist": "", "Fitzroy": "If the Cap Fits Roy", "Kenilworth Colonel Light": "", "Ferryden Park": "Fairey Den Park", "Plympton High OS.": "PHOS Williams", "Port Adelaide Presbyterian": "", "Para Hills": "Para Dills", "AN.Z. Bank": "", "Woodville District": "", "Immanuel OS.": "", "Australian National Institute": "", "Brighton High OS.": "", "Para District Uniting": "", "SA Cats": "", "SAIT": "", "Glandore": "Glad Whore", "Greek": "Bleek", "Saint Dominics": "", "Saint Peters YCW": "", "Post Tel Institute": "", "Renown Park": "Unrenown Park", "Adelaide College": "", "Murray Park Teachers": "", "Saint Raphaels": "", "National Bank": "", "Banksia Park High OS.": "", "Woodville West": "", "Salisbury College": "", "Port Adelaide United": "", "Taperoo": "", "Eastwood": "", "Albert Sports": "", "The Parks": "", "Henley District & OS.": "", "Sydney University": "", "Monash University": "", "Melbourne University": "", "LaTrobe University": "", "Macquarie University": "", "Queensland University": "", "Deakin University": "", "Philip University": "", "Northern Territory University": "", "Victoria University": "", "Australian National University": "", "Australian Defence Academy": "", "Wollongong University": "", "Swinburne University": "", "Charles Sturt Mitchell University": "", "NSW University": "", "Golden Grove": "Golden Grovel", "Westminster OS.": "Westminster Cathedral", "Internal Trial": "", "Mitchell Park": "Mitchell Car Park", "Western Warriors": "Western Worriers", "Smithfield": "Smith's Chips", "Ballarat University": "", "University Technology Sydney": "", "Elizabeth": "Lizbef", "Kaurna Eagles": "", "University of WA": "", "Black Friars": "Friar Tuck", "Angel Vale": "Angel Fail", "Riverland Super Dogs": "Riverland Super Dogs", "Blackwood": "Blackwood", "Morphettville Park": "Morphies", "Mawson Lakes": "Sir Douglas Mawson Lakes", "Christies Beach": "Christies a B!tch", "Port Adelaide": "The Wharfies", "Happy Valley": "Unhappy Valley" };

  // ExpectEqual(FindNickname(nicknames, ''), null, test, "Find nicknames: empty");
  // ExpectEqual(FindNickname(nicknames, "Broadview"), "Abroadsview", test, "Find nicknames: basic");
  // ExpectEqual(FindNickname(nicknames, 'Rostrevor O.C'), "Ross and Trevor", test, "Find nickname: eliminate O.C");
  // ExpectEqual(FindNickname(nicknames, 'The'), null, test, "Find nicknames: invalid");
  // ExpectEqual(FindNickname(nicknames, 'North SomethingSomething', null, test, "Find nicknames: inconclusive"))
  // ExpectEqual(FindNickname(nicknames, "St Peter's OC"), 'The Silver Spooners', test, "Find nicknames: apostrophe")
}

function TestProcessLocation(test) {
  var game = FutureContent();
  game.location = 'University Oval';

  ProcessLocation(game)
  ExpectEqual(game.location, '', test, 'Process location: BN#1');

  game.location = "Fred Bloch Oval";
  ProcessLocation(game)
  ExpectEqual(game.location, '', test, 'Process location: Chocka');

  game.location = "Actual Oval Name";
  ProcessLocation(game)
  ExpectEqual(game.location, '(Actual Oval Name)', test, 'Process location: away oval');
}

function TestExpandDate(test) {
  ExpectEqual(ExpandDate('Mon 7 Jul'), 'Monday 7 July', test, 'Expand date: basic');
  ExpectEqual(ExpandDate('Mon Tue Wed Thu Fri Sat Sun Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
    'Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December', test, 'Expand date: all examples');
}

function TestOrderingFridayNightGame(test) {
  return new Promise((resolve) => {
    var future_teams_with_friday_night_game = JSON.parse('[{"nickname":"Benny and His Jets","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547208-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"1","gender":"Mens","time":"2:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":""},{"nickname":"Pup and His Young Dawgz","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547219-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"1 Res","gender":"Mens","time":"12:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":""},{"nickname":"The Chardonnay Socialists","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547209-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"C1","gender":"Mens","time":"10:15 AM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":""},{"nickname":"The B@stards","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547212-0&a=FIXTURE&round=X&pool=1","opposition":"Mitcham","opposition_nickname":"","location":"Fred Bloch Oval","location_nickname":"","division":"C4","gender":"Mens","time":"12:15 PM","image_url":"//websites.sportstg.com/pics/00/01/78/22/1782218_1_T.jpg","error":""},{"nickname":"The Brady Bunch","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547401-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Fred Bloch Oval","location_nickname":"","division":"C7","gender":"Mens","time":"2:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":""},{"nickname":"THE SCUM","round":5,"date":"Friday 31 July","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-557892-0&a=FIXTURE&round=X&pool=1","opposition":"Blackfriars OS","opposition_nickname":"","location":"University Oval","location_nickname":"","division":"C6","gender":"Mens","time":"7:00 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564622_1_T.jpg","error":""},{"nickname":"Moodog and His A Grade Vintage","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-548065-0&a=FIXTURE&round=X&pool=1","opposition":"Payneham NU","opposition_nickname":"","location":"Payneham Oval","location_nickname":"","division":"1","gender":"Womens","time":"3:30 PM","image_url":"//websites.sportstg.com/pics/00/02/56/47/2564729_1_T.jpg","error":""},{"nickname":"The Big Lez Show","round":5,"date":"Saturday 1 August","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-555668-0&a=FIXTURE&round=X&pool=1","opposition":"Payneham NU","opposition_nickname":"","location":"Payneham Oval","location_nickname":"","division":"1 Res","gender":"Womens","time":"1:45 PM","image_url":"//websites.sportstg.com/pics/00/02/56/47/2564729_1_T.jpg","error":""}]');
    SetFutureTeams(future_teams_with_friday_night_game);
    UpdateTables(() => {
      FormatFutureGames(() => {
        let expected_text = [
          'Friday 31 July, 2020',
          'Saturday 1 August, 2020',
          'Bob Neil #1',
          '7:00 PM',
          'Div C6',
          'Burnt Fries',
          'Round 5',

          'Benny and His Jets',
          'Port Red Light District',
          'Largs Loony Bin',
          'Largs Reserve',
          '2:15 PM'
        ];

        for (let text of expected_text) {
          ExpectEqual($('#future-games-container').html().includes(text), true, test, 'Future games including text: ' + text);
        }

        resolve();
      });
    });
  });
}

function TestGetPastGames(test) {
  return new Promise((resolve) => {
    SetPastTeams(JSON.parse('[{"nickname":"Benny and His Jets","round":"4","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","gender":"Mens","division":"1","result":"","score_for":"","score_against":"","goal_kickers":"","best_players":"","image_url":"","option":"SUBSTANDARD","location":"","location_nickname":"","error":""},{"nickname":"Pup and His Young Dawgz","round":"4","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","gender":"Mens","division":"1 Res","result":"","score_for":"","score_against":"","goal_kickers":"","best_players":"","image_url":"","option":"SUBSTANDARD","location":"","location_nickname":"","error":""}]'));
    GetPastGames().then(() => {
      ExpectEqual(past_teams[0].opposition, 'Goodwood Saints', test, 'Opposition');
      ExpectEqual(past_teams[0].result, 'LOSS', test, 'Result');
      ExpectEqual(past_teams[0].score_for, '10.6-66', test, 'Score for');
      ExpectEqual(past_teams[0].score_against, '16.6-102', test, 'Score Against');
      ExpectEqual(past_teams[0].image_url, '//websites.sportstg.com/pics/00/02/20/16/2201604_1_T.jpg', test, 'Image url');
      ExpectEqual(past_teams[0].goal_kickers, 'B. Edwards 5, W. McGowan 2, M. Marini 2, N. Cottrell', test, 'Goal Kickers');
      ExpectEqual(past_teams[0].best_players, 'B. Adams, W. McGowan, D. Cunningham, N. Cottrell, B. Edwards, H. Wallace', test, 'Best Players');
      ExpectEqual(past_teams[0].date, 'Saturday 25 July', test, 'Date');

      ExpectEqual(past_teams[1].nickname, 'Pup and His Young Dawgz', test, 'Pup and his dawgz are present');

      ExpectEqual(past_teams.length, 2, test, 'Length of past teams');
      resolve();
    });
  });
}

function TestGetFutureGames(test) {
  return new Promise((resolve) => {
    SetFutureTeams(JSON.parse('[{"nickname":"THE SCUM","round":"5","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","location":"","location_nickname":"","division":"C6","gender":"Mens","time":"","image_url":"","error":""}]'));
    GetFutureGames().then(() => {
      ExpectEqual(future_teams[0].opposition, 'Blackfriars OS', test, 'Opposition');
      ExpectEqual(future_teams[0].image_url, '//websites.sportstg.com/pics/00/02/56/46/2564622_1_T.jpg', test, 'Image url');
      ExpectEqual(future_teams[0].date, 'Friday 31 July', test, 'Date');
      ExpectEqual(future_teams[0].round, 5, test, 'Round');
      ExpectEqual(future_teams[0].nickname, 'THE SCUM', test, 'Nickname');
      ExpectEqual(future_teams[0].location, 'University Oval', test, 'Location');
      ExpectEqual(future_teams[0].time, '7:00 PM', test, 'Time');
      ExpectEqual(future_teams.length, 1, test, 'Length of past teams');
      resolve();
    });
  });
}

function Reset() {
  $('#past-games-container').html('');
  $('#future-games-container').html('');
  $('#bowlies-container').html('');
}

var test_functions = [
  TestGetScoreTotal,
  TestPopulateWinOrLossVerb,
  TestPopulateNicknames,
  TestFindNickname,
  TestProcessLocation,
  TestExpandDate,
  TestOrderingFridayNightGame,
  TestGetPastGames,
  TestGetFutureGames,

  Reset
];
