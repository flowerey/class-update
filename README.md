# class-update

A fork of class-update that aims to update dependencies and be faster.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
## Performance

Benchmark conducted against Materialistic.css using the official Changes.txt dataset.

| Command | Mean [ms] | Min [ms] | Max [ms] | Relative |
|:---|---:|---:|---:|---:|
| `INPUT_FOLDER=benchmark INPUT_DIFF=benchmark/Changes.txt INPUT_EXT=css node dist/index.js` | 419.8 ± 3.1 | 415.3 | 424.2 | 1.00 |
| `INPUT_FOLDER=benchmark INPUT_DIFF=benchmark/Changes.txt INPUT_EXT=css node benchmark/index.js` | 1199.2 ± 2.0 | 1196.4 | 1204.0 | 2.86 ± 0.02 |

This version processed the theme in 419.8ms compared to 1199.2ms for the original, making it approximately 2.86x faster.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
