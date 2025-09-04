#!/bin/bash
#
# This script sets up the POW! contracts from configs

if [ "$FOC_ENV_FILE" ]; then
    source $FOC_ENV_FILE
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR=$SCRIPT_DIR/../..
CONTRACT_DIR=$PROJECT_DIR/onchain
CONFIGS_DIR=$PROJECT_DIR/frontend/app/configs

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

if [ -z $POW_GAME_CONTRACT_ADDRESS ]; then
    POW_GAME_CONTRACT_ADDRESS=$1
    if [ -z $POW_GAME_CONTRACT_ADDRESS ]; then
        echo "POW_GAME_CONTRACT_ADDRESS not set. Please set it in the environment or pass it as an argument."
        exit 1
    fi
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

AUTOMATIONS_CONFIG=$CONFIGS_DIR/automations.json
DAPP_CONFIG=$CONFIGS_DIR/dapps.json
PRESTIGE_CONFIG=$CONFIGS_DIR/prestige.json
UPGRADES_CONFIG=$CONFIGS_DIR/upgrades.json
TRANSACTIONS_CONFIG=$CONFIGS_DIR/transactions.json
UNLOCKS_CONFIG=$CONFIGS_DIR/unlocks.json

RPC_URL=https://starknet-mainnet.infura.io/v3/0d98c49747574cda8eeebee9c7353ca8

OUTPUT_DIR=$HOME/.pow-tests
TIMESTAMP=$(date +%s)
LOG_DIR=$OUTPUT_DIR/logs/$TIMESTAMP
TMP_DIR=$OUTPUT_DIR/tmp/$TIMESTAMP

# TODO: Clean option to remove old logs and state
#rm -rf $OUTPUT_DIR/logs/*
#rm -rf $OUTPUT_DIR/tmp/*
mkdir -p $LOG_DIR
mkdir -p $TMP_DIR

echo "Setting up POW! contracts..."
echo "POW_GAME_CONTRACT_ADDRESS: $POW_GAME_CONTRACT_ADDRESS"
echo
echo "======================================================================"
echo

echo "1. Setting up upgrades from $UPGRADES_CONFIG"
echo

