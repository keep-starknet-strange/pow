use starknet::ContractAddress;

#[starknet::interface]
pub trait IClickChain<TContractState> {
    fn get_version(self: @TContractState) -> u128;
    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u128;
    fn get_user_block_metadata(
        self: @TContractState, user: ContractAddress, chain_id: u128,
    ) -> (u128, u128, u128);
    fn get_user_block_fee(self: @TContractState, user: ContractAddress, chain_id: u128) -> u128;
    fn get_user_block_hp(self: @TContractState, user: ContractAddress, chain_id: u128) -> u128;

    fn create_chain(ref self: TContractState);
    fn sequence_tx(ref self: TContractState, chain_id: u128, fee: u128);
    fn try_mine_block(ref self: TContractState, chain_id: u128) -> bool;
    fn mine_block(ref self: TContractState, chain_id: u128);
}

#[starknet::contract]
mod ClickChain {
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess,
        StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};

    #[derive(Drop, Clone, Serde, starknet::Store)]
    struct BlockMetadata {
        number: u128,
        size: u128,
        difficulty: u128,
        reward: u128,
    }

    // TODO: Max block size
    #[storage]
    struct Storage {
        version: u128,
        // Maps: user address -> user balance
        user_balances: Map<ContractAddress, u128>,
        // Maps: user address -> last chain id
        user_chain_count: Map<ContractAddress, u128>,
        // Maps: (user address, chain id) -> block metadata
        user_blocks_metadata: Map<(ContractAddress, u128), BlockMetadata>,
        // Maps: (user address, chain id) -> users block data (fee)
        user_blocks_fees: Map<(ContractAddress, u128), u128>,
        // Maps: (user address, chain id) -> block hp (# of tries)
        user_blocks_hp: Map<(ContractAddress, u128), u128>,
    }

    #[derive(Drop, starknet::Event)]
    struct UserBalanceUpdated {
        #[key]
        user: ContractAddress,
        old_balance: u128,
        new_balance: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct UserChainCreated {
        #[key]
        user: ContractAddress,
        chain_id: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct UserBlockMined {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u128,
        metadata: BlockMetadata,
    }

    #[derive(Drop, starknet::Event)]
    struct UserBlockFeeUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u128,
        old_fee: u128,
        new_fee: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct UserBlockHpUpdated {
        #[key]
        user: ContractAddress,
        #[key]
        chain_id: u128,
        old_hp: u128,
        new_hp: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        UserBalanceUpdated: UserBalanceUpdated,
        UserChainCreated: UserChainCreated,
        UserBlockMined: UserBlockMined,
        UserBlockFeeUpdated: UserBlockFeeUpdated,
        UserBlockHpUpdated: UserBlockHpUpdated,
    }

    #[constructor]
    fn constructor(ref self: ContractState, version: u128) {
        self.version.write(version);
    }

    #[abi(embed_v0)]
    impl ClickChainImpl of super::IClickChain<ContractState> {
        fn get_version(self: @ContractState) -> u128 {
            self.version.read()
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u128 {
            self.user_balances.read(user)
        }

        fn get_user_block_metadata(
            self: @ContractState, user: ContractAddress, chain_id: u128,
        ) -> (u128, u128, u128) {
            let metadata = self.user_blocks_metadata.read((user, chain_id));
            (metadata.number, metadata.size, metadata.difficulty)
        }

        fn get_user_block_fee(self: @ContractState, user: ContractAddress, chain_id: u128) -> u128 {
            self.user_blocks_fees.read((user, chain_id))
        }

        fn get_user_block_hp(self: @ContractState, user: ContractAddress, chain_id: u128) -> u128 {
            self.user_blocks_hp.read((user, chain_id))
        }

        fn create_chain(ref self: ContractState) {
            let user = get_caller_address();
            // Increment user chain count
            let chain_count = self.user_chain_count.read(user);
            self.user_chain_count.write(user, chain_count + 1);
            // Initialize user block metadata
            const new_difficulty: u128 = 8; // TODO: Set initial difficulty
            let new_block_metadata = BlockMetadata {
                number: 0,
                size: 64, // TODO: Set initial size
                difficulty: new_difficulty,
                reward: 5 // TODO: Set initial reward
            };
            // Initialize user block data
            self.user_blocks_hp.write((user, chain_count), new_difficulty);
            self.user_blocks_metadata.write((user, chain_count), new_block_metadata);
            self.user_blocks_fees.write((user, chain_count), 0);

            self.emit(UserChainCreated { user, chain_id: chain_count });
            self
                .emit(
                    UserBlockHpUpdated {
                        user, chain_id: chain_count, old_hp: 0, new_hp: new_difficulty,
                    },
                );
            self.emit(UserBlockFeeUpdated { user, chain_id: chain_count, old_fee: 0, new_fee: 0 });
        }

        // TODO: Check block size before sequencing transaction
        fn sequence_tx(ref self: ContractState, chain_id: u128, fee: u128) {
            let user = get_caller_address();
            let block_fees = self.user_blocks_fees.read((user, chain_id));
            self.user_blocks_fees.write((user, chain_id), block_fees + fee);
            self
                .emit(
                    UserBlockFeeUpdated {
                        user, chain_id, old_fee: block_fees, new_fee: block_fees + fee,
                    },
                );
        }

        // TODO: Make internal?
        fn try_mine_block(ref self: ContractState, chain_id: u128) -> bool {
            // TODO: Fail if not full of transactions?
            let user = get_caller_address();
            let block_hp = self.user_blocks_hp.read((user, chain_id));
            if block_hp == 0 {
                return true; // No more tries left, block is mineable
            }
            self.user_blocks_hp.write((user, chain_id), block_hp - 1);
            self
                .emit(
                    UserBlockHpUpdated { user, chain_id, old_hp: block_hp, new_hp: block_hp - 1 },
                );
            return false; // Block is not mineable yet
        }

        fn mine_block(ref self: ContractState, chain_id: u128) {
            if self.try_mine_block(chain_id) {
                let user = get_caller_address();
                let block_fees = self.user_blocks_fees.read((user, chain_id));
                let block_metadata = self.user_blocks_metadata.read((user, chain_id));
                const new_difficulty: u128 = 8; // TODO: Update difficulty based on some criteria
                let new_block_metadata = BlockMetadata {
                    number: block_metadata.number + 1,
                    size: block_metadata.size, // TODO: Update size based ...
                    difficulty: new_difficulty,
                    reward: 5 // TODO: Calculate reward based ...
                };
                // Reset user block data
                self.user_blocks_hp.write((user, chain_id), new_difficulty);
                self.user_blocks_metadata.write((user, chain_id), new_block_metadata.clone());
                self.user_blocks_fees.write((user, chain_id), 0);
                // Update balance
                let user_balance = self.user_balances.read(user);
                self.user_balances.write(user, user_balance + block_metadata.reward + block_fees);

                self.emit(UserBlockMined { user, chain_id, metadata: new_block_metadata });
                self
                    .emit(
                        UserBalanceUpdated {
                            user,
                            old_balance: user_balance,
                            new_balance: user_balance + block_metadata.reward + block_fees,
                        },
                    );
                self
                    .emit(
                        UserBlockHpUpdated {
                            user,
                            chain_id,
                            old_hp: 0, // TODO: Set to initial value
                            new_hp: new_difficulty,
                        },
                    );
                self.emit(UserBlockFeeUpdated { user, chain_id, old_fee: block_fees, new_fee: 0 });
            }
        }
    }
}
