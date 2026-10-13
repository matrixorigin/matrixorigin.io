# Window statistics migration

A dedicated API being absent does not mean its mathematical result is impossible. Translate a well-defined profile first, then test all result values, NULLs and boundaries. Measure any performance claim separately.

## Execute 17 composed statistical profiles

The complete [window_rewrites.py example](examples/window_rewrites.py) runs one MatrixOne SQL query over a ten-row fixture with two partitions. It uses an ordinal self-join to build a four-row lookback, then computes centered moments and deterministic extreme positions.

Install SciPy 1.17.0 alongside the [basic dependencies](index.md#run-the-complete-examples), and run:

```bash
python window_rewrites.py
```

Expected output:

```text
17 mathematical profiles: complete SQL/NumPy/SciPy comparison passed on 10 rows.
```

Every returned value is compared with an independent NumPy/SciPy calculation using rtol=atol=1e-7, including NULL positions. This tolerance applies to this small numerical fixture, not to source IDs, times or all workloads.

## Defined profiles

| Dedicated DolphinDB SQL name | Composed profile in this example |
|---|---|
| sum2 | Sum of squares of non-NULL x values. |
| imin / iminLast | Zero-based frame-relative position of the earliest/latest tied minimum x. |
| imax / imaxLast | Zero-based frame-relative position of the earliest/latest tied maximum x. |
| skew | Biased standardized third centered moment. |
| kurtosis | Biased Pearson fourth standardized moment; not excess kurtosis. |
| firstNot / lastNot | First/last non-NULL x in the ordered frame. |
| prod | Non-NULL product, using log magnitude and sign parity; all-NULL returns NULL. |
| wavg / wsum | Weighted average/sum over valid x, with observed weights in this fixture. |
| corr | Pearson correlation over paired x/y observations. |
| covar | Sample covariance, denominator n-1. |
| beta | Regression slope of y on x, centered cross-product divided by centered x sum-of-squares. |
| atImax / atImin | x at the earliest row having maximum/minimum y; the selected x can itself be NULL. |

The fixture has finite y and positive weights, non-NULL x may be negative, and ordering ties have a unique row-key tie-breaker. Variance degeneracy is defined by a 1e-12 centered-sum-of-squares threshold in the script. Generalize only after defining paired NULL policy, weight rules, extreme ties and the numerical domain.

The log-product formulation is approximate and can overflow/underflow. Centered moment arithmetic and long self-join frames also require numerical and resource checks at real scale. This recipe proves the stated finite-input profiles; it does not reproduce every DolphinDB parameter, matrix/array shape or incremental kernel.

## Engine-specific boundaries

ClickHouse lagInFrame/leadInFrame navigate within the selected frame; ordinary LAG/LEAD navigate the partition. nonNegativeDerivative also has a specific time-unit and counter-reset contract. Do not substitute a similar-looking function without matching those contracts.

DolphinDB moving/time/cumulative families add policies such as minPeriods, left-open/right-closed time boundaries, peer-time visibility, reset behavior, local rank and TopN tie selection. EWM requires explicit adjust/ignoreNA/decay conventions.

The tested MO revision rejected GROUPS, EXCLUDE, IGNORE NULLS, window DISTINCT and FILTER syntax. See [the feature roadmap](https://github.com/matrixorigin/matrixone/issues/29950). Its native INTERVAL/SLIDING/FILL support is a separate capability.

The dedicated NULL-default correctness problem in LAG/LEAD is tracked in [the existing issue](https://github.com/matrixorigin/matrixone/issues/29925). Typed NULL was not a correct workaround in the tested fixture. Retest the desired API signature and complete output on your release.

DolphinDB API comparison in the larger study used official documentation, not a live DolphinDB service. No cross-engine runtime-performance parity is established here.
