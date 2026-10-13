"""Train-only preprocessing, model BLOB roundtrip and inference readback."""

import hashlib
import io

import numpy as np
import torch

from common import connection, frame, tables

torch.set_num_threads(1)
torch.manual_seed(7)
torch.use_deterministic_algorithms(True)
DDL = [
    ("doc_ml_samples", "id INT PRIMARY KEY,split_name VARCHAR(8),x DOUBLE,y DOUBLE"),
    (
        "doc_ml_models",
        "model_id INT PRIMARY KEY,weights LONGBLOB,sha CHAR(64),mean_x DOUBLE,scale_x DOUBLE",
    ),
    (
        "doc_ml_predictions",
        "model_id INT,id INT,prediction DOUBLE,PRIMARY KEY(model_id,id)",
    ),
]
with tables(DDL) as conn:
    source = [
        (1, "train", 0.0, 1.0),
        (2, "train", 1.0, 3.0),
        (3, "train", 2.0, 5.0),
        (4, "train", 3.0, 7.0),
        (5, "test", 4.0, 9.0),
        (6, "test", 5.0, 11.0),
    ]
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO doc_ml_samples VALUES(%s,%s,%s,%s)", source)
    data = frame(conn, "SELECT * FROM doc_ml_samples ORDER BY id")
    assert data.to_records(index=False).tolist() == source
    train = data[data.split_name == "train"]
    test = data[data.split_name == "test"]
    mean = float(train.x.mean())
    scale = float(train.x.std(ddof=0))
    assert mean == 1.5 and scale > 0

    def features(values, mu=mean, sigma=scale):
        return torch.from_numpy(
            np.ascontiguousarray(
                ((values.to_numpy(dtype=np.float64) - mu) / sigma).reshape(-1, 1),
                dtype=np.float32,
            )
        )

    x_train = features(train.x)
    y_train = torch.tensor(train.y.to_numpy(dtype=np.float32).reshape(-1, 1))

    def network():
        return torch.nn.Sequential(
            torch.nn.Linear(1, 4), torch.nn.Tanh(), torch.nn.Linear(4, 1)
        )

    model = network()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.05)
    initial = torch.nn.functional.mse_loss(model(x_train), y_train).item()
    for _ in range(100):
        optimizer.zero_grad()
        loss = torch.nn.functional.mse_loss(model(x_train), y_train)
        loss.backward()
        assert all(
            p.grad is not None and torch.isfinite(p.grad).all()
            for p in model.parameters()
        )
        optimizer.step()
    assert torch.nn.functional.mse_loss(model(x_train), y_train).item() < initial
    model.eval()
    with torch.no_grad():
        expected = model(features(test.x)).numpy().copy()
    # Inference is a function of features only, not test labels.
    changed = test.copy()
    changed["y"] = 999999
    with torch.no_grad():
        np.testing.assert_array_equal(model(features(changed.x)).numpy(), expected)
    buffer = io.BytesIO()
    torch.save(model.state_dict(), buffer)
    weights = buffer.getvalue()
    sha = hashlib.sha256(weights).hexdigest()
    conn.begin()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO doc_ml_models VALUES(%s,%s,%s,%s,%s)",
            (1, weights, sha, mean, scale),
        )
        cur.executemany(
            "INSERT INTO doc_ml_predictions VALUES(%s,%s,%s)",
            [(1, int(i), float(p)) for i, p in zip(test.id, expected.ravel())],
        )
    conn.commit()
    observer = connection()
    try:
        with observer.cursor() as cur:
            cur.execute(
                "SELECT weights,sha,mean_x,scale_x FROM doc_ml_models WHERE model_id=1"
            )
            blob, stored_sha, stored_mean, stored_scale = cur.fetchone()
        assert hashlib.sha256(blob).hexdigest() == sha == stored_sha
        restored = network()
        restored.load_state_dict(torch.load(io.BytesIO(blob), weights_only=True))
        restored.eval()
        with torch.no_grad():
            actual = restored(features(test.x, stored_mean, stored_scale)).numpy()
        np.testing.assert_array_equal(actual, expected)
        saved = frame(
            observer, "SELECT id,prediction FROM doc_ml_predictions ORDER BY id"
        )
        np.testing.assert_array_equal(
            saved.prediction.to_numpy(), expected.ravel().astype(float)
        )
        conn.begin()
        with conn.cursor() as cur:
            cur.execute("UPDATE doc_ml_models SET mean_x=99 WHERE model_id=1")
        conn.rollback()
        with observer.cursor() as cur:
            cur.execute("SELECT mean_x FROM doc_ml_models WHERE model_id=1")
            assert cur.fetchone()[0] == mean
        print("train-only scaling; model SHA256, exact inference and rollback verified")
    finally:
        observer.close()
