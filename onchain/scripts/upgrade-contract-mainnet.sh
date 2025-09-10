#!/bin/bash
#
# This script upgrades the POW! contract on Mainnet
#

if [ "$FOC_ENV_FILE" ]; then
    source $FOC_ENV_FILE
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR=$SCRIPT_DIR/../..

# Load env variable from `.env` only if they're not already set
if [ -z "$STARKNET_KEYSTORE" ] || [ -z "$STARKNET_ACCOUNT" ]; then
  source $PROJECT_DIR/.env
fi

# Check if required env variables are set, if not exit
if [ -z "$STARKNET_KEYSTORE" ]; then
  echo "Error: STARKNET_KEYSTORE is not set."
  exit 1
elif [ -z "$STARKNET_ACCOUNT" ]; then
  echo "Error: STARKNET_ACCOUNT is not set."
  exit 1
fi

# Check if contract address was passed as first argument
CONTRACT_ADDRESS=$1
if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "Error: Contract address must be provided as first argument"
  echo "Usage: $0 <contract_address> <new_class_hash>"
  exit 1
fi

# Check if new class hash was passed as second argument
NEW_CLASS_HASH=$2
if [ -z "$NEW_CLASS_HASH" ]; then
  echo "Error: New class hash must be provided as second argument"
  echo "Usage: $0 <contract_address> <new_class_hash>"
  exit 1
fi

RPC_URL=https://starknet-mainnet.infura.io/v3/0d98c49747574cda8eeebee9c7353ca8

echo "Upgrading POW! contract on Mainnet..."
echo "Contract address: $CONTRACT_ADDRESS"
echo "New class hash: $NEW_CLASS_HASH"
echo
echo "======================================================================"
echo

# Invoke the upgrade method
echo "Invoking upgrade method..."
starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $CONTRACT_ADDRESS upgrade $NEW_CLASS_HASH

echo
echo "Contract upgrade transaction submitted!"
echo "New class hash: $NEW_CLASS_HASH"