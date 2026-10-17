# Error Code

This page explains client errors and lists selected common errors and internal error codes. Codes, names, and message templates have been checked against MatrixOne **v4.2.5**. For other versions, use the matching documentation and the full error message. This is not an exhaustive list of internal errors.

## Read an error message

A typical error in the MySQL command-line client looks like this; driver formatting can differ:

```text
ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'
```

| Field | Example | Meaning |
| --- | --- | --- |
| Client error number | `1062` | The numeric error number received by the client or driver; use it in the common-error table below. |
| SQLSTATE | `23000` | A five-character status identifying an error class; it is separate from the MatrixOne internal code. |
| Error message | `Duplicate entry '1' for key 'PRIMARY'` | Details of this failure, including key or object names. |
| MatrixOne internal code | `20307` | The internal classification for `ErrDuplicateEntry`; this number need not appear in the client message. |

For the errors listed below, a specific MySQL error mapping takes precedence in the client response. When the mapping is the generic unknown error (`ER_UNKNOWN_ERROR`), the client receives the MatrixOne internal code instead. For example, an unknown database has internal code `20402` but client error number `1049`. Client error numbers are therefore not always five digits, and SQLSTATE is not an internal code. Paths such as authentication can also translate errors, so retain the full message.

## Common client errors

A client error number can correspond to more than one internal error. Use the full message and SQLSTATE to distinguish them. These suggestions are starting points for investigation, not permission to retry automatically.

| Client error number | SQLSTATE | Internal code | Meaning and suggested action |
| --- | --- | --- | --- |
| 20102 | `HY000` | 20102 | Feature not implemented; check the feature limits for your version. |
| 3015 | `HY000` | 20103 | Out of memory; inspect the query plan, data volume, concurrency, and CN resources. |
| 1317 | `70100` | 20104 | Query interrupted; check whether the request was canceled or KILL QUERY was issued. |
| 20105 | `HY000` | 20105 | Unsupported operation; use the full message to identify the syntax or feature limitation. |
| 20106 | `HY000` | 20106 | Remote execution receiver not registered; if persistent, ask an administrator to inspect CN logs and node health. |
| 3015 | `HY000` | 20107 | Memory-pool capacity exceeded; inspect query memory use, concurrency, and CN resources. |
| 1062 | `23000` | 20307 | Duplicate key value; inspect the named primary or unique key and the input data. |
| 1136 | `21S01` | 20308 | Column/value count mismatch; check the INSERT column list and the indicated row. |
| 1054 | `42S22` | 20309 | Unknown column; check the column name, table alias, and actual schema. |
| 1049 | `42000` | 20402 | Unknown database; check the database name and current tenant. |
| 1146 | `42S02` | 20403 | Missing table; check the selected database, table name, and actual schema. |
| 1046 | `3D000` | 20415 | No database selected; select a database or qualify the object name with a database. |
| 20508 | `HY000` | 20508 | All compute nodes (CNs) are busy; inspect active transactions and connection concurrency, then have an administrator review capacity. |
| 20628 | `HY000` | 20628 | Transaction needs retry under read committed (RC); see the transaction retry guidance below. |
| 20630 | `HY000` | 20630 | S3 writes cannot use this RC transaction retry path; first verify the transaction outcome and write state. |
| 20638 | `HY000` | 20638 | Transaction commit status is unknown; verify the outcome before replaying writes. |
| 20701 | `HY000` | 20701 | Deadlock detected; confirm the failed transaction has rolled back before deciding whether to retry the whole transaction. |
| 20709 | `HY000` | 20709 | Remote lock wait timed out; inspect blocking transactions, the lock service, and node health. |
| 1205 | `HY000` | 20710 | Lock wait timed out; inspect blocking transactions and wait duration, and confirm the current transaction state. |

## Transaction failures and retries

- **Unknown commit status (20638)**: An error does not establish that the transaction failed to commit. Retain the transaction identifier and verify the outcome using business unique keys, query results, and administrator logs. Establish the outcome or an idempotency guarantee before deciding to resubmit.
- **Retry required (20628)**: First confirm the failed transaction's state. An application retry should start a new transaction after the failed transaction has ended, repeat the whole transaction, and use bounded retries with backoff. Do not just repeat the last statement in the original transaction.
- **Current retry path unavailable (20630)**: The message identifies a restriction on S3 writes in RC mode. Do not treat it as a retry-required signal; inspect the transaction and write state before choosing a recovery action.
- **Deadlock or lock wait timeout (20701, 20709, 1205)**: Investigate long-running and blocking transactions. A statement error does not uniformly mean the whole transaction has rolled back. Confirm transaction state and operation idempotency before retrying. Here, `1205` is the client error number for internal code `20710`.

For transaction usage, see the [transaction guide](../Develop/Transactions/matrixone-transaction-overview/how-to-use.md).

## Information to include in a support request

Record the MatrixOne version, client error number, SQLSTATE, full message, time of occurrence, and relevant query or transaction identifiers. Include sanitized SQL, whether the transaction is explicit or implicit, and any retries and their results so an administrator can correlate node logs.

## Internal error reference

The code name is a source symbol. In message templates, `%s`, `%d`, `%v`, and similar placeholders are replaced with runtime values. TAE is the storage engine, TN is a transaction node, RPC is a remote procedure call between nodes, and HAKeeper coordinates the cluster. Categories follow source groups and do not directly identify who must fix the problem.

Internal code `20100 / ErrStart` marks the beginning of the error range. In v4.2.5, `20626 / ErrTAEDebug` has a constant definition but no message mapping. Neither is listed as a user troubleshooting entry.

