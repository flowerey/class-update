# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version | Execution Time |
| :--- | :--- |
| Fork | 419.8 ms |
| Non-forked | 3322.4 ms |

This version processed the theme in **419.8ms** compared to **3322.4ms** for the original, making it approximately **8x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
