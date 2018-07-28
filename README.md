# fraze

A cli and library that generates phrases of made up, yet pronounceable words.

## Install

```
npm install -g fraze
```

## CLI

```
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
```

## API

### `sets`

A set is a JSON-esque object with the following schema:

```json
{
    "SETS": [
        ["ch", "sh", "th", "v", "ph", "l", "ll", "n", "m", "mm", "s", "ss"],
        ["a", "e", "ia", "u", "ae", "io", "iu", "ey", "ay"]
    ]
}
```

The `SETS[0]` can be thought of as consonant-y phonemes and `SETS[1]` can be thought of as vowel-y phonemes. The generator avoids consonant-y phonemes following other consonant-y phonemes, while vowel-y phonemes can follow either.

### `makeWord(maxChars, sets)`

Generates a word.

### `makePhrase(numWords, maxChars, sets)`

Generates a phrase.
