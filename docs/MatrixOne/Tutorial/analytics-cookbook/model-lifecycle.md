# Model weights, preprocessing and prediction readback

MatrixOne provides and stores facts; CPU PyTorch trains and runs the neural network in this example. SQL function support is separate from a Python model's operators.

## Run a complete small neural-network pipeline

Install CPU PyTorch 2.5.1 in addition to the [basic dependencies](index.md#run-the-complete-examples). The complete [model_lifecycle.py example](examples/model_lifecycle.py) creates train/test samples, fits preprocessing on training rows only, trains a small MLP and stores the selected state_dict bytes and predictions.

```bash
python -m pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
```

```bash
python model_lifecycle.py
```

Expected output:

```text
train-only scaling; model SHA256, exact inference and rollback verified
```

The source rows are:

| id | split | x | y |
|---|---|---:|---:|
| 1 | train | 0 | 1 |
| 2 | train | 1 | 3 |
| 3 | train | 2 | 5 |
| 4 | train | 3 | 7 |
| 5 | test | 4 | 9 |
| 6 | test | 5 | 11 |

The train-only mean is 1.5 and the population standard deviation is positive. The model receives a C-contiguous float32 input produced with those saved parameters. Changing test labels must not change inference.

## What the example verifies

The code checks complete source values, finite gradients, a training-loss decrease, exact model-byte SHA256, saved preprocessing parameters and every stored prediction. It reloads the state with weights_only=True and requires inference to match the pre-storage output exactly on this fixed CPU environment. A second connection checks committed state and rollback visibility.

The script stores a small model in LONGBLOB. Storage capacity, packet limits and performance must be evaluated with the real model size before using this approach for large checkpoints.

Exact equality here relies on the same library, CPU execution, input layout and preprocessing. Across devices or versions, define an appropriate numerical comparison and record the reason for its tolerance.

## Extend the pipeline deliberately

For a real experiment, separate entities and label times across training, validation and testing. Fit imputation/scaling on training rows, select checkpoints and thresholds on validation rows, and evaluate once on held-out rows. Persist the model version, source/feature schema, preprocessing, label definitions, checkpoint selection and inference contract together.

For CNN/GRU/attention/GCN tasks, construct ordered sequences or graph edges with the same time and entity boundaries; changing the network does not remove the need for those controls. A successful storage roundtrip does not demonstrate predictive quality, model robustness or safe execution of an untrusted checkpoint.
