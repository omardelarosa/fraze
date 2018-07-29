const _ = require('lodash');
const FS = require('fs');
const PATH = require('path');

const DEFAULT_JSON_STEMS_PATH = PATH.join(__dirname, 'phonemes.json');
const DEFAULT_JSON_DATA_PATH = PATH.join(__dirname, 'data.json');
const DEFAULT_NUM_WORDS = 5;
const DEFAULT_MAX_CHARS = 10;
const DEFAULT_NUM_PHRASES = 1;
const DEFAULT_PHONEME_LENGTH = 1;
const SPACE = ' ';
const BLACKLIST_RE = /[^a-z]/g;

class Fraze {
    static validateOptions({ numWords, numPhrases, maxChars }) {
        if (!numWords || numWords < 0) {
            throw new Error(`Invalid number of words: ${numWords}`);
        }
        if (!numPhrases || numPhrases < 1) {
            throw new Error(`Invalid number of phrases: ${numPhrases}`);
        }
        if (!maxChars || maxChars < 1) {
            throw new Error(`Invalid number of max characters: ${maxChars}`);
        }
    }

    static validateAdjList(adjList) {
        _.forEach(adjList, (val, key) => {
            // References a "sink" node without any outgoing edges.
            for (const k of val) {
                if (!adjList[k]) {
                    Fraze.console.warn(
                        `Invalid set member: '${k}'.  No outbound edges.`,
                    );
                }
            }
        });
    }

    static parseJsonPath(cliJson, path = PATH) {
        return path.join(process.cwd(), cliJson);
    }

    static loadPhonemeStems(pathToJson = DEFAULT_JSON_STEMS_PATH, fs = FS) {
        try {
            const jsonBuffer = fs.readFileSync(pathToJson);
            const jsonData = JSON.parse(jsonBuffer.toString());
            return jsonData;
        } catch (e) {
            Fraze.console.error('Invalid json at path: ', pathToJson);
            Fraze.console.error(e.message);
            return [];
        }
    }

    static loadAdjacencyData(pathToJson = DEFAULT_JSON_DATA_PATH, fs = FS) {
        try {
            const jsonBuffer = fs.readFileSync(pathToJson);
            const jsonData = JSON.parse(jsonBuffer.toString());
            return jsonData;
        } catch (e) {
            Fraze.console.error('Invalid json at path: ', pathToJson);
            Fraze.console.error(e.message);
            return [];
        }
    }

    static hashmapToFile(H, filename, fs = FS) {
        const data = JSON.stringify(H);
        try {
            const data = JSON.stringify(H, 2);
            fs.writeFileSync(filename, data);
            Fraze.console.log('Generated adjacency list json: ', filename);
        } catch (e) {
            Fraze.console.log('Unable to generate adjacency list json.');
            Fraze.console.error(e.message);
        }
    }

    static generateAdjacencyLists(stemsPath, filename, fs = FS, data) {
        const STEMS = data || loadPhonemeStems(stemsPath);
        const PHONEMES_CONSONANTS = [...STEMS['CONSONANTS']];
        const PHONEMES_VOWELS = [...STEMS['VOWELS']];

        const NON_SPACE = [...PHONEMES_VOWELS, ...PHONEMES_CONSONANTS].filter(
            p => p !== SPACE,
        );

        const H = {};

        PHONEMES_CONSONANTS.forEach(c => (H[c] = [...PHONEMES_VOWELS]));
        PHONEMES_VOWELS.forEach(v => (H[v] = [...NON_SPACE]));
        Fraze.hashmapToFile(H, filename, fs);
        return H;
    }

    static generateAdjacencyListsFromCorpus(
        corpusPath,
        filename,
        phonemeLength = DEFAULT_PHONEME_LENGTH,
        fs = FS,
        data,
    ) {
        if (!phonemeLength || phonemeLength < 0) {
            throw new Error('Invalid phonemeLength ' + phonemeLength);
        }
        const fileData = data || fs.readFileSync(corpusPath).toString();
        const H = {};
        let i = 0;
        const end = fileData.length;

        // Too short of a corpus
        if (end <= phonemeLength) {
            Fraze.console.warn('File is too short.');
            return H;
        }
        while (i < end - phonemeLength) {
            const chars = fileData
                .slice(i, i + phonemeLength)
                // strips out whitespace chars from phonemes
                .replace(BLACKLIST_RE, '');
            const adj = H[chars];
            if (!adj) {
                H[chars] = [];
            }
            const next = fileData
                .slice(i + phonemeLength, i + phonemeLength * 2)
                // strips out whitespace chars from phonemes
                .replace(BLACKLIST_RE, '');
            if (next) {
                H[chars].push(next);
            }
            i += phonemeLength;
        }
        Fraze.hashmapToFile(H, filename, fs);
        return H;
    }

    static makeWord(maxChars = DEFAULT_MAX_CHARS, sets) {
        if (!sets) {
            throw new Error(
                'A phoneme set must be provided as an adjacency list!',
            );
        }
        const H = sets;
        let word = [];
        let chars = 0;
        let currentMax = _.random(1, maxChars);
        while (chars < currentMax) {
            const prev = _.last(word);
            let next = '';
            if (!prev) {
                next = _.sample(Object.keys(H));
            } else {
                next = _.sample(H[prev]);
            }
            chars += next.length;
            word.push(next);
        }
        return word.join('');
    }

    static makePhrase(numWords, maxChars, sets) {
        if (!sets) {
            throw new Error(
                'A phoneme set must be provided as an adjacency list!',
            );
        }
        const phrase = [];
        _.times(numWords, () => phrase.push(Fraze.makeWord(maxChars, sets)));
        return phrase.join(SPACE);
    }

    static main(numCharsArg, options = {}) {
        const jsonPath = options.json
            ? Fraze.parseJsonPath(options.json)
            : DEFAULT_JSON_DATA_PATH;
        const numWords = numCharsArg || options.number || DEFAULT_NUM_WORDS;
        const numPhrases = options.phrases || DEFAULT_NUM_PHRASES;
        const maxChars = options.maxChars || DEFAULT_MAX_CHARS;
        const sets = Fraze.loadAdjacencyData(jsonPath);
        if (!sets) {
            throw new Error('No phoneme set data provided!');
        } else {
            Fraze.validateOptions({ numWords, numPhrases, maxChars });
            Fraze.validateAdjList(sets); // validates adj list
            const phrases = [];
            _.times(numPhrases, () => {
                const p = Fraze.makePhrase(numWords, maxChars, sets);
                phrases.push(p);
            });
            Fraze.console.log(phrases.join('\n'));
            return phrases;
        }
    }
}

Fraze.console = console;

module.exports = Fraze;
