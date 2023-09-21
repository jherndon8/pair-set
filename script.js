var cards = document.getElementsByClassName('card')
var deck;
var numShapes = 5;
var total;
var startTime;
var score;
var highScores;
var assisted;
const modes = ['Beginner','Medium','Hard','Insane','Impossible']
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
let url='https://pairsetscores-a53e7345ea4f.herokuapp.com/score?mode=' + modes.join(',');
Http.open("GET", url);
Http.send();

Http.onload = (e) => {
  highScores = JSON.parse(Http.responseText)
  console.log(highScores)
  displayScores()
}

function displayScores() {
    console.log('displaying scores...', highScores)
    const modeScores = highScores[modes[numShapes - 4]]
    const innerHtml = modeScores.length ? modeScores.map(val => "<tr><td>" + val[1]+ "</td><td>" + val[0] / 1000+"</td></tr>").join('') : ''
    document.getElementById('highScores').innerHTML = innerHtml

}

function toggleDarkMode() {
    document.body.classList.toggle('darkmode');
    Array.from(cards).forEach(card => card.classList.toggle('darkmode'));
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
    document.getElementById('difficulty').innerText = modes[numShapes- 4]
    init();
    displayScores()
}

function init() {
    document.getElementById('allShapes').innerText = ''
     for (var shape = 1; shape < 1 << numShapes; shape = shape << 1) {
            document.getElementById('allShapes').innerText = addText(numShapes < 5 ? shape * 2 : shape, document.getElementById('allShapes').innerText);
    }
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
    setCard(card, number);
}

function setCard(card, number) {
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

function shuffleBoard() {
    const values = Array.from(cards).map(card => card.value);
    const selected = {};
    for (card of cards) {
        selected[card.value] = card.classList.contains('selected')
    }
    shuffleArray(values)
    for (var i = 0; i < 12; i++) {
        setCard(cards[i], values[i]);
        if (selected[values[i]]) {
            cards[i].classList.add('selected')
        } else {
            cards[i].classList.remove('selected')
        }
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
            const modeScores = highScores[modes[numShapes-4]]
            document.getElementById('result').innerText += " You got them all in " + score / 1000 + " seconds!" 
            if ((modeScores.length < 10 || score < modeScores[highScores.length - 1][0]) && !assisted) {
                let initials = prompt("You got a top 10  score of " + (score / 1000) + "! Enter your initials", "AAA")
                if (initials) {
                    initials = initials.substr(0, 3)
                    let Http = new XMLHttpRequest();
                    let url='https://pairsetscores-a53e7345ea4f.herokuapp.com/addScore';
                    Http.open("POST", url);
                    Http.setRequestHeader("Content-Type", "application/json");
                    Http.send(JSON.stringify({'name': initials, 'time': score, 'mode': modes[numShapes- 4]}));

                    Http.onload = (e) => {
                        highScores[modes[numShapes-4]] = JSON.parse(Http.responseText)
                        displayScores()
                      
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
