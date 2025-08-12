#!/bin/bash
set -e

CERTIFICATE_PATH=./certificate.p12
echo -n "$APPSTORE_CERTIFICATE_BASE64" | base64 --decode -o $CERTIFICATE_PATH

# create temporary keychain
security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_NAME
security set-keychain-settings -lut 21600 $KEYCHAIN_NAME
security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_NAME

security import $CERTIFICATE_PATH -P "$APPSTORE_CERTIFICATE_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_NAME
security list-keychain -d user -s $KEYCHAIN_NAME

rm $CERTIFICATE_PATH