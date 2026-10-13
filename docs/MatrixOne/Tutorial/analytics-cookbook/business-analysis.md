# Ten business-analysis seeds

These small examples turn analytical requirements into checkable contracts. They use MatrixOne for facts and SQL transformations, then Python libraries for scientific operations where appropriate.

Install the [basic dependencies](index.md#run-the-complete-examples), plus SciPy 1.17.0, scikit-learn 1.8.0, NetworkX 3.6.1 and Shapely 2.1.2. Run [business_seeds.py](examples/business_seeds.py) with [common.py](examples/common.py):

```bash
python -m pip install -r requirements-scientific.txt
python business_seeds.py
```

The script creates seven small synthetic tables, compares selected source facts with explicit references, checks all ten results and removes its tables. It is a set of starter contracts, not the full complexity or data scale of the larger campaign.

| Requirement | Executed seed and expected result | Extension needed for a full workflow |
|---|---|---|
| Strict point-in-time features | Visible entity totals 30 and 60; a later arrival is excluded. | Versioned dimensions, latest visible revisions, label-ready time and future-only invariance. |
| Incremental corrections | Replacing one contribution changes total 30 to 35; rollback restores every source value. | Durable delta ledger, delivery-key replay and full-rebuild comparison. |
| Event analysis | Two bounded touches form sessions 1 and 2 under a one-minute gap rule. | Continuous session merging, watermarks, late data and recovery. |
| Experiments and causal analysis | Synthetic randomized arms have a mean difference of 1; Welch statistic matches the explicit standard-error formula. | Assignment and estimand checks, CUPED/DiD/IPW assumptions, clustered errors and multiple comparisons. |
| Attribution and journeys | Last-touch channel B receives 100 exactly once. | Identity-time validity, lookback windows, Shapley/Markov assumptions and unconverted journeys. |
| Hierarchical forecasts | Last-known leaf forecasts 20 and 40 add to parent 60. | Rolling-origin backtests, seasonal baselines, validation-only intervals and cold-start controls. |
| Graph and fraud analysis | Visible static graph has the cycle {1,2,3}. | Increasing-time path constraints, cycle chronology, changing edges and fraud-label evaluation. |
| Risk and simulation | Historical linear-interpolated VaR95=9; mean of observed losses >= VaR is 10. | Explicit CVaR estimator, portfolio assumptions, Monte Carlo, stress scenarios and uncertainty. |
| Spatial trajectories | Strict interior count 1; boundary-inclusive count 2. | CRS, invalid geometry, geodesic distance, antimeridian and DST rules. |
| Model monitoring | After labels mature, tied-score AUC=0.875 and Brier=0.135; the earlier cutoff has only three labels. | Label-delay cohorts, PSI/KS, segment tests, calibration and threshold governance. |

## Interpret the outputs at their declared scope

The experiment fixture is synthetic and randomized; a difference in observational means alone is not a causal conclusion. Last-touch credit is a rule, not estimated incremental advertising impact.

The graph seed finds a static cycle within a time-visible snapshot. It does not establish that a path traversed edges in increasing event time. The spatial seed uses planar coordinates, not longitude/latitude distance.

The risk seed defines a finite-sample historical quantile and tail-average convention. Different quantile interpolation and fractional-tail conventions can produce a different CVaR result. The forecast seed demonstrates leakage-free input selection and coherent sums, not forecasting quality.

For predictive workflows, use [strict time visibility](point-in-time.md) and [train-only preprocessing](model-lifecycle.md). For longer SQL graphs, retain the [fact-grain checks](joins.md) at each join. For streaming claims, use the [connector scope](connectors.md#streaming-validation-has-a-different-scope), rather than extrapolating from bounded SQL results.
