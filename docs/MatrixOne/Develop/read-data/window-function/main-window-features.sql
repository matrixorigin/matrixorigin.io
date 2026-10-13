-- Verified on MatrixOne main commit 23d8f61252f3017dff218b530817a240206fd762.
-- Requires NTILE/named WINDOW grammar; reviewed 3.0-dev b2c51d10 does not accept it.
-- Use a dedicated test database. Fail if the tutorial table already exists.
CREATE TABLE doc_main_window_features(id INT PRIMARY KEY,gid INT,tick INT,v DOUBLE);
INSERT INTO doc_main_window_features VALUES(1,1,0,1),(2,1,0,2),(3,1,1,4),(4,1,3,8);

-- Expected (id,bucket): (1,1),(2,1),(3,2),(4,2).
SELECT id,NTILE(2) OVER(PARTITION BY gid ORDER BY tick,id) bucket
FROM doc_main_window_features ORDER BY id;

-- Expected (id,total,n_valid): (1,1,1),(2,3,2),(3,6,2),(4,12,2).
SELECT id,SUM(v) OVER recent total,COUNT(v) OVER recent n_valid
FROM doc_main_window_features
WINDOW base AS (PARTITION BY gid),
       recent AS (base ORDER BY tick,id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
ORDER BY id;

DROP TABLE doc_main_window_features;
