"""Ten small analytical seeds; MO facts and client calculations have separate checks."""

import math

import networkx as nx
import numpy as np
import pandas as pd
from scipy import stats
from shapely.geometry import Point, Polygon
from sklearn.metrics import roc_auc_score

from common import frame, tables

definitions = [
    (
        "doc_biz_signals",
        "id INT PRIMARY KEY,entity_id INT,day INT,received_day INT,v DOUBLE",
    ),
    ("doc_biz_outcomes", "id INT PRIMARY KEY,arm INT,y DOUBLE"),
    (
        "doc_biz_touches",
        "id INT PRIMARY KEY,conversion_id INT,minute INT,channel VARCHAR(8),revenue DOUBLE",
    ),
    ("doc_biz_flows", "id INT PRIMARY KEY,src INT,dst INT,minute INT"),
    ("doc_biz_gps", "id INT PRIMARY KEY,x DOUBLE,y DOUBLE"),
    ("doc_biz_scores", "id INT PRIMARY KEY,p DOUBLE,label INT,ready_day INT"),
    ("doc_biz_returns", "id INT PRIMARY KEY,r DOUBLE"),
]
with tables(definitions) as conn:
    signals = [
        (1, 1, 1, 1, 10.0),
        (2, 1, 2, 2, 20.0),
        (3, 1, 3, 4, 30.0),
        (4, 2, 1, 1, 20.0),
        (5, 2, 2, 2, 40.0),
        (6, 2, 3, 4, 60.0),
    ]
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO doc_biz_signals VALUES(%s,%s,%s,%s,%s)", signals)
        cur.execute(
            "INSERT INTO doc_biz_outcomes VALUES(1,0,1),(2,0,2),(3,0,3),(4,1,2),(5,1,3),(6,1,4)"
        )
        cur.execute("INSERT INTO doc_biz_touches VALUES(1,1,0,'A',100),(2,1,2,'B',100)")
        cur.execute("INSERT INTO doc_biz_flows VALUES(1,1,2,1),(2,2,3,2),(3,3,1,3)")
        cur.execute("INSERT INTO doc_biz_gps VALUES(1,0,0),(2,1,1),(3,3,3)")
        cur.execute(
            "INSERT INTO doc_biz_scores VALUES(1,0.1,0,1),(2,0.4,1,1),(3,0.4,0,1),(4,0.9,1,5)"
        )
        cur.execute("INSERT INTO doc_biz_returns VALUES(1,-0.1),(2,0),(3,0.1)")
    raw = frame(conn, "SELECT * FROM doc_biz_signals ORDER BY id")
    assert raw.to_records(index=False).tolist() == signals

    # 1. Point-in-time features: future arrival is excluded.
    visible = frame(
        conn,
        """SELECT entity_id,SUM(v) total,COUNT(v) n
        FROM doc_biz_signals WHERE day<3 AND received_day<=3
        GROUP BY entity_id ORDER BY entity_id""",
    )
    assert visible.to_records(index=False).tolist() == [(1, 30.0, 2), (2, 60.0, 2)]
    print("point_in_time: totals=30,60")

    # 2. Correction changes the affected aggregate; rollback restores original facts.
    conn.begin()
    with conn.cursor() as cur:
        cur.execute("UPDATE doc_biz_signals SET v=25 WHERE id=2")
    changed = frame(
        conn, "SELECT SUM(v) total FROM doc_biz_signals WHERE entity_id=1 AND day<=2"
    )
    assert changed.total.iloc[0] == 35.0
    conn.rollback()
    pd.testing.assert_frame_equal(
        frame(conn, "SELECT * FROM doc_biz_signals ORDER BY id"), raw
    )
    print("incremental: corrected_total=35; rollback verified")

    # 3. Session segmentation of a bounded snapshot, not a streaming watermark.
    sessions = frame(
        conn,
        """WITH previous AS (
        SELECT id,minute,LAG(minute) OVER(ORDER BY minute,id) prev
        FROM doc_biz_touches
    ), marked AS (
        SELECT *,CASE WHEN prev IS NULL OR minute-prev>1 THEN 1 ELSE 0 END starts
        FROM previous
    )
    SELECT id,SUM(starts) OVER(ORDER BY minute,id ROWS UNBOUNDED PRECEDING) session_id
    FROM marked ORDER BY id""",
    )
    assert sessions.to_records(index=False).tolist() == [(1, 1), (2, 2)]
    print("events: bounded_session_ids=1,2")

    # 4. Difference in means and Welch standard error on a synthetic randomized fixture.
    outcomes = frame(conn, "SELECT id,arm,y FROM doc_biz_outcomes ORDER BY id")
    assert outcomes.to_records(index=False).tolist() == [
        (1, 0, 1.0),
        (2, 0, 2.0),
        (3, 0, 3.0),
        (4, 1, 2.0),
        (5, 1, 3.0),
        (6, 1, 4.0),
    ]
    control = outcomes.loc[outcomes.arm == 0, "y"].to_numpy()
    treatment = outcomes.loc[outcomes.arm == 1, "y"].to_numpy()
    difference = float(treatment.mean() - control.mean())
    se = math.sqrt(
        treatment.var(ddof=1) / len(treatment) + control.var(ddof=1) / len(control)
    )
    test = stats.ttest_ind(treatment, control, equal_var=False)
    assert difference == 1.0 and np.isclose(se, math.sqrt(2 / 3))
    assert np.isclose(test.statistic, difference / se)
    print("experiment: mean_difference=1")

    # 5. Last-touch attribution assigns a conversion's revenue once.
    credit = frame(
        conn,
        """WITH ranked AS (
        SELECT *,ROW_NUMBER() OVER(PARTITION BY conversion_id ORDER BY minute DESC,id DESC) choice
        FROM doc_biz_touches
    )
    SELECT channel,SUM(revenue) revenue FROM ranked WHERE choice=1 GROUP BY channel""",
    )
    assert credit.to_records(index=False).tolist() == [("B", 100.0)]
    print("attribution: B=100")

    # 6. A last-observation forecast uses only history known at cutoff 2.
    history = frame(
        conn,
        "SELECT entity_id,day,v FROM doc_biz_signals WHERE day<=2 AND received_day<=2 ORDER BY entity_id,day",
    )
    assert history.to_records(index=False).tolist() == [
        (1, 1, 10.0),
        (1, 2, 20.0),
        (2, 1, 20.0),
        (2, 2, 40.0),
    ]
    forecast = history.groupby("entity_id").tail(1).v.to_numpy()
    np.testing.assert_array_equal(forecast, [20.0, 40.0])
    assert forecast.sum() == 60.0
    print("forecast: leaves=20,40; parent=60")

    # 7. Static cycle in the time-visible graph, not proof of a causal temporal path.
    edges = frame(
        conn,
        "SELECT src,dst,minute FROM doc_biz_flows WHERE minute<=3 ORDER BY minute,id",
    )
    assert edges.to_records(index=False).tolist() == [(1, 2, 1), (2, 3, 2), (3, 1, 3)]
    graph = nx.DiGraph()
    graph.add_edges_from(zip(edges.src, edges.dst))
    assert {frozenset(cycle) for cycle in nx.simple_cycles(graph)} == {
        frozenset([1, 2, 3])
    }
    print("graph: visible_cycle_nodes=1,2,3")

    # 8. Historical VaR/CVaR with explicitly stated finite-sample rules.
    returns = frame(conn, "SELECT r FROM doc_biz_returns ORDER BY id").r.to_numpy()
    np.testing.assert_array_equal(returns, [-0.1, 0.0, 0.1])
    loss = -100 * returns
    var = float(np.quantile(loss, 0.95, method="linear"))
    cvar = float(loss[loss >= var].mean())
    assert np.isclose(var, 9.0) and cvar == 10.0
    print("risk: historical_VaR95=9; tail_mean=10")

    # 9. Strict interior versus boundary-inclusive geofencing.
    points = frame(conn, "SELECT id,x,y FROM doc_biz_gps ORDER BY id")
    assert points.to_records(index=False).tolist() == [
        (1, 0.0, 0.0),
        (2, 1.0, 1.0),
        (3, 3.0, 3.0),
    ]
    polygon = Polygon([(0, 0), (2, 0), (2, 2), (0, 2)])
    interior = [polygon.contains(Point(x, y)) for x, y in zip(points.x, points.y)]
    covered = [polygon.covers(Point(x, y)) for x, y in zip(points.x, points.y)]
    assert interior == [False, True, False] and covered == [True, True, False]
    print("spatial: interior=1; including_boundary=2")

    # 10. Delayed labels and AUC ties.
    early = frame(
        conn, "SELECT id,p,label FROM doc_biz_scores WHERE ready_day<=3 ORDER BY id"
    )
    assert early.id.tolist() == [1, 2, 3]
    mature = frame(
        conn, "SELECT id,p,label FROM doc_biz_scores WHERE ready_day<=5 ORDER BY id"
    )
    assert mature.to_records(index=False).tolist() == [
        (1, 0.1, 0),
        (2, 0.4, 1),
        (3, 0.4, 0),
        (4, 0.9, 1),
    ]
    positive = mature.loc[mature.label == 1, "p"].to_numpy()
    negative = mature.loc[mature.label == 0, "p"].to_numpy()
    manual_auc = np.mean(
        [float(p > n) + 0.5 * float(p == n) for p in positive for n in negative]
    )
    assert manual_auc == roc_auc_score(mature.label, mature.p) == 0.875
    assert np.isclose(np.mean((mature.p - mature.label) ** 2), 0.135)
    print("monitoring: mature_AUC=0.875; Brier=0.135")
