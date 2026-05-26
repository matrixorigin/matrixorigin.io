---
title: "AES_ENCRYPT()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MatrixOne supports only aes-128-ecb and aes-256-cbc block modes; MySQL 8.0 also supports the full set of ECB/CBC/CFB/OFB variants at multiple key sizes."
  - "MatrixOne AES_ENCRYPT does not accept the optional kdf_name / salt / info KDF arguments present in MySQL 8.0."
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The AES_ENCRYPT() function encrypts str with key_str using AES and returns the ciphertext as a BLOB."
---

# **AES_ENCRYPT()**

> The AES_ENCRYPT() function encrypts str with key_str using AES and returns the ciphertext as a BLOB.

## **Description**

The `AES_ENCRYPT()` function encrypts `str` with `key_str` using AES and returns the ciphertext as a `BLOB`. The encryption mode is selected by the session variable [`block_encryption_mode`](../../Variable/system-variables/system-variables-overview.md).

MatrixOne currently supports two modes:

- `aes-128-ecb` (default). Key is derived to 16 bytes; the optional `init_vector` argument is ignored.
- `aes-256-cbc`. Key is derived to 32 bytes; the `init_vector` argument is required and must be at least 16 bytes.

The function returns `NULL` in any of the following cases:

- `str` or `key_str` is `NULL`.
- `block_encryption_mode` is set to an unsupported value.
- CBC mode is selected but the IV is missing, `NULL`, or shorter than 16 bytes.
- Key derivation or the underlying AES operation fails.

## **Syntax**

```
> AES_ENCRYPT(str, key_str)
> AES_ENCRYPT(str, key_str, init_vector)
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| str | Required. The plaintext string to encrypt. Accepts `VARCHAR`, `CHAR`, `TEXT`, or `BLOB`. |
| key_str | Required. The encryption key. |
| init_vector | Optional. The initialization vector, required when `block_encryption_mode` selects a CBC mode. Must be at least 16 bytes. |

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> SET block_encryption_mode = 'aes-128-ecb';
mysql> SELECT HEX(AES_ENCRYPT('MatrixOne', 'my-secret-key'));
+-------------------------------------------------+
| hex(aes_encrypt(matrixone, my-secret-key))      |
+-------------------------------------------------+
| 3B1A...                                         |
+-------------------------------------------------+

mysql> SET block_encryption_mode = 'aes-256-cbc';
mysql> SELECT HEX(AES_ENCRYPT('MatrixOne', 'my-secret-key', '0123456789abcdef'));
```

## **See also**

- [`AES_DECRYPT()`](aes_decrypt.md)
