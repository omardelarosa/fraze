# fraze

A cli and library that generates phrases of made up, yet pronounceable words.

## Install

```
npm install -g fraze
```

## CLI

### `fraze`

```
    Usage
      $ fraze <numWords>

    Options
       -m, --maxChars   max number of characters per word
       -n, --number     number of words in phrase
       -p, --phrases    number of total phrases
       -j, --json       provide a relative path to adjacency list json

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

      $ fraze 3 -j my-own-phoneme-mapping.json
```

### `fraze-builder`

Build phoneme mappings from vowels and consonants sets.

```
    Usage
      $ ./builder.js <inputFilename> <outputFilename>

    Examples
      $ ./builder.js phonemes.json data.json

      $ ./builder.js -i phonemes.json -o data.json`,
```

### Schemas

### `sets`

A set is a JSON-esque adjacency list with the following schema:

```json
{
    "a": ["a", "b", "c"],
    "b": ["a"],
    "c": ["b", "b", "a"]
}
```

This is used to generate words, markov-chain style using phonemes.

### `stems`

Stems are vowel and consonant sets provided as JSON:

```json
{
    "VOWELS": ["a", "e", "i"],
    "CONSONANTS": ["k", "t", "s"]
}
```

These can be used to generate adjacency lists using the `fraze-builder` cli.

## API

### `makeWord(maxChars, sets)`

Generates a word.

### `makePhrase(numWords, maxChars, sets)`

Generates a phrase.
