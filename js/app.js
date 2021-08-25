'use strict'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const WORDS_FILE = './js/words.txt'

const statusDisplay = document.getElementById('status')
const wordDisplay = document.getElementById('word')
const keyboard = document.getElementById('keyboard')

for (const letter of LETTERS) {
    keyboard.insertAdjacentHTML('beforeend', `<button value="${letter}">${letter}</button>`)
}

const keyboardButtons = document.querySelectorAll('#keyboard button')

let words = [], currentWord = '', lettersFound = '', maskedWord = '', gameStopped = false, errorsCount = 0, score = 0

const getWords = new Promise(resolve => {
    fetch(WORDS_FILE)
        .then(response => {
            if (response.ok) return response.text()
        })
        .then(data => resolve(data.split('\r\n')))
})

const replaceAccents = input => {

    const lettersWithAccents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ'
    const lettersWithoutAccents = 'AAAAAAAAAAAAOOOOOOOOOOOOEEEEEEEECCIIIIIIIIUUUUUUUUYNN'

    let output = ''

    for (let i = 0; i < input.length; i++) {
        const index = lettersWithAccents.indexOf(input[i])
        if (index !== -1) {
            output += lettersWithoutAccents[index]
        }
        else {
            output += input[i]
        }
    }

    return output
}

const updateIllustration = () => {
    const index = errorsCount > 5 ? 5 : errorsCount
    statusDisplay.innerHTML = `<img class="illustration" src="./img/hangman-${index}.svg" alt="">`
}

const updateMaskedWord = () => {
    maskedWord = ''
    for (const char of currentWord) {
        let charWithoutAccent = replaceAccents(char)
        if (lettersFound.indexOf(charWithoutAccent) !== -1 || char === ' ' || char === '-') {
            maskedWord += char
        }
        else {
            maskedWord += '_'
        }
    }
    wordDisplay.innerHTML = maskedWord
}

const setCurrentWord = async () => {
    if (words.length === 0) words = await getWords

    // Debug
    // console.log(words)

    const index = Math.floor(Math.random() * (words.length - 1))

    currentWord = words[index].toUpperCase()

    // Debug
    console.log(currentWord)

    updateIllustration()

    updateMaskedWord()
}

const resetGame = () => {
    lettersFound = '', errorsCount = 0
    setCurrentWord()
    for (const button of keyboardButtons) {
        button.removeAttribute('disabled')
    }
    gameStopped = false
}

const handleLetter = letter => {

    if (gameStopped) return

    document.querySelector(`#keyboard button[value="${letter}"]`).setAttribute('disabled', true)

    let statusColor = ''

    const word = replaceAccents(currentWord)

    // Debug
    // console.log(word)

    if (word.indexOf(letter) !== -1) {

        lettersFound += letter

        // Debug
        // console.log(lettersFound)

        updateMaskedWord()

        if (currentWord === maskedWord) {
            gameStopped = true
            score++
            updateIllustration()
            statusColor = 'green'
            statusDisplay.insertAdjacentHTML('beforeend', `<p class="green">Bravo ! Vous avez trouvé ${score} ${score === 1 ? 'mot' : 'mots'} au total !</p>`)
        }
    }
    else {
        errorsCount++

        updateIllustration()

        if (errorsCount > 5) {
            gameStopped = true
            statusColor = 'red'
            statusDisplay.insertAdjacentHTML('beforeend', '<p class="red">Perdu ! Vous pouvez retenter votre chance !</p>')
            wordDisplay.innerHTML = currentWord
        }
        else if (errorsCount < 5) {
            const remainingFailedAttempts = 5 - errorsCount
            statusDisplay.insertAdjacentHTML('beforeend', `<p>Vous avez encore droit à ${remainingFailedAttempts} ${remainingFailedAttempts === 1 ? 'erreur' : 'erreurs'} !</p>`)
        }
        else {
            statusDisplay.insertAdjacentHTML('beforeend', '<p>Vous n\'avez plus le droit à l\'erreur !</p>')
        }
    }
    if (gameStopped) {
        statusDisplay.insertAdjacentHTML('beforeend', `<button class="reset ${statusColor}">Rejouer</button>`)
        document.querySelector('button.reset').addEventListener('click', () => resetGame())
    }
}

setCurrentWord()

// Buttons events

for (const button of keyboardButtons) {
    button.addEventListener('click', e => handleLetter(e.target.value))
}

// Keyboard events

document.addEventListener('keydown', e => {
    const key = e.key.toUpperCase()
    if (LETTERS.indexOf(key) !== -1) handleLetter(key)
})