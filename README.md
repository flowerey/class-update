# class-update

A fork of class-update that is faster.

## Performance

Benchmark conducted against `Materialistic.css` using the official `Changes.txt` dataset.

| Version    | Execution Time |
| :--------- | :------------- |
| Fork       | 421.1 ms       |
| Non-forked | 3727.2 ms      |

This version processed the theme in **421.1ms** compared to **3727.2ms** for the original, making it approximately **9x faster**.

## Migrating

Change the step to:

```yml
- uses: flowerey/class-update@main
```