| Internal code | Code name | Message template | Category |
| --- | --- | --- | --- |
| 20101 | `ErrInternal` | `internal error: %s` | Internal error |
| 20102 | `ErrNYI` | `%s is not yet implemented` | Internal error |
| 20103 | `ErrOOM` | `error: out of memory` | Internal error |
| 20104 | `ErrQueryInterrupted` | `query interrupted` | Internal error |
| 20105 | `ErrNotSupported` | `not supported: %s` | Internal error |
| 20106 | `ErrRemoteDispatchNotRegistered` | `remote dispatch receiver %s is not registered yet` | Internal error |
| 20107 | `ErrMPoolCapacity` | `mpool physical capacity exceeded: %s` | Internal error |
| 20200 | `ErrDivByZero` | `division by zero` | Numbers and functions |
| 20201 | `ErrOutOfRange` | `data out of range: data type %s, %s` | Numbers and functions |
| 20202 | `ErrDataTruncated` | `data truncated: data type %s, %s` | Numbers and functions |
| 20203 | `ErrInvalidArg` | `invalid argument %s, bad value %s` | Numbers and functions |
| 20204 | `ErrTruncatedWrongValueForField` | `truncated type %s value %s for column %s, %d` | Numbers and functions |
| 20300 | `ErrBadConfig` | `invalid configuration: %s` | Invalid operation |
| 20301 | `ErrInvalidInput` | `invalid input: %s` | Invalid operation |
| 20302 | `ErrSyntaxError` | `SQL syntax error: %s` | Invalid operation |
| 20303 | `ErrParseError` | `SQL parser error: %s` | Invalid operation |
| 20304 | `ErrConstraintViolation` | `constraint violation: %s` | Invalid operation |
| 20305 | `ErrDuplicate` | `tae data: duplicate` | Invalid operation |
| 20306 | `ErrRoleGrantedToSelf` | `cannot grant role %s to %s` | Invalid operation |
| 20307 | `ErrDuplicateEntry` | `Duplicate entry '%s' for key '%s'` | Invalid operation |
| 20308 | `ErrWrongValueCountOnRow` | `Column count doesn't match value count at row %d` | Invalid operation |
| 20309 | `ErrBadFieldError` | `Unknown column '%s' in '%s'` | Invalid operation |
| 20400 | `ErrInvalidState` | `invalid state %s` | Unknown status or I/O error |
| 20401 | `ErrLogServiceNotReady` | `log service not ready` | Unknown status or I/O error |
| 20402 | `ErrBadDB` | `Unknown database %s` | Unknown status or I/O error |
| 20403 | `ErrNoSuchTable` | `no such table %s.%s` | Unknown status or I/O error |
| 20404 | `ErrEmptyVector` | `empty vector` | Unknown status or I/O error |
| 20405 | `ErrFileNotFound` | `file %s is not found` | Unknown status or I/O error |
| 20406 | `ErrFileAlreadyExists` | `file %s already exists` | Unknown status or I/O error |
| 20407 | `ErrUnexpectedEOF` | `unexpected end of file %s` | Unknown status or I/O error |
| 20408 | `ErrEmptyRange` | `empty range of file %s` | Unknown status or I/O error |
| 20409 | `ErrSizeNotMatch` | `file %s size does not match` | Unknown status or I/O error |
| 20410 | `ErrNoProgress` | `file %s has no io progress` | Unknown status or I/O error |
| 20411 | `ErrInvalidPath` | `invalid file path %s` | Unknown status or I/O error |
| 20412 | `ErrShortWrite` | `file %s io short write` | Unknown status or I/O error |
| 20413 | `ErrInvalidWrite` | `file %s io invalid write` | Unknown status or I/O error |
| 20414 | `ErrShortBuffer` | `file %s io short buffer` | Unknown status or I/O error |
| 20415 | `ErrNoDB` | `No database selected` | Unknown status or I/O error |
| 20416 | `ErrNoWorkingStore` | `no working store` | Unknown status or I/O error |
| 20417 | `ErrNoHAKeeper` | `cannot locate ha keeper` | Unknown status or I/O error |
| 20418 | `ErrInvalidTruncateLsn` | `invalid truncate lsn, shard %d already truncated to %d` | Unknown status or I/O error |
| 20419 | `ErrNotLeaseHolder` | `not lease holder, current lease holder ID %d` | Unknown status or I/O error |
| 20420 | `ErrDBAlreadyExists` | `database %s already exists` | Unknown status or I/O error |
| 20421 | `ErrTableAlreadyExists` | `table %s already exists` | Unknown status or I/O error |
| 20422 | `ErrNoService` | `service %s not found` | Unknown status or I/O error |
| 20423 | `ErrDupServiceName` | `duplicate service name %s` | Unknown status or I/O error |
| 20424 | `ErrWrongService` | `wrong service, expecting %s, got %s` | Unknown status or I/O error |
| 20425 | `ErrBadS3Config` | `bad s3 config: %s` | Unknown status or I/O error |
| 20426 | `ErrBadView` | `invalid view '%s.%s'` | Unknown status or I/O error |
| 20427 | `ErrInvalidTask` | `invalid task, task runner %s, id %d` | Unknown status or I/O error |
| 20428 | `ErrInvalidServiceIndex` | `invalid service idx %d` | Unknown status or I/O error |
| 20429 | `ErrDragonboatTimeout` | `%s` | Unknown status or I/O error |
| 20430 | `ErrDragonboatTimeoutTooSmall` | `%s` | Unknown status or I/O error |
| 20431 | `ErrDragonboatInvalidDeadline` | `%s` | Unknown status or I/O error |
| 20432 | `ErrDragonboatRejected` | `%s` | Unknown status or I/O error |
| 20433 | `ErrDragonboatInvalidPayloadSize` | `%s` | Unknown status or I/O error |
| 20434 | `ErrDragonboatShardNotReady` | `%s` | Unknown status or I/O error |
| 20435 | `ErrDragonboatSystemClosed` | `%s` | Unknown status or I/O error |
| 20436 | `ErrDragonboatInvalidRange` | `%s` | Unknown status or I/O error |
| 20437 | `ErrDragonboatShardNotFound` | `%s` | Unknown status or I/O error |
| 20438 | `ErrDragonboatOtherSystemError` | `%s` | Unknown status or I/O error |
| 20439 | `ErrDropNonExistsDB` | `Can't drop database '%s'; database doesn't exist` | Unknown status or I/O error |
| 20500 | `ErrRPCTimeout` | `rpc timeout` | RPC |
| 20501 | `ErrClientClosed` | `rpc client closed` | RPC |
| 20502 | `ErrBackendClosed` | `backend connection closed` | RPC |
| 20503 | `ErrStreamClosed` | `rpc stream closed` | RPC |
| 20504 | `ErrNoAvailableBackend` | `no available backend` | RPC |
| 20508 | `ErrAllCNServersBusy` | `all CN servers are busy, possibly due to too many active transactions` | RPC |
| 20600 | `ErrTxnClosed` | `the transaction %s has been committed or aborted` | Transaction |
| 20601 | `ErrTxnWriteConflict` | `txn write conflict %s` | Transaction |
| 20602 | `ErrMissingTxn` | `missing txn` | Transaction |
| 20603 | `ErrUnresolvedConflict` | `unresolved conflict` | Transaction |
| 20604 | `ErrTxnError` | `transaction error: %s` | Transaction |
| 20605 | `ErrTNShardNotFound` | `dn shard uuid %s, id %d not found` | Transaction |
| 20606 | `ErrShardNotReported` | `dn shard uuid %s, id %d not reported` | Transaction |
| 20607 | `ErrTAEError` | `tae error %s` | TAE Error |
| 20608 | `ErrTAERead` | `tae read error` | TAE Error |
| 20609 | `ErrRpcError` | `rpc error` | TAE Error |
| 20610 | `ErrWaitTxn` | `txn wait error` | TAE Error |
| 20611 | `ErrTxnNotFound` | `txn not found` | TAE Error |
| 20612 | `ErrTxnNotActive` | `txn not active, state %s` | TAE Error |
| 20613 | `ErrTAEWrite` | `tae write error` | TAE Error |
| 20614 | `ErrTAECommit` | `tae commit error %s` | TAE Error |
| 20615 | `ErrTAERollback` | `tae rollback error %s` | TAE Error |
| 20616 | `ErrTAEPrepare` | `tae prepare error %s` | TAE Error |
| 20617 | `ErrTAEPossibleDuplicate` | `tae possible duplicate` | TAE Error |
| 20618 | `ErrTxnRWConflict` | `r-w conflict` | TAE Error |
| 20619 | `ErrTxnWWConflict` | `w-w conflict` | TAE Error |
| 20620 | `ErrNotFound` | `not found` | TAE Error |
| 20621 | `ErrTxnInternal` | `txn internal error` | TAE Error |
| 20622 | `ErrTxnReadConflict` | `txn read conflict %s` | TAE Error |
| 20623 | `ErrPrimaryKeyDuplicated` | `duplicated primary key %v` | TAE Error |
| 20624 | `ErrAppendableObjectNotFound` | `appendable Object not found` | TAE Error |
| 20625 | `ErrAppendableBlockNotFound` | `appendable block not found` | TAE Error |
| 20628 | `ErrTxnNeedRetry` | `txn need retry in rc mode` | Transaction |
| 20630 | `ErrTxnCannotRetry` | `txn s3 writes can not retry in rc mode` | Transaction |
| 20638 | `ErrTxnUnknown` | `txn commit status is unknown: %s` | Transaction |
| 20701 | `ErrDeadLockDetected` | `deadlock detected` | Lock error |
| 20709 | `ErrRemoteLockWaitTimeout` | `remote lock wait timeout` | Lock error |
| 20710 | `ErrLockWaitTimeout` | `Lock wait timeout exceeded; try restarting transaction` | Lock error |

## Sources

Codes and names come from the [v4.2.5 error definitions and message mappings](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/common/moerr/error.go). Client error numbers follow the [MySQL error definitions](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/common/moerr/mysql_error_define.go) and [client error conversion](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/frontend/util.go#L1027).
