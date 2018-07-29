#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fraze = require('.');
const path = require('path');

const cli = meow(
    `
    Usage
      $ ./builder.js <inputFilename> <outputFilename>

    Options
       -i, --input      input stems
       -c, --corpus     corpus text
       -o, --output     output file
       -l, --length     phoneme length
 
 
    Examples
      $ ./builder.js phonemes.json data.json

      $ ./builder.js -i phonemes.json -o data.json`,
    {
        flags: {
            length: {
                type: 'number',
                alias: 'l',
            },
            corpus: {
                type: 'string',
                alias: 'c',
            },
            input: {
                type: 'string',
                alias: 'i',
            },
            output: {
                type: 'string',
                alias: 'o',
            },
        },
    },
);

const input = cli.input[0] || cli.flags.input;
const output = cli.input[1] || cli.flags.output;
const corpus = cli.flags.corpus;
const length = cli.flags.length || 1;

// When corpus text is provided, use that to generate
if (corpus) {
    fraze.generateAdjacencyListsFromCorpus(
        path.join(process.cwd(), corpus),
        output,
        length,
    );
} else {
    // Otherwise, use stems
    fraze.generateAdjacencyLists(path.join(process.cwd(), input), output);
}
