# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 274.0 ms |
| Non-forked | 2415.0 ms |

This version processed the theme in **274ms** compared to **2415ms** for the original, making it approximately **9x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
