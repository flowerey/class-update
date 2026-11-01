# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 197.7 ms |
| Non-forked | 3454.6 ms |

This version processed the theme in **197.7ms** compared to **3454.6ms** for the original, making it approximately **17x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
