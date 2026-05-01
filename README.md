# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 322.6 ms |
| Non-forked | 2889.7 ms |

This version processed the theme in **322.6ms** compared to **2889.7ms** for the original, making it approximately **9x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