UPGRADES_CONFIG_CONTENT=$(cat $UPGRADES_CONFIG)
L1_UPGRADES=$(echo $UPGRADES_CONFIG_CONTENT | jq -r '.L1[]')
L2_UPGRADES=$(echo $UPGRADES_CONFIG_CONTENT | jq -r '.L2[]')
for entry in $(echo $L1_UPGRADES | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=0
    ID=$(_jq '.id')
    NAME=$(_jq '.name')
    NAME_NO_SPACES=$(echo $NAME | tr -d ' ')
    NAME_HEX=$(echo -n $NAME | xxd -p | tr -d '\n')
    COSTS=$(_jq '.costs')
    VALUES=$(_jq '.values')
    BASE_VALUE=$(_jq '.baseValue')
    LEVELS=$(echo $COSTS | jq -r '. | length')
    LEVEL_INFO="0 $BASE_VALUE"
    for i in $(seq 0 $((LEVELS - 1))); do
        COST=$(echo $COSTS | jq -r ".[$i]")
        VALUE=$(echo $VALUES | jq -r ".[$i]")
        LEVEL_INFO="$LEVEL_INFO $COST $VALUE"
    done
    SETUP_UPGRADE_CALLDATA=$(echo $CHAIN_ID $ID 0x$NAME_HEX $((LEVELS + 1)) $LEVEL_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_upgrade_config $SETUP_UPGRADE_CALLDATA
done
for entry in $(echo $L2_UPGRADES | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=1
    ID=$(_jq '.id')
    NAME=$(_jq '.name')
    NAME_NO_SPACES=$(echo $NAME | tr -d ' ')
    NAME_HEX=$(echo -n $NAME | xxd -p | tr -d '\n')
    COSTS=$(_jq '.costs')
    VALUES=$(_jq '.values')
    BASE_VALUE=$(_jq '.baseValue')
    LEVELS=$(echo $COSTS | jq -r '. | length')
    LEVEL_INFO="0 $BASE_VALUE"
    for i in $(seq 0 $((LEVELS - 1))); do
        COST=$(echo $COSTS | jq -r ".[$i]")
        VALUE=$(echo $VALUES | jq -r ".[$i]")
        LEVEL_INFO="$LEVEL_INFO $COST $VALUE"
    done
    SETUP_UPGRADE_CALLDATA=$(echo $CHAIN_ID $ID 0x$NAME_HEX $((LEVELS + 1)) $LEVEL_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_upgrade_config $SETUP_UPGRADE_CALLDATA
done

echo
echo "Done setting up upgrades!"
echo
echo "2. Setting up automations from $AUTOMATIONS_CONFIG"
echo

AUTOMATIONS_CONFIG_CONTENT=$(cat $AUTOMATIONS_CONFIG)
L1_AUTOMATIONS=$(echo $AUTOMATIONS_CONFIG_CONTENT | jq -r '.L1[]')
L2_AUTOMATIONS=$(echo $AUTOMATIONS_CONFIG_CONTENT | jq -r '.L2[]')
for entry in $(echo $L1_AUTOMATIONS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=0
    ID=$(_jq '.id')
    NAME=$(_jq '.name')
    NAME_NO_SPACES=$(echo $NAME | tr -d ' ')
    NAME_HEX=$(echo -n $NAME | xxd -p | tr -d '\n')
    LEVELS=$(_jq '.levels[]')
    LEVEL_INFO="0 0"
    for level in $(echo $LEVELS | jq -r '. | @base64'); do
        _jqlevel() {
            echo ${level} | base64 --decode | jq -r ${1}
        }
        LEVEL_COST=$(_jqlevel '.cost')
        LEVEL_SPEED=$(_jqlevel '.speed')
        LEVEL_INFO="$LEVEL_INFO $LEVEL_COST $LEVEL_SPEED"
    done
    LEVELS=$(_jq '.levels')
    LEVELS=$(echo $LEVELS | jq -r '. | length')
    SETUP_AUTOMATION_CALLDATA=$(echo $CHAIN_ID $ID 0x$NAME_HEX $((LEVELS + 1)) $LEVEL_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_automation_config $SETUP_AUTOMATION_CALLDATA
done
for entry in $(echo $L2_AUTOMATIONS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=1
    ID=$(_jq '.id')
    NAME=$(_jq '.name')
    NAME_NO_SPACES=$(echo $NAME | tr -d ' ')
    NAME_HEX=$(echo -n $NAME | xxd -p | tr -d '\n')
    LEVELS=$(_jq '.levels[]')
    LEVEL_INFO="0 0"
    for level in $(echo $LEVELS | jq -r '. | @base64'); do
        _jqlevel() {
            echo ${level} | base64 --decode | jq -r ${1}
        }
        LEVEL_COST=$(_jqlevel '.cost')
        LEVEL_SPEED=$(_jqlevel '.speed')
        LEVEL_INFO="$LEVEL_INFO $LEVEL_COST $LEVEL_SPEED"
    done
    LEVELS=$(_jq '.levels')
    LEVELS=$(echo $LEVELS | jq -r '. | length')
    SETUP_AUTOMATION_CALLDATA=$(echo $CHAIN_ID $ID 0x$NAME_HEX $((LEVELS + 1)) $LEVEL_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_automation_config $SETUP_AUTOMATION_CALLDATA
done

echo
echo "Done setting up automations!"
echo
echo "3. Setting up transactions from $TRANSACTIONS_CONFIG"
echo

TRANSACTIONS_CONFIG_CONTENT=$(cat $TRANSACTIONS_CONFIG)
L1_TRANSACTIONS=$(echo $TRANSACTIONS_CONFIG_CONTENT | jq -r '.L1[]')
L1_TX_COUNT=$(echo $TRANSACTIONS_CONFIG_CONTENT | jq -r '.L1 | length')
L2_TRANSACTIONS=$(echo $TRANSACTIONS_CONFIG_CONTENT | jq -r '.L2[]')
L2_TX_COUNT=$(echo $TRANSACTIONS_CONFIG_CONTENT | jq -r '.L2 | length')
for entry in $(echo $L1_TRANSACTIONS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=0
    ID=$(_jq '.id')
    IS_DAPP=0
    FEE_COSTS=$(_jq '.feeCosts')
    FEES=$(_jq '.fees')
    SPEED_COSTS=$(_jq '.speedCosts')
    SPEEDS=$(_jq '.speeds')
    FEE_LEVELS_INFO="0 0"
    SPEED_LEVELS_INFO="0 0"
    LEVELS=$(echo $FEE_COSTS | jq -r '. | length')
    for i in $(seq 0 $((LEVELS - 1))); do
        FEE_COST=$(echo $FEE_COSTS | jq -r ".[$i]")
        FEE=$(echo $FEES | jq -r ".[$i]")
        FEE_LEVELS_INFO="$FEE_LEVELS_INFO $FEE_COST $FEE"
        SPEED_COST=$(echo $SPEED_COSTS | jq -r ".[$i]")
        SPEED=$(echo $SPEEDS | jq -r ".[$i]")
        SPEED_LEVELS_INFO="$SPEED_LEVELS_INFO $SPEED_COST $SPEED"
    done
    FEE_LEVELS=$(echo $FEE_COSTS | jq -r '. | length')
    SPEED_LEVELS=$(echo $SPEED_COSTS | jq -r '. | length')
    SETUP_TRANSACTION_CALLDATA=$(echo $CHAIN_ID $ID $IS_DAPP $((FEE_LEVELS + 1)) $FEE_LEVELS_INFO $((SPEED_LEVELS + 1)) $SPEED_LEVELS_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_transaction_config $SETUP_TRANSACTION_CALLDATA
done
for entry in $(echo $L2_TRANSACTIONS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=1
    ID=$(_jq '.id')
    IS_DAPP=0
    FEE_COSTS=$(_jq '.feeCosts')
    FEES=$(_jq '.fees')
    SPEED_COSTS=$(_jq '.speedCosts')
    SPEEDS=$(_jq '.speeds')
    FEE_LEVELS_INFO="0 0"
    SPEED_LEVELS_INFO="0 0"
    for i in $(seq 0 $((LEVELS - 1))); do
        FEE_COST=$(echo $FEE_COSTS | jq -r ".[$i]")
        FEE=$(echo $FEES | jq -r ".[$i]")
        FEE_LEVELS_INFO="$FEE_LEVELS_INFO $FEE_COST $FEE"
        SPEED_COST=$(echo $SPEED_COSTS | jq -r ".[$i]")
        SPEED=$(echo $SPEEDS | jq -r ".[$i]")
        SPEED_LEVELS_INFO="$SPEED_LEVELS_INFO $SPEED_COST $SPEED"
    done
    FEE_LEVELS=$(echo $FEE_COSTS | jq -r '. | length')
    SPEED_LEVELS=$(echo $SPEED_COSTS | jq -r '. | length')
    SETUP_TRANSACTION_CALLDATA=$(echo $CHAIN_ID $ID $IS_DAPP $((FEE_LEVELS + 1)) $FEE_LEVELS_INFO $((SPEED_LEVELS + 1)) $SPEED_LEVELS_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_transaction_config $SETUP_TRANSACTION_CALLDATA
done

echo
echo "Done setting up transactions!"
echo
echo "4. Setting up dapps from $DAPP_CONFIG"
echo

DAPP_CONFIG_CONTENT=$(cat $DAPP_CONFIG)
L1_DAPPS=$(echo $DAPP_CONFIG_CONTENT | jq -r '.L1.transactions[]')
L2_DAPPS=$(echo $DAPP_CONFIG_CONTENT | jq -r '.L2.transactions[]')
for entry in $(echo $L1_DAPPS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=0
    ID=$(_jq '.id')
    IS_DAPP=1
    FEE_COSTS=$(_jq '.feeCosts')
    FEES=$(_jq '.fees')
    SPEED_COSTS=$(_jq '.speedCosts')
    SPEEDS=$(_jq '.speeds')
    FEE_LEVELS_INFO="0 0"
    SPEED_LEVELS_INFO="0 0"
    for i in $(seq 0 $((LEVELS - 1))); do
        FEE_COST=$(echo $FEE_COSTS | jq -r ".[$i]")
        FEE=$(echo $FEES | jq -r ".[$i]")
        FEE_LEVELS_INFO="$FEE_LEVELS_INFO $FEE_COST $FEE"
        SPEED_COST=$(echo $SPEED_COSTS | jq -r ".[$i]")
        SPEED=$(echo $SPEEDS | jq -r ".[$i]")
        SPEED_LEVELS_INFO="$SPEED_LEVELS_INFO $SPEED_COST $SPEED"
    done
    FEE_LEVELS=$(echo $FEE_COSTS | jq -r '. | length')
    SPEED_LEVELS=$(echo $SPEED_COSTS | jq -r '. | length')
    SETUP_TRANSACTION_CALLDATA=$(echo $CHAIN_ID $((ID + L1_TX_COUNT)) $IS_DAPP $((FEE_LEVELS + 1)) $FEE_LEVELS_INFO $((SPEED_LEVELS + 1)) $SPEED_LEVELS_INFO)

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_transaction_config $SETUP_TRANSACTION_CALLDATA
done
for entry in $(echo $L2_DAPPS | jq -r '. | @base64'); do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    CHAIN_ID=1
    ID=$(_jq '.id')
    IS_DAPP=1
    FEE_COSTS=$(_jq '.feeCosts')
    FEES=$(_jq '.fees')
    SPEED_COSTS=$(_jq '.speedCosts')
    SPEEDS=$(_jq '.speeds')
    FEE_LEVELS_INFO="0 0"
    SPEED_LEVELS_INFO="0 0"
    for i in $(seq 0 $((LEVELS - 1))); do
        FEE_COST=$(echo $FEE_COSTS | jq -r ".[$i]")
        FEE=$(echo $FEES | jq -r ".[$i]")
        FEE_LEVELS_INFO="$FEE_LEVELS_INFO $FEE_COST $FEE"
        SPEED_COST=$(echo $SPEED_COSTS | jq -r ".[$i]")
        SPEED=$(echo $SPEEDS | jq -r ".[$i]")
        SPEED_LEVELS_INFO="$SPEED_LEVELS_INFO $SPEED_COST $SPEED"
    done
    FEE_LEVELS=$(echo $FEE_COSTS | jq -r '. | length')
    SPEED_LEVELS=$(echo $SPEED_COSTS | jq -r '. | length')
    SETUP_TRANSACTION_CALLDATA=$(echo $CHAIN_ID $((ID + L2_TX_COUNT)) $IS_DAPP $((FEE_LEVELS + 1)) $FEE_LEVELS_INFO $((SPEED_LEVELS + 1)) $SPEED_LEVELS_INFO)
    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    # sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
    starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_transaction_config $SETUP_TRANSACTION_CALLDATA
done

echo
echo "Done setting up dapps!"
echo
echo "5. Setting up prestige from $PRESTIGE_CONFIG"
echo

PRESTIGE_CONFIG_CONTENT=$(cat $PRESTIGE_CONFIG)
PRESTIGE_LEVELS=$(echo $PRESTIGE_CONFIG_CONTENT | jq -r '. | length')
PRESTIGE_COSTS_INFO=""
PRESTIGE_SCALERS_INFO=""
for i in $(seq 0 $((PRESTIGE_LEVELS - 1))); do
    COST=$(echo $PRESTIGE_CONFIG_CONTENT | jq -r ".[$i].cost")
    SCALER=$(echo $PRESTIGE_CONFIG_CONTENT | jq -r ".[$i].scaler")
    PRESTIGE_COSTS_INFO="$PRESTIGE_COSTS_INFO $COST"
    PRESTIGE_SCALERS_INFO="$PRESTIGE_SCALERS_INFO $SCALER"
done
PRESTIGE_LEVELS=$(echo $PRESTIGE_CONFIG_CONTENT | jq -r '. | length')
SETUP_PRESTIGE_CALLDATA=$(echo $((PRESTIGE_LEVELS)) $PRESTIGE_COSTS_INFO $((PRESTIGE_LEVELS)) $PRESTIGE_SCALERS_INFO)

# echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_CONTRACT_ADDRESS --function setup_prestige --calldata $SETUP_PRESTIGE_CALLDATA"
# sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_CONTRACT_ADDRESS --function setup_prestige --calldata $SETUP_PRESTIGE_CALLDATA
starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS setup_prestige_config $SETUP_PRESTIGE_CALLDATA
echo
echo "Done setting up prestige!"
echo
echo "6. Setting up chain and dapps unlock costs"
echo

# Set next chain cost (L2 unlock cost) from unlocks config
NEXT_CHAIN_COST=$(cat $UNLOCKS_CONFIG | jq -r '.next_chain_cost')
echo "Setting next chain cost to $NEXT_CHAIN_COST (from unlocks config)"
starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS set_next_chain_cost $NEXT_CHAIN_COST

# Set dapps unlock costs from unlocks config
L1_DAPPS_UNLOCK_COST=$(cat $UNLOCKS_CONFIG | jq -r '.dapps.L1.cost')
L2_DAPPS_UNLOCK_COST=$(cat $UNLOCKS_CONFIG | jq -r '.dapps.L2.cost')
echo "Setting L1 dapps unlock cost to $L1_DAPPS_UNLOCK_COST (from unlocks config)"
starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS set_dapps_unlock_cost 0 $L1_DAPPS_UNLOCK_COST
echo "Setting L2 dapps unlock cost to $L2_DAPPS_UNLOCK_COST (from unlocks config)"
starkli invoke --rpc $RPC_URL --network mainnet --keystore-password "$STARKNET_KEYSTORE_PASSWORD" --keystore $STARKNET_KEYSTORE --account $STARKNET_ACCOUNT --watch $POW_GAME_CONTRACT_ADDRESS set_dapps_unlock_cost 1 $L2_DAPPS_UNLOCK_COST

echo
echo "Done setting up costs!"
echo
echo "Completed setting up POW! contracts!"
