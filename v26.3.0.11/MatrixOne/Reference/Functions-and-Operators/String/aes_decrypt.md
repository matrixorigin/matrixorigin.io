---
title: "AES_DECRYPT()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MatrixOne supports only aes-128-ecb and aes-256-cbc block modes; MySQL 8.0 also supports the full set of ECB/CBC/CFB/OFB variants at multiple key sizes."
  - "MatrixOne AES_DECRYPT does not accept the optional kdf_name / salt / info KDF arguments present in MySQL 8.0."
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The AES_DECRYPT() function decrypts crypt_str with key_str using AES and returns the plaintext as a VARCHAR."
---

# **AES_DECRYPT()**

> The AES_DECRYPT() function decrypts crypt_str with key_str using AES and returns the plaintext as a VARCHAR.

## **Description**

The `AES_DECRYPT()` function decrypts `crypt_str` with `key_str` using AES and returns the plaintext as a `VARCHAR`. The encryption mode is selected by the session variable [`block_encryption_mode`](../../Variable/system-variables/system-variables-overview.md) and must match the mode used to produce `crypt_str`.

MatrixOne currently supports two modes:

- `aes-128-ecb` (default). Key is derived to 16 bytes; the optional `init_vector` argument is ignored.
- `aes-256-cbc`. Key is derived to 32 bytes; the `init_vector` argument is required and must be at least 16 bytes, matching the IV used to encrypt.

The function returns `NULL` in any of the following cases:

- `crypt_str` or `key_str` is `NULL`.
- `block_encryption_mode` is set to an unsupported value.
- CBC mode is selected but the IV is missing, `NULL`, or shorter than 16 bytes.
- Key derivation or the underlying AES operation fails (wrong key, tampered ciphertext, or bad padding).

## **Syntax**

```
> AES_DECRYPT(crypt_str, key_str)
> AES_DECRYPT(crypt_str, key_str, init_vector)
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| crypt_str | Required. The ciphertext to decrypt. Accepts `BLOB`, `VARCHAR`, `CHAR`, or `TEXT`. |
| key_str | Required. The encryption key that was used to produce `crypt_str`. |
| init_vector | Optional. The initialization vector, required when `block_encryption_mode` selects a CBC mode. |

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> SET block_encryption_mode = 'aes-128-ecb';
mysql> SELECT AES_DECRYPT(AES_ENCRYPT('MatrixOne', 'my-secret-key'), 'my-secret-key');
+--------------------------------------------------------------------------+
| aes_decrypt(aes_encrypt(matrixone, my-secret-key), my-secret-key)        |
+--------------------------------------------------------------------------+
| MatrixOne                                                                |
+--------------------------------------------------------------------------+
```

## **See also**

- [`AES_ENCRYPT()`](aes_encrypt.md)
