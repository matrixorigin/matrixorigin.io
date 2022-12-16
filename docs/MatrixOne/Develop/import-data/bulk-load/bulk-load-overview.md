# Bulk Load Overview

Bulk loading is the fastest way to insert large numbers of rows into a MatrixOne table. MatrixOne supports loading *csv*
and *jsonline* files from local file system or an S3-compatible object storage.
 
## Import the different file types

According to the different file types, MatrixOne currently mainly supports importing *.csv* or jsonlines:

- For how to import *.csv* format, see [Import *.csv* format data](load-csv.md).
- For how to import *.jl* format, see [Import jsonlines format data](load-jsonline.md).

## Import data from different data storage locations

According to the different data storage locations, MatrixOne supports *importing data from local* and *importing data from S3(Simple Storage Service)*.

- For how to import data from local host, see [Import *.csv* format data from local] (load-csv.md) or [Import jsonlines data from local] (load-jsonline.md).
- For how to import data from S3, see [Import data from S3](load-s3.md).
