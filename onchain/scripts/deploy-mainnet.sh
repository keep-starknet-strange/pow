#!/bin/bash
#
# Deploy POW! contracts to StarkNet Sepolia testnet

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT=$SCRIPT_DIR/../..

# Load env variable from `.env` only if they're not already set
if [ -z "$STARKNET_KEYSTORE" ] || [ -z "$STARKNET_ACCOUNT" ]; then
  source $PROJECT_ROOT/.env
fi

# Check if required env variables are set, if not exit
if [ -z "$STARKNET_KEYSTORE" ]; then
  echo "Error: STARKNET_KEYSTORE is not set."
  exit 1
elif [ -z "$STARKNET_ACCOUNT" ]; then
  echo "Error: STARKNET_ACCOUNT is not set."
  exit 1
fi

# TODO: Host & ...
display_help() {
  echo "Usage: $0 [option...]"
  echo
  echo "   -h, --help                               display help"

  echo
  echo "Example: $0"
}

# Transform long options to short ones
for arg in "$@"; do
  shift
  case "$arg" in
    "--help") set -- "$@" "-h" ;;
    --*) unrecognized_options+=("$arg") ;;
    *) set -- "$@" "$arg"
  esac
done

# Check if unknown options are passed, if so exit
if [ ! -z "${unrecognized_options[@]}" ]; then
  echo "Error: invalid option(s) passed ${unrecognized_options[*]}" 1>&2
  exit 1
fi

# Parse command line arguments
while getopts ":h" opt; do
  case ${opt} in
    h )
      display_help
      exit 0
      ;;
    \? )
      echo "Invalid Option: -$OPTARG" 1>&2
      display_help
      exit 1
      ;;
    : )
      echo "Invalid Option: -$OPTARG requires an argument" 1>&2
      display_help
      exit 1
      ;;
  esac
done

ONCHAIN_DIR=$PROJECT_ROOT/onchain
POW_GAME_SIERRA_FILE=$ONCHAIN_DIR/target/dev/pow_game_PowGame.contract_class.json

# Build the contract
echo "Building the contract..."
cd $ONCHAIN_DIR && scarb build

# Declaring the contract
echo "Declaring the contract..."
echo "starkli declare --network mainnet --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_SIERRA_FILE"
POW_GAME_DECLARE_OUTPUT=$(starkli declare --network mainnet --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_SIERRA_FILE 2>&1)
POR_GAME_CONTRACT_CLASSHASH=$(echo $POW_GAME_DECLARE_OUTPUT | tail -n 1 | awk '{print $NF}')
echo "Contract class hash: $POR_GAME_CONTRACT_CLASSHASH"

# Deploying the contract
ACCOUNT_ADDRESS=$(cat $STARKNET_ACCOUNT | jq -r '.deployment.address')
CALLDATA=$(echo -n $ACCOUNT_ADDRESS)
echo "Deploying the contract..."
echo "starkli deploy --network mainnet --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POR_GAME_CONTRACT_CLASSHASH $CALLDATA"
starkli deploy --network mainnet --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POR_GAME_CONTRACT_CLASSHASH $CALLDATA

#TODO: sncast deploy option
