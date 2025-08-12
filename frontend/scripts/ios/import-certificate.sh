#!/bin/bash
set -e

CERTIFICATE_PATH=certificate.p12
echo "$APPSTORE_CERTIFICATE_BASE64" | base64 --decode > $CERTIFICATE_PATH

# create temporary keychain
security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

security import $CERTIFICATE_PATH -P $APPSTORE_CERTIFICATE_PASSWORD -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security list-keychain -d user -s $KEYCHAIN_PATH

rm $CERTIFICATE_PATH