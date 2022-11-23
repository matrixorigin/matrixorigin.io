# Bulk Load Overview

Bulk load data is supported in MatrixOne. Using the MatrixOne database, according to different data volumes, file types, or additional data storage locations, you can choose other import methods to improve your work efficiency.

## Importing the *.csv* or jsonlines format data

MatrixOne currently mainly supports importing two data formats:

- Support importing *.csv* format. For more information, see [Import *.csv* format data](load-csv.md).
- Support importing *.jl* format, jsonlines. For more information, see [Import jsonlines format data](load-jsonline.md).

## Importing data from S3

MatrixOne supports reading data from other file systems and importing it into MatrixOne's own database. Currently, MatrixOne supports reading files from Object Storage Service (Simple Storage Service, S3) and importing data into MatrixOne databases. For more information, see [Import data from S3](load-s3.md).
