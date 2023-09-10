var cards = document.getElementsByClassName('card')
var deck;
var numShapes = 5;
var total = 0;
var selected = [];
shapes = {
    1: "\u25CF",
    2: "\u25A0",
    4: "\u25B4",
    8: "\u25CB",
    16: "\u25A1",
    32: "\u25B5"
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
    init();
}

function init() {
    deck = Array.from(Array((1 << numShapes) - 1).keys());
    console.log(deck, numShapes);
    deck[0] = (1<<numShapes) - 1;
    shuffleArray(deck);
    console.log(deck);

    for (card of cards) {
        newCard(card)
    }
}

function newCard(card) {
    console.log('jth')
    var number = deck.pop();
    card.value = number
    card.innerText = '';
    var shape = 1
    for (var i = 0; i < numShapes; i++) {
        if (shape & number) {
            card.innerText = card.innerText + shapes[shape]
        }
        shape = shape << 1;
    }
}

function submit() {
    if (document.getElementsByClassName('selected').length < 3) {
        document.getElementById('result').innerText = "Need three or more cards"
        return;
    }
    const selected = Array.from(cards)
        .filter(card => card.classList.contains('selected'))
    const isValid = !selected
        .map(card => card.value)
        .reduce((a, b) => a^b);
    if (isValid) {
        total += selected.length
        document.getElementById('result').innerText = "You got one of length "+ selected.length+"! You now have a total of "+ total + "!"
        selected.forEach(card => {
            newCard(card);
            card.classList.remove('selected');
            });
    }
    else {
        document.getElementById('result').innerText = "Not a valid set"
    }
}


init()
Array.from(cards).forEach(function (card) {card.addEventListener('click', () => {if (card.value) {card.classList.toggle('selected')}})});
