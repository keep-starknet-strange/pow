#!/bin/bash
#
# This script sets up the POW! contracts from configs

if [ "$FOC_ENV_FILE" ]; then
    source $FOC_ENV_FILE
fi
if [ -z $POW_GAME_CONTRACT_ADDRESS ]; then
    POW_GAME_CONTRACT_ADDRESS=$1
    if [ -z $POW_GAME_CONTRACT_ADDRESS ]; then
        echo "POW_GAME_CONTRACT_ADDRESS not set. Please set it in the environment or pass it as an argument."
        exit 1
    fi
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR=$SCRIPT_DIR/../..
CONTRACT_DIR=$PROJECT_DIR/onchain
CONFIGS_DIR=$PROJECT_DIR/frontend/app/configs

AUTOMATIONS_CONFIG=$CONFIGS_DIR/automations.json
DAPP_CONFIG=$CONFIGS_DIR/dapps.json
PRESTIGE_CONFIG=$CONFIGS_DIR/prestige.json
UPGRADES_CONFIG=$CONFIGS_DIR/upgrades.json
TRANSACTIONS_CONFIG=$CONFIGS_DIR/transactions.json

ETH_ADDRESS=0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7
DEVNET_ACCOUNT_ADDRESS=0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691
DEVNET_ACCOUNT_NAME="account-1"
DEVNET_ACCOUNT_FILE=$CONTRACT_DIR/oz_acct.json

RPC_HOST="localhost"
RPC_PORT=5050
RPC_URL=http://$RPC_HOST:$RPC_PORT

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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_upgrade_config --calldata $SETUP_UPGRADE_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_upgrade --calldata $SETUP_UPGRADE_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_upgrade_config --calldata $SETUP_UPGRADE_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_automation_config --calldata $SETUP_AUTOMATION_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_automation --calldata $SETUP_AUTOMATION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_automation_config --calldata $SETUP_AUTOMATION_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
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

    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
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
    # echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA"
    sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_transaction_config --calldata $SETUP_TRANSACTION_CALLDATA
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

# echo "sncast --accounts-file /Users/brandonroberts/workspace/keep-starknet-strange/asd/click-chain/scripts/../onchain/oz_acct.json --account account-1 --wait --json invoke --url http://localhost:5050 --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_prestige --calldata $SETUP_PRESTIGE_CALLDATA"
sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function setup_prestige_config --calldata $SETUP_PRESTIGE_CALLDATA
echo
echo "Done setting up prestige!"
echo
echo "6. Setting up chain and dapps unlock costs"
echo

# Set next chain cost (L2 unlock cost)
NEXT_CHAIN_COST=316274400
echo "Setting next chain cost to $NEXT_CHAIN_COST"
sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function set_next_chain_cost --calldata $NEXT_CHAIN_COST

# Set dapps unlock cost
DAPPS_UNLOCK_COST=100000000
echo "Setting dapps unlock cost to $DAPPS_UNLOCK_COST"
sncast --accounts-file $DEVNET_ACCOUNT_FILE --account $DEVNET_ACCOUNT_NAME --wait --json invoke --url $RPC_URL --contract-address $POW_GAME_CONTRACT_ADDRESS --function set_dapps_unlock_cost --calldata $DAPPS_UNLOCK_COST

echo
echo "Done setting up costs!"
echo
echo "Completed setting up POW! contracts!"
