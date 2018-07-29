const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const fraze = require('../index');

// Override console for cleaner test output
fraze.console = {
    log: () => null,
    error: () => null,
    warn: () => null,
}; // noop;

const DEFAULT_VALID_SET = {
    a: ['a', 'b', 'c', 'c'],
    b: ['a', 'c'],
    c: ['a', 'c'],
};

const DEFAULT_INVALID_SET = {
    a: ['a', 'z'],
    b: ['a'],
};

const DEFAULT_VALID_STEMS = {
    VOWELS: ['a', 'e'],
    CONSONANTS: ['k', 't'],
};

const makeFakeFS = () => ({
    readFileSync: sinon.spy(),
    writeFileSync: sinon.spy(),
});

describe('fraze', () => {
    describe('#validateOptions', () => {
        it('should throw an error when numWords is invalid', () => {
            expect(() =>
                fraze.validateOptions({
                    numWords: -1,
                    numPhrases: 10,
                    maxChars: 5,
                }),
            ).to.throw(Error);
        });
        it('should throw an error when numPhrases is invalid', () => {
            expect(() =>
                fraze.validateOptions({
                    numPhrases: -1,
                    numWords: 10,
                    maxChars: 5,
                }),
            ).to.throw(Error);
        });
        it('should throw an error when maxChars is invalid', () => {
            expect(() =>
                fraze.validateOptions({
                    maxChars: null,
                    numWords: 10,
                    numPhrases: 10,
                }),
            ).to.throw(Error);
        });
        it('should throw an error when numWords is missing', () => {
            expect(() => fraze.validateOptions({ numWords: null })).to.throw(
                Error,
            );
        });
        it('should throw an error when numPhrases is missing', () => {
            expect(() => fraze.validateOptions({ numPhrases: null })).to.throw(
                Error,
            );
        });
        it('should throw an error when maxChars is missing', () => {
            expect(() => fraze.validateOptions({ maxChars: null })).to.throw(
                Error,
            );
        });
    });

    describe('#validateAdjList', () => {
        it('should warn when there are sink nodes in set', () => {
            sinon.spy(fraze.console, 'warn');
            fraze.validateAdjList(DEFAULT_INVALID_SET);
            expect(fraze.console.warn.callCount).to.eq(1);
            fraze.console.warn.restore();
        });

        it('should not throw an error on valid inputs', () => {
            expect(() => fraze.validateAdjList(DEFAULT_VALID_SET)).not.to.throw(
                Error,
            );
        });
    });

    describe('#loadAdjacencyData', () => {
        let output;
        let testSpy;
        describe('when there is a file error', () => {
            beforeEach(() => {
                testSpy = sinon.spy(fraze.console, 'error');
                fs = makeFakeFS();
                fs.readFileSync = () => {
                    throw new Error('FILE ERROR');
                };
                output = fraze.loadAdjacencyData(undefined, fs);
            });

            afterEach(() => {
                testSpy.restore();
            });

            it('should return an empty set when there is an error', () => {
                expect(output).to.eql({});
            });
        });
        describe('when there is not a file error', () => {
            let fileData = JSON.stringify(DEFAULT_VALID_SET);
            beforeEach(() => {
                testSpy = sinon.spy(fraze.console, 'error');
                fs = makeFakeFS();
                fs.readFileSync = () => fileData;
                output = fraze.loadAdjacencyData(undefined, fs);
            });

            afterEach(() => {
                testSpy.restore();
            });

            it('should return a valid set mapping', () => {
                expect(output).to.eql(DEFAULT_VALID_SET);
            });
        });
    });

    describe('#loadPhonemeStems', () => {
        let output;
        let testSpy;
        describe('when there is a file error', () => {
            beforeEach(() => {
                testSpy = sinon.spy(fraze.console, 'error');
                fs = makeFakeFS();
                fs.readFileSync = () => {
                    throw new Error('FILE ERROR');
                };
                output = fraze.loadPhonemeStems(undefined, fs);
            });

            afterEach(() => {
                testSpy.restore();
            });

            it('should return an empty set when there is an error', () => {
                expect(output).to.eql({});
            });
        });
        describe('when there is not a file error', () => {
            let fileData = JSON.stringify(DEFAULT_VALID_STEMS);
            beforeEach(() => {
                testSpy = sinon.spy(fraze.console, 'error');
                fs = makeFakeFS();
                fs.readFileSync = () => fileData;
                output = fraze.loadPhonemeStems(undefined, fs);
            });

            afterEach(() => {
                testSpy.restore();
            });

            it('should return a valid set mapping', () => {
                expect(output).to.eql(DEFAULT_VALID_STEMS);
            });
        });
    });

    describe('#hashmapToFile', () => {
        describe('when there is a file error', () => {
            let testSpy;
            beforeEach(() => {
                fs = makeFakeFS();
                testSpy = sinon.spy(fraze.console, 'error');
                fs.writeFileSync = () => {
                    throw new Error('FILE ERROR');
                };
                fraze.hashmapToFile(DEFAULT_VALID_SET, 'filename', fs);
            });

            afterEach(() => testSpy.restore());

            it('should log the error', () => {
                expect(testSpy.callCount).to.eq(1);
            });
        });
        describe('when there is not a file error', () => {
            let testSpy;
            beforeEach(() => {
                fs = makeFakeFS();
                testSpy = sinon.spy(fraze.console, 'error');
                fraze.hashmapToFile(DEFAULT_VALID_SET, 'filename', fs);
            });

            afterEach(() => testSpy.restore());

            it('should log the error', () => {
                expect(testSpy.callCount).to.eq(0);
            });
        });
    });

    describe('#parseJsonPath', () => {
        let testSpy;
        let output;
        beforeEach(() => {
            testSpy = sinon.spy((...args) => 'someresult');
            output = fraze.parseJsonPath('cliJsonPath', { join: testSpy });
        });
        it('should return a string', () => {
            expect(output).to.be.a('string');
        });
        it('should call path.join once', () => {
            expect(testSpy.callCount).to.eq(1);
        });
    });

    describe('#makeWord', () => {
        let word;
        const maxChars = 10;
        beforeEach(() => {
            word = fraze.makeWord(maxChars, DEFAULT_VALID_SET);
        });

        it('should throw an error when called with an invalid set', () => {
            expect(() => fraze.makeWord(maxChars, null)).to.throw(Error);
        });

        it('should generate a string word', () => {
            expect(word).to.be.a('string');
        });

        it('should only use characters from the set', () => {
            for (let c of word) {
                if (!DEFAULT_VALID_SET[c]) {
                    throw new Error(
                        `word: ${w} uses a character ${c} not in set ${DEFAULT_VALID_SET}`,
                    );
                }
            }
        });

        it('should never create invalid char sequences', () => {
            _.times(100, () => {
                const word = fraze.makeWord(maxChars, DEFAULT_VALID_SET);
                expect(word).to.not.contain('bb'); // b -> b is not a valid sequence
            });
        });

        it('the generated word should be lte the maxChars value', () => {
            expect(word.length).to.be.lte(maxChars);
        });
    });

    describe('#makePhrase', () => {
        let phrase;
        let makeWordSpy;
        const numWords = 10;
        const maxChars = 10;
        beforeEach(() => {
            makeWordSpy = sinon.spy(fraze, 'makeWord');
            phrase = fraze.makePhrase(numWords, maxChars, DEFAULT_VALID_SET);
        });

        afterEach(() => {
            makeWordSpy.restore();
        });

        it('should throw an error when called with an invalid set', () => {
            expect(() => fraze.makePhrase(numWords, maxChars, null)).to.throw(
                Error,
            );
        });

        it('should call .makeWord once for each word in the phrase', () => {
            expect(makeWordSpy.callCount).to.eq(numWords);
        });

        it('should make a phrase of the selected length', () => {
            expect(phrase.split(' ').length).to.eq(numWords);
        });
    });

    describe('#generateAdjacencyLists', () => {
        let adjList;
        let fakeFS;
        const inputPath = 'somePath';
        const outputPath = 'otherPath';
        const stems = {
            VOWELS: ['a', 'e', 'i', 'o', 'u'],
            CONSONANTS: ['k', 't', 's'],
        };
        beforeEach(() => {
            fakeFS = makeFakeFS();
            adjList = fraze.generateAdjacencyLists(
                inputPath,
                outputPath,
                fakeFS,
                stems,
            );
        });

        it('should call writeFile only once', () => {
            expect(fakeFS.writeFileSync.callCount).to.eq(1);
        });

        it('should name the output file correctly', () => {
            expect(fakeFS.writeFileSync.withArgs(outputPath).callCount).to.eq(
                1,
            );
        });

        it('should only add vowels after consonants', () => {
            _.forEach(adjList, (val, key) => {
                if (stems.CONSONANTS.includes(key)) {
                    expect(val).to.eql(stems.VOWELS);
                }
            });
        });

        it('should make a valid set from the input', () => {
            expect(() => fraze.validateAdjList(adjList)).to.not.throw(Error);
        });
    });

    describe('#generateAdjacencyListsFromCorpus', () => {
        let adjList;
        let fakeFS;
        const inputPath = 'somePath';
        const outputPath = 'otherPath';
        const corpus = 'abc\nccc\nddd eee\n';
        const phonemeLength = 2;
        beforeEach(() => {
            fakeFS = makeFakeFS();
            adjList = fraze.generateAdjacencyListsFromCorpus(
                inputPath,
                outputPath,
                phonemeLength,
                fakeFS,
                corpus,
            );
        });

        it('should warn the user when corpus is too short', () => {
            fakeFS = makeFakeFS();
            testSpy = sinon.spy(fraze.console, 'warn');
            adjList = fraze.generateAdjacencyListsFromCorpus(
                inputPath,
                outputPath,
                10, // long phoneme length
                fakeFS,
                'abc', // tiny corpus
            );
            expect(testSpy.callCount).to.eq(1);
            expect(adjList).to.eql({});
            testSpy.restore();
        });

        it('should call writeFile only once', () => {
            expect(fakeFS.writeFileSync.callCount).to.eq(1);
        });

        it('should name the output file correctly', () => {
            expect(fakeFS.writeFileSync.withArgs(outputPath).callCount).to.eq(
                1,
            );
        });

        it('should make a valid set from the input', () => {
            expect(() => fraze.validateAdjList(adjList)).to.not.throw(Error);
        });

        it('should throw an error when the phoneme length is too short', () => {
            expect(() =>
                fraze.generateAdjacencyListsFromCorpus(
                    inputPath,
                    outputPath,
                    -10,
                    fakeFS,
                    corpus,
                ),
            ).to.throw(Error);
        });
    });

    describe('#main', () => {
        let expectedPhrases;
        let expectedOutput;
        let consoleLogSpy;
        const numChars = 5;

        describe('when options are invalid', () => {
            beforeEach(() => {
                consoleLogSpy = sinon.spy(fraze.console, 'log');
                expectedPhrases = fraze.main(5, { sets: DEFAULT_VALID_SET });
                expectedOutput = expectedPhrases.join('\n');
            });

            afterEach(() => {
                consoleLogSpy.restore();
            });

            it('should output the list of phrases to the console', () => {
                expect(consoleLogSpy.withArgs(expectedOutput).callCount).to.eq(
                    1,
                );
            });
        });
        describe('when options are invalid', () => {
            let doMakeExpectedPhrases;
            let invalidOptions = { phrases: -1 };
            beforeEach(() => {
                consoleLogSpy = sinon.spy(fraze.console, 'log');
                doMakeExpectedPhrases = (opts = {}) => fraze.main(5, opts);
            });

            afterEach(() => {
                consoleLogSpy.restore();
            });

            it('should not output the list of phrases to the console', () => {
                expect(() => doMakeExpectedPhrases({ sets: {} })).to.throw(
                    Error,
                );
                expect(consoleLogSpy.callCount).to.eq(0);
            });
            it('should not output the list of phrases to the console', () => {
                expect(() => doMakeExpectedPhrases(invalidOptions)).to.throw(
                    Error,
                );
                expect(consoleLogSpy.callCount).to.eq(0);
            });
        });
    });
});
