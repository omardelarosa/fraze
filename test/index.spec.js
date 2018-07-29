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

const makeFakeFS = () => ({
    readFileSync: sinon.spy(),
    writeFileSync: sinon.spy(),
});

describe('fraze', () => {
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

    describe('#makeWord', () => {
        let word;
        const maxChars = 10;
        beforeEach(() => {
            word = fraze.makeWord(maxChars, DEFAULT_VALID_SET);
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
                expectedPhrases = fraze.main(5, {});
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
                expect(() => doMakeExpectedPhrases(invalidOptions)).to.throw(
                    Error,
                );
                expect(consoleLogSpy.callCount).to.eq(0);
            });
        });
    });
});
