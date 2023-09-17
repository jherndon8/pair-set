var cards = document.getElementsByClassName('card')
var deck;
var numShapes = 5;
var total;
var startTime;
var score;
var highScores;
var assisted;
shapes = {
    1: "\u25B4",
    2: "\u25A0",
    4: "\u25CF",
    8: "\u25CB",
    16: "\u25A1",
    32: "\u25B5",
    64: "\u2605",
    128: "\u2606"
}

let Http = new XMLHttpRequest();
let url='https://pairsetscores-a53e7345ea4f.herokuapp.com/score?mode=Medium';
Http.open("GET", url);
Http.send();

Http.onload = (e) => {
  highScores = JSON.parse(Http.responseText)
  console.log(highScores)
  displayScores()
}

function displayScores() {
    console.log('displaying scores...', highScores)
    document.getElementById('highScores').innerHTML = highScores.length ? highScores.map(val => "<tr><td>" + val[1]+ "</td><td>" + val[0] / 1000+"</td></tr>") : ''
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function changeNumShapes(value) {
    numShapes = value
    document.getElementById('difficulty').innerText = ['Beginner','Medium','Hard','Insane','Impossible'][numShapes- 4]
    init();
    let Http = new XMLHttpRequest();
    let url='https://pairsetscores-a53e7345ea4f.herokuapp.com/score?mode='+ document.getElementById('difficulty').innerText;
    Http.open("GET", url);
    Http.send();

    Http.onload = (e) => {
        console.log('results:', Http.responseText)
        highScores=JSON.parse(Http.responseText)
        displayScores()
    }
}

function init() {
    assisted = false;
    startTime = new Date();
    total = 0;
    deck = Array.from(Array((1 << numShapes) - 1).keys());
    console.log(deck, numShapes);
    deck[0] = (1<<numShapes) - 1;
    shuffleArray(deck);
    console.log(deck);

    for (card of cards) {
        newCard(card)
    }
    document.getElementById('foundSets').innerText = "";
    document.getElementById('result').innerText = "";
    clearSelected();
}

function newCard(card) {
    console.log('jth')
    var number = deck.pop();
    card.value = number
    card.innerText = '';
    var shape = 1
    for (var i = 0; i < numShapes; i++) {
        if (shape & number) {
            card.innerText = addText(numShapes < 5 ? shape * 2 : shape, card.innerText);
        }
        shape = shape << 1;
    }
}

function addText(shape, curText) {
    if (shape === 64) {
        return shapes[shape] + curText
    }
    return curText + shapes[shape]
}

function submit() {
    if (document.getElementsByClassName('selected').length < 3) {
        document.getElementById('result').innerText = "Need three or more cards"
        return;
    }
    const selected = Array.from(cards)
        .filter(card => card.classList.contains('selected'))
    const check = selected
        .map(card => card.value)
        .reduce((a, b) => a^b)
    if (!check) {
        total += selected.length
        document.getElementById('result').innerText = "You got one of length "+ selected.length+"! You now have a total of "+ total + "!"
        if (total === (1 << numShapes) - 1) {
            score = new Date() - startTime
            document.getElementById('result').innerText += " You got them all in " + score / 1000 + " seconds!" 
            if (highScores.length < 10 || score < highScores[highScores.length - 1][0] && !assisted) {
                let initials = prompt("You got a top 10  score of " + score +"! Enter your initials", "AAA")
                if (initials) {
                    initials = initials.substr(0, 3)
                    let Http = new XMLHttpRequest();
                    let url='https://pairsetscores-a53e7345ea4f.herokuapp.com/addScore';
                    Http.open("POST", url);
                    Http.setRequestHeader("Content-Type", "application/json");
                    Http.send(JSON.stringify({'name': initials, 'time': score, 'mode': ['Beginner','Medium','Hard','Insane','Impossible'][numShapes- 4]}));

                    Http.onload = (e) => {
                      console.log('results:', JSON.parse(Http.responseText))
                    }
                }
            }
        }
        const text = [];
        selected.forEach(card => {
            text.push(card.innerText);
            newCard(card);
            card.classList.remove('selected');
            });
        document.getElementById('foundSets').innerHTML += text.join(', ') + '<br>'
    }
    else {
        const unpaired = Object.keys(shapes).filter(shape => shape & check).map(shape => shapes[numShapes < 5 ? shape * 2 : shape]) 
        assist = document.getElementById('helper').checked;
        console.log(assist)
        document.getElementById('result').innerHTML = "Not a valid set. " + (assist ? "Unpaired shapes:<br><h2>"
        + unpaired.join('') : ""
        + '</h2>');
        assisted = assisted || assist
    }
}

function clearSelected() {
    Array.from(document.getElementsByClassName('selected')).forEach(c => c.classList.remove('selected'))
}

init()
Array.from(cards).forEach(function (card) {card.addEventListener('click', () => {if (card.value) {card.classList.toggle('selected')}})});
