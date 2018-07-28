const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const DEFAULT_JSON_PATH = path.join(__dirname, 'phonemes.json');
const DEFAULT_NUM_WORDS = 5;
const DEFAULT_MAX_CHARS = 10;
const DEFAULT_NUM_PHRASES = 1;
const SPACE = ' ';

function loadSets(pathToJson = DEFAULT_JSON_PATH) {
    try {
        const jsonBuffer = fs.readFileSync(pathToJson);
        const jsonData = JSON.parse(jsonBuffer.toString());
        return jsonData;
    } catch (e) {
        console.error('Invalid json at path: ', pathToJson);
        console.error(e.message);
        return [];
    }
}

function makeWord(maxChars = DEFAULT_MAX_CHARS, sets) {
    const PHONEMES_CONSONANTS = [...sets[0]];
    const PHONEMES_VOWELS = [...sets[1]];

    const NON_SPACE = [...PHONEMES_VOWELS, ...PHONEMES_CONSONANTS].filter(
        p => p !== SPACE,
    );

    const H = {};

    PHONEMES_CONSONANTS.forEach(c => (H[c] = [...PHONEMES_VOWELS]));
    PHONEMES_VOWELS.forEach(v => (H[v] = [...NON_SPACE]));
    H[' '] = [...NON_SPACE];

    let word = [];
    let chars = 0;
    let currentMax = _.random(1, maxChars);
    while (chars <= currentMax) {
        const prev = _.last(word);
        let next;
        if (!prev) {
            next = _.sample(NON_SPACE);
        } else {
            next = _.sample(H[prev]);
        }
        chars += next.length;
        word.push(next);
    }
    return word.join('');
}

function makePhrase(numWords, maxChars, sets) {
    const phrase = [];
    _.times(numWords, () => phrase.push(makeWord(maxChars, sets)));
    return phrase.join(SPACE);
}

function main(numCharsArg, options = {}) {
    const jsonPath = options.jsonPath || DEFAULT_JSON_PATH;
    const numWords = numCharsArg || options.number || DEFAULT_NUM_WORDS;
    const numPhrases = options.phrases || DEFAULT_NUM_PHRASES;
    const maxChars = options.maxChars || DEFAULT_MAX_CHARS;
    const setsData = loadSets(jsonPath);
    const sets = setsData['SETS'];
    if (!sets) {
        throw new Error('No morpheme set data provided!');
    } else {
        const phrases = [];
        _.times(numPhrases, () => {
            const p = makePhrase(numWords, maxChars, sets);
            phrases.push(p);
        });
        console.log(phrases.join('\n'));
    }
}

module.exports = {
    makeWord,
    makePhrase,
    loadSets,
    default: main,
};
