#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fraze = require('.').default;

const cli = meow(
    `
    Usage
      $ fraze <numWords>
 
    Options
       -m, --maxChars   max number of characters per word
       -n, --number     number of words in phrase 
       -p, --phrases    number of total phrases
 
    Examples
      $ fraze 3
        aya thramaeiuchayiash equiolthenio

      $ fraze 2 -m 8 -p 10
        ziomeyss nnaydt
        evia ayedtiaiu
        zay mmudtiu
        tiothruss suthaayl
        lliuaell tteezioma
        ialthiuce iudt
        mayss ioasaym
        nnaynney mmeythrey
        elioathr phalthe
        ttes ioay
`,
    {
        flags: {
            number: {
                type: 'number',
                alias: 'n',
            },
            phrases: {
                type: 'number',
                alias: 'p',
            },
            maxChars: {
                type: 'number',
                alias: 'm',
            },
        },
    },
);

fraze(cli.input[0], cli.flags);
