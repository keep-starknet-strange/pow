#!/bin/bash
#
# Setup the accounts for devnet / app interactions

RPC_HOST="localhost"
RPC_PORT=5050
RPC_URL=http://$RPC_HOST:$RPC_PORT

ACCOUNT_ADDRESS="0x6bb5cb9e90444d2f3959b610ce383e6972050fa3aecf8982584afd4da8036e7"

curl -X POST $RPC_URL/mint -d '{"address":"'$ACCOUNT_ADDRESS'","amount":50000000000000000000}' -H "Content-Type:application/json"
