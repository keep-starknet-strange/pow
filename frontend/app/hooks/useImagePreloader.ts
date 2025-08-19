import { useImage } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";

const assetsPath = "../../assets";

const imagePaths = {
  // General Images
  logo: require(`${assetsPath}/logo/pow.webp`),
  logoP: require(`${assetsPath}/logo/P.webp`),
  logoO: require(`${assetsPath}/logo/O.webp`),
  logoW: require(`${assetsPath}/logo/W.webp`),
  logoExclamation: require(`${assetsPath}/logo/!.webp`),
  sublogo: require(`${assetsPath}/logo/sublogo.webp`),
  starknet: require(`${assetsPath}/logo/starknet_pixel.webp`),
  background: require(`${assetsPath}/background.webp`),
  backgroundGrid: require(`${assetsPath}/background-grid.webp`),
  topBar: require(`${assetsPath}/top_bar.webp`),
  iconRandom: require(`${assetsPath}/icons/icon_dice.webp`),
  iconClose: require(`${assetsPath}/icons/icon_cross.webp`),
  iconEdit: require(`${assetsPath}/icons/icon_edit.webp`),
  basicButton: require(`${assetsPath}/basic_button.webp`),
  secondaryButton: require(`${assetsPath}/secondary_button.webp`),
  stakingButton: require(`${assetsPath}/staking/button.webp`),
  header: require(`${assetsPath}/gui_top.webp`),
  headerSwitch: require(`${assetsPath}/lSwitch_background.webp`),
  headerSwitchActive: require(`${assetsPath}/lSwitch_active.webp`),
  headerSwitchInactive: require(`${assetsPath}/lSwitch_inactive.webp`),
  notificationUnlock: require(`${assetsPath}/notification.webp`),

  // Account Creation
  nounsTitleplate: require(`${assetsPath}/nouns/create_titleplate.webp`),
  nounsSlots: require(`${assetsPath}/nouns/slot.webp`),
  nounsTabInactive: require(`${assetsPath}/nouns/slot_inactive.webp`),
  nounsTabActive: require(`${assetsPath}/nouns/slot_active.webp`),
  nounsCreatorBg: require(`${assetsPath}/nouns/create_bg.webp`),
  nounsCreatorButton: require(`${assetsPath}/nouns/button.webp`),

  // L2
  l2BarsBg: require(`${assetsPath}/l2/l2_bars_bg.webp`),
  l2BarsBar: require(`${assetsPath}/l2/l2_bars_bar.webp`),
  l2BarsPlaque: require(`${assetsPath}/l2/l2_number_plaque.webp`),

  // Transaction Images - Backgrounds
  txBackground: require(`${assetsPath}/transactions/gui_bottom.webp`),
  l2TxBackground: require(`${assetsPath}/l2/l2_gui_bottom.webp`),
  txsBorder: require(`${assetsPath}/transactions/transactions_border.webp`),
  txTabActive: require(
    `${assetsPath}/transactions/transactions_tab_active.webp`,
  ),
  txTabInactive: require(
    `${assetsPath}/transactions/transactions_tab_inactive.webp`,
  ),
  txButtonBlueEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_blue_empty.webp`,
  ),
  txButtonGreenEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_green_empty.webp`,
  ),
  txButtonPinkEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_pink_empty.webp`,
  ),
  txButtonPurpleEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_purple_empty.webp`,
  ),
  txButtonYellowEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_yellow_empty.webp`,
  ),
  txButtonBlueInner: require(
    `${assetsPath}/transactions/backgrounds/button_blue_inner.webp`,
  ),
  txButtonGreenInner: require(
    `${assetsPath}/transactions/backgrounds/button_green_inner.webp`,
  ),
  txButtonPinkInner: require(
    `${assetsPath}/transactions/backgrounds/button_pink_inner.webp`,
  ),
  txButtonPurpleInner: require(
    `${assetsPath}/transactions/backgrounds/button_purple_inner.webp`,
  ),
  txButtonYellowInner: require(
    `${assetsPath}/transactions/backgrounds/button_yellow_inner.webp`,
  ),

  // Transaction Images - Icons
  txIconTx: require(`${assetsPath}/transactions/icons/icon_tx_lg.webp`),
  txIconSegwit: require(`${assetsPath}/transactions/icons/icon_segwit_lg.webp`),
  txIconBlob: require(`${assetsPath}/transactions/icons/icon_blob_lg.webp`),
  txIconOrdinal: require(
    `${assetsPath}/transactions/icons/icon_ordinal_lg.webp`,
  ),
  txIconRunes: require(`${assetsPath}/transactions/icons/icon_runes_lg.webp`),
  txIconBridge: require(`${assetsPath}/transactions/icons/icon_bridge_lg.webp`),
  txIconSwap: require(`${assetsPath}/transactions/icons/icon_swap_lg.webp`),
  txIconNfts: require(`${assetsPath}/transactions/icons/icon_nfts_lg.webp`),
  txIconOracle: require(`${assetsPath}/transactions/icons/icon_oracle_lg.webp`),
  txIconDao: require(`${assetsPath}/transactions/icons/icon_dao_lg.webp`),
  txIconGmswap: require(`${assetsPath}/transactions/icons/icon_gmswap_lg.webp`),
  txIconArtsea: require(`${assetsPath}/transactions/icons/icon_artsea_lg.webp`),
  txIconPaave: require(`${assetsPath}/transactions/icons/icon_paave_lg.webp`),
  txIconHodlee: require(`${assetsPath}/transactions/icons/icon_hodlee_lg.webp`),
  txIconWagmi: require(`${assetsPath}/transactions/icons/icon_wagmi_lg.webp`),
  txIconUnrug: require(`${assetsPath}/transactions/icons/icon_unrug_lg.webp`),
  txIcon42inch: require(`${assetsPath}/transactions/icons/icon_42inch_lg.webp`),
  txIconLendme: require(`${assetsPath}/transactions/icons/icon_lendme_lg.webp`),
  txIconGalaxia: require(
    `${assetsPath}/transactions/icons/icon_galaxia_lg.webp`,
  ),
  txIconJourney: require(
    `${assetsPath}/transactions/icons/icon_journey_lg.webp`,
  ),

  // Transaction Images - Nameplates
  txNameplateBlue: require(
    `${assetsPath}/transactions/nameplate/nameplate_blue.webp`,
  ),
  txNameplateGreen: require(
    `${assetsPath}/transactions/nameplate/nameplate_green.webp`,
  ),
  txNameplatePink: require(
    `${assetsPath}/transactions/nameplate/nameplate_pink.webp`,
  ),
  txNameplatePurple: require(
    `${assetsPath}/transactions/nameplate/nameplate_purple.webp`,
  ),
  txNameplateYellow: require(
    `${assetsPath}/transactions/nameplate/nameplate_yellow.webp`,
  ),
  txPlaquePlus: require(`${assetsPath}/transactions/value_plaque_plus.webp`),
  txPlaqueMinus: require(`${assetsPath}/transactions/value_plaque_minus.webp`),

  // Block Images
  blockTxBgBlue: require(
    `${assetsPath}/block/backgrounds/blockchain_block_blue.webp`,
  ),
  blockTxBgGreen: require(
    `${assetsPath}/block/backgrounds/blockchain_block_green.webp`,
  ),
  blockTxBgPink: require(
    `${assetsPath}/block/backgrounds/blockchain_block_pink.webp`,
  ),
  blockTxBgPurple: require(
    `${assetsPath}/block/backgrounds/blockchain_block_purple.webp`,
  ),
  blockTxBgYellow: require(
    `${assetsPath}/block/backgrounds/blockchain_block_yellow.webp`,
  ),
  blockTxBgEmpty: require(
    `${assetsPath}/block/backgrounds/blockchain_block_empty.webp`,
  ),
  blockTxIconTx: require(`${assetsPath}/block/icons/icon_tx_sm.webp`),
  blockTxIconSegwit: require(`${assetsPath}/block/icons/icon_segwit_sm.webp`),
  blockTxIconBlob: require(`${assetsPath}/block/icons/icon_blob_sm.webp`),
  blockTxIconOrdinal: require(`${assetsPath}/block/icons/icon_ordinal_sm.webp`),
  blockTxIconRunes: require(`${assetsPath}/block/icons/icon_runes_sm.webp`),
  blockTxIconBridge: require(`${assetsPath}/block/icons/icon_bridge_sm.webp`),
  blockTxIconSwap: require(`${assetsPath}/block/icons/icon_swap_sm.webp`),
  blockTxIconNfts: require(`${assetsPath}/block/icons/icon_nfts_sm.webp`),
  blockTxIconOracle: require(`${assetsPath}/block/icons/icon_oracle_sm.webp`),
  blockTxIconDao: require(`${assetsPath}/block/icons/icon_dao_sm.webp`),
  blockTxIconGmswap: require(`${assetsPath}/block/icons/icon_gmswap_sm.webp`),
  blockTxIconArtsea: require(`${assetsPath}/block/icons/icon_artsea_sm.webp`),
  blockTxIconPaave: require(`${assetsPath}/block/icons/icon_paave_sm.webp`),
  blockTxIconHodlee: require(`${assetsPath}/block/icons/icon_hodlee_sm.webp`),
  blockTxIconWagmi: require(`${assetsPath}/block/icons/icon_wagmi_sm.webp`),
  blockTxIconUnrug: require(`${assetsPath}/block/icons/icon_unrug_sm.webp`),
  blockTxIcon42inch: require(`${assetsPath}/block/icons/icon_42inch_sm.webp`),
  blockTxIconLendme: require(`${assetsPath}/block/icons/icon_lendme_sm.webp`),
  blockTxIconGalaxia: require(`${assetsPath}/block/icons/icon_galaxia_sm.webp`),
  blockTxIconJourney: require(`${assetsPath}/block/icons/icon_journey_sm.webp`),
  blockGrid: require(`${assetsPath}/block/blockchain_grid.webp`),
  blockGridMin: require(`${assetsPath}/block/blockchain_grid_inactive.webp`),
  blockConnector: require(
    `${assetsPath}/block/blockchain_grid_chainconnector.webp`,
  ),

  // Staking
  stakingBg: require(`${assetsPath}/staking/staking_bg.webp`),
  stakingButtonBg: require(`${assetsPath}/staking/button.webp`),
  stakingAmountsBg: require(`${assetsPath}/staking/staking_amounts_bg.webp`),

  // Navigation Images
  navButton: require(`${assetsPath}/navigation/menu_button_normal.webp`),
  navButtonActive: require(
    `${assetsPath}/navigation/menu_button_selected.webp`,
  ),
  navIconGame: require(`${assetsPath}/navigation/icon_game.webp`),
  navIconStaking: require(`${assetsPath}/navigation/icon_stake.webp`),
  navIconShop: require(`${assetsPath}/navigation/icon_shop.webp`),
  navIconFlag: require(`${assetsPath}/navigation/icon_flag.webp`),
  navIconMedal: require(`${assetsPath}/navigation/icon_medal.webp`),
  navIconSettings: require(`${assetsPath}/navigation/icon_settings.webp`),
  navIconGameActive: require(
    `${assetsPath}/navigation/icon_game_selected.webp`,
  ),
  navIconStakingActive: require(
    `${assetsPath}/navigation/icon_stake_selected.webp`,
  ),
  navIconShopActive: require(
    `${assetsPath}/navigation/icon_shop_selected.webp`,
  ),
  navIconFlagActive: require(
    `${assetsPath}/navigation/icon_flag_selected.webp`,
  ),
  navIconMedalActive: require(
    `${assetsPath}/navigation/icon_medal_selected.webp`,
  ),
  navIconSettingsActive: require(
    `${assetsPath}/navigation/icon_settings_selected.webp`,
  ),

  // Shop Images
  shopBg: require(`${assetsPath}/shop/shop_bg.webp`),
  shopBtc: require(`${assetsPath}/shop/icons/icon_btcSmall.webp`),
  shopClock: require(`${assetsPath}/shop/icons/icon_clockSmall.webp`),
  shopTitle: require(`${assetsPath}/shop/title_bar.webp`),
  shopSeparator: require(`${assetsPath}/shop/shop_line.webp`),
  shopNamePlaque: require(`${assetsPath}/shop/shop_name_plaque.webp`),
  shopTab: require(`${assetsPath}/shop/shop_tab.webp`),
  shopTabActive: require(`${assetsPath}/shop/shop_tab_active.webp`),
  shopTxBuyButton: require(
    `${assetsPath}/shop/shop_transactions_buy_button.webp`,
  ),
  shopAutoBuyButton: require(
    `${assetsPath}/shop/shop_automation_buy_button.webp`,
  ),
  shopIconBgBlue: require(`${assetsPath}/shop/shop_icon_background_blue.webp`),
  shopIconBgGreen: require(
    `${assetsPath}/shop/shop_icon_background_green.webp`,
  ),
  shopIconBgPink: require(`${assetsPath}/shop/shop_icon_background_pink.webp`),
  shopIconBgPurple: require(
    `${assetsPath}/shop/shop_icon_background_purple.webp`,
  ),
  shopIconBgYellow: require(
    `${assetsPath}/shop/shop_icon_background_yellow.webp`,
  ),
  shopLock: require(`${assetsPath}/shop/icon_lock.webp`),

  // Shop Upgrades
  shopBlockDifficulty: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockDifficulty.webp`,
  ),
  shopBlockSize: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockSize.webp`,
  ),
  shopBlockReward: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockReward.webp`,
  ),
  shopDaComp: require(`${assetsPath}/shop/icons/upgrades/icon_daComp.webp`),
  shopMevBoost: require(`${assetsPath}/shop/icons/upgrades/icon_mevBoost.webp`),
  shopRecursiveProof: require(
    `${assetsPath}/shop/icons/upgrades/icon_recursiveProof.webp`,
  ),

  // Shop Automations
  shopAutomationsMinerBase: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_baseMiner.webp`,
  ),
  shopAutomationsMinerCpu: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_cpu.webp`,
  ),
  shopAutomationsMinerGpu: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_mining.webp`,
  ),
  shopAutomationsMinerAsic: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_asic.webp`,
  ),
  shopAutomationsMinerAnt: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_antMiner.webp`,
  ),
  shopAutomationsMinerBitmain: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_bitmain.webp`,
  ),
  shopAutomationsMinerQuantum: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_quantumMiner.webp`,
  ),

  // Achievement Images
  achievmentsBg: require(`${assetsPath}/achievements/achievements_bg.webp`),
  achievementsTileLocked: require(
    `${assetsPath}/achievements/achievements_tile_locked.webp`,
  ),
  achievementsTileProgress: require(
    `${assetsPath}/achievements/achievements_tile_in_progress.webp`,
  ),
  achievementsTileAchieved: require(
    `${assetsPath}/achievements/achievements_achieved.webp`,
  ),
  achievementsTitle: require(
    `${assetsPath}/achievements/achievements_category_plaque.webp`,
  ),
  achievementsTileOverlay: require(
    `${assetsPath}/achievements/achievements_tile.webp`,
  ),
  achievements100: require(`${assetsPath}/achievements/icons/icon_100.webp`),
  achievements1000: require(`${assetsPath}/achievements/icons/icon_1000.webp`),
  achievementsStake: require(
    `${assetsPath}/achievements/icons/icon_achieveStake.webp`,
  ),
  achievementsL2: require(
    `${assetsPath}/achievements/icons/icon_achieveL2.webp`,
  ),
  achievementsMining: require(
    `${assetsPath}/achievements/icons/icon_achieveMining.webp`,
  ),
  achievementsMoney1: require(
    `${assetsPath}/achievements/icons/Money/icon_100btc.webp`,
  ),
  achievementsMoney2: require(
    `${assetsPath}/achievements/icons/Money/icon_1000btc.webp`,
  ),
  achievementsMoney3: require(
    `${assetsPath}/achievements/icons/Money/icon_10000btc.webp`,
  ),
  achievmentsMoney4: require(
    `${assetsPath}/achievements/icons/Money/icon_1000000btc.webp`,
  ),
  achievementsAutomationDa: require(
    `${assetsPath}/achievements/icons/Automation/icon_achieveDa.webp`,
  ),
  achievementsAutomationStwo: require(
    `${assetsPath}/achievements/icons/Automation/icon_achieveStwo.webp`,
  ),
  achievmentsAutomationSequencer: require(
    `${assetsPath}/achievements/icons/Automation/icon_decSeq.webp`,
  ),
  achievmentsAutomationMiner: require(
    `${assetsPath}/achievements/icons/Automation/icon_quantumMiner.webp`,
  ),
  achievementsL1Dapps: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1dapps.webp`,
  ),
  achievementsL1Transactions: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1transactions.webp`,
  ),
  achievementsL1Upgrades: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1upgrades.webp`,
  ),
  achievementsL1Blocks1: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l110blocks.webp`,
  ),
  achievementsL1Blocks2: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1100blocks.webp`,
  ),
  achievementsL1Blocks3: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l11000blocks.webp`,
  ),
  achievementsL1Blocks4: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l110000blocks.webp`,
  ),
  achievementsL2Dapps: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2dapps.webp`,
  ),
  achievementsL2Transactions: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2transactions.webp`,
  ),
  achievementsL2Upgrades: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2upgrades.webp`,
  ),
  achievementsL2Blocks1: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l210blocks.webp`,
  ),
  achievementsL2Blocks2: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2100blocks.webp`,
  ),
  achievementsL2Blocks3: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l21000blocks.webp`,
  ),
  achievementsL2Blocks4: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l210000blocks.webp`,
  ),

  shopAutomationsSequencer0: require(
    `${assetsPath}/shop/icons/automations/Sequencer/icon_base.webp`,
  ),
  shopAutomationsSequencer1: require(
    `${assetsPath}/shop/icons/automations/Sequencer/icon_cloud.webp`,
  ),
  shopAutomationsSequencer2: require(
    `${assetsPath}/shop/icons/automations/Sequencer/icon_cairo.webp`,
  ),
  shopAutomationsSequencer3: require(
    `${assetsPath}/shop/icons/automations/Sequencer/icon_parallel.webp`,
  ),
  shopAutomationsSequencer4: require(
    `${assetsPath}/shop/icons/automations/Sequencer/icon_decentralized.webp`,
  ),
  shopAutomationsProver0: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_optimistic.webp`,
  ),
  shopAutomationsProver1: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_snark.webp`,
  ),
  shopAutomationsProver2: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_stark.webp`,
  ),
  shopAutomationsProver3: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_stone.webp`,
  ),
  shopAutomationsProver4: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_recursiveProof.webp`,
  ),
  shopAutomationsProver5: require(
    `${assetsPath}/shop/icons/automations/Prover/icon_stwo.webp`,
  ),
  shopAutomationsDa0: require(
    `${assetsPath}/shop/icons/automations/DA/icon_calldata.webp`,
  ),
  shopAutomationsDa1: require(
    `${assetsPath}/shop/icons/automations/DA/icon_daCompression.webp`,
  ),
  shopAutomationsDa2: require(
    `${assetsPath}/shop/icons/automations/DA/icon_daComp.webp`,
  ),
  shopAutomationsDa3: require(
    `${assetsPath}/shop/icons/automations/DA/icon_das.webp`,
  ),
  shopAutomationsDa4: require(
    `${assetsPath}/shop/icons/automations/DA/icon_volition.webp`,
  ),

  // Tutorial Images
  tutorialArrow: require(`${assetsPath}/tutorial/arrow.webp`),
  tutorialWindow: require(`${assetsPath}/tutorial/window.webp`),

  // Prestige Icons
  prestige1: require(`${assetsPath}/prestige/icon_prestige1.webp`),
  prestige2: require(`${assetsPath}/prestige/icon_prestige2.webp`),
  prestige3: require(`${assetsPath}/prestige/icon_prestige3.webp`),
  prestige4: require(`${assetsPath}/prestige/icon_prestige4.webp`),
  prestige5: require(`${assetsPath}/prestige/icon_prestige5.webp`),
  prestige6: require(`${assetsPath}/prestige/icon_prestige6.webp`),
  prestige7: require(`${assetsPath}/prestige/icon_prestige7.webp`),
  prestige8: require(`${assetsPath}/prestige/icon_prestige8.webp`),
  prestige9: require(`${assetsPath}/prestige/icon_prestige9.webp`),
  prestige10: require(`${assetsPath}/prestige/icon_prestige10.webp`),
};

// Global state for preloaded images
let globalImages: Record<string, ReturnType<typeof useImage>> | null = null;
let globalIsLoading = true;
const subscribers: Set<() => void> = new Set();

// Hook for components that need to trigger image preloading
export const useImagePreloader = () => {
  const [isLoading, setIsLoading] = useState(globalIsLoading);

  // Load all images using useImage hook
  const images = {
    logo: useImage(imagePaths.logo),
    logoP: useImage(imagePaths.logoP),
    logoO: useImage(imagePaths.logoO),
    logoW: useImage(imagePaths.logoW),
    logoExclamation: useImage(imagePaths.logoExclamation),
    sublogo: useImage(imagePaths.sublogo),
    starknet: useImage(imagePaths.starknet),
    background: useImage(imagePaths.background),
    backgroundGrid: useImage(imagePaths.backgroundGrid),
    header: useImage(imagePaths.header),
    headerSwitch: useImage(imagePaths.headerSwitch),
    headerSwitchActive: useImage(imagePaths.headerSwitchActive),
    headerSwitchInactive: useImage(imagePaths.headerSwitchInactive),
    notificationUnlock: useImage(imagePaths.notificationUnlock),
    topBar: useImage(imagePaths.topBar),
    iconRandom: useImage(imagePaths.iconRandom),
    iconClose: useImage(imagePaths.iconClose),
    iconEdit: useImage(imagePaths.iconEdit),
    basicButton: useImage(imagePaths.basicButton),
    secondaryButton: useImage(imagePaths.secondaryButton),
    stakingButton: useImage(imagePaths.stakingButton),
    nounsTitleplate: useImage(imagePaths.nounsTitleplate),
    nounsSlots: useImage(imagePaths.nounsSlots),
    nounsTabInactive: useImage(imagePaths.nounsTabInactive),
    nounsTabActive: useImage(imagePaths.nounsTabActive),
    nounsCreatorBg: useImage(imagePaths.nounsCreatorBg),
    nounsCreatorButton: useImage(imagePaths.nounsCreatorButton),
    l2BarsBg: useImage(imagePaths.l2BarsBg),
    l2BarsBar: useImage(imagePaths.l2BarsBar),
    l2BarsPlaque: useImage(imagePaths.l2BarsPlaque),
    txsBorder: useImage(imagePaths.txsBorder),
    txTabActive: useImage(imagePaths.txTabActive),
    txTabInactive: useImage(imagePaths.txTabInactive),
    txButtonBlueEmpty: useImage(imagePaths.txButtonBlueEmpty),
    txButtonGreenEmpty: useImage(imagePaths.txButtonGreenEmpty),
    txButtonPinkEmpty: useImage(imagePaths.txButtonPinkEmpty),
    txButtonPurpleEmpty: useImage(imagePaths.txButtonPurpleEmpty),
    txButtonYellowEmpty: useImage(imagePaths.txButtonYellowEmpty),
    txButtonBlueInner: useImage(imagePaths.txButtonBlueInner),
    txButtonGreenInner: useImage(imagePaths.txButtonGreenInner),
    txButtonPinkInner: useImage(imagePaths.txButtonPinkInner),
    txButtonPurpleInner: useImage(imagePaths.txButtonPurpleInner),
    txButtonYellowInner: useImage(imagePaths.txButtonYellowInner),
    txIconTx: useImage(imagePaths.txIconTx),
    txIconSegwit: useImage(imagePaths.txIconSegwit),
    txIconBlob: useImage(imagePaths.txIconBlob),
    txIconOrdinal: useImage(imagePaths.txIconOrdinal),
    txIconRunes: useImage(imagePaths.txIconRunes),
    txIconBridge: useImage(imagePaths.txIconBridge),
    txIconSwap: useImage(imagePaths.txIconSwap),
    txIconNfts: useImage(imagePaths.txIconNfts),
    txIconOracle: useImage(imagePaths.txIconOracle),
    txIconDao: useImage(imagePaths.txIconDao),
    txIconGmswap: useImage(imagePaths.txIconGmswap),
    txIconArtsea: useImage(imagePaths.txIconArtsea),
    txIconPaave: useImage(imagePaths.txIconPaave),
    txIconHodlee: useImage(imagePaths.txIconHodlee),
    txIconWagmi: useImage(imagePaths.txIconWagmi),
    txIconUnrug: useImage(imagePaths.txIconUnrug),
    txIcon42inch: useImage(imagePaths.txIcon42inch),
    txIconLendme: useImage(imagePaths.txIconLendme),
    txIconGalaxia: useImage(imagePaths.txIconGalaxia),
    txIconJourney: useImage(imagePaths.txIconJourney),
    txNameplateBlue: useImage(imagePaths.txNameplateBlue),
    txNameplateGreen: useImage(imagePaths.txNameplateGreen),
    txNameplatePink: useImage(imagePaths.txNameplatePink),
    txNameplatePurple: useImage(imagePaths.txNameplatePurple),
    txNameplateYellow: useImage(imagePaths.txNameplateYellow),
    txPlaquePlus: useImage(imagePaths.txPlaquePlus),
    txPlaqueMinus: useImage(imagePaths.txPlaqueMinus),
    blockTxBgBlue: useImage(imagePaths.blockTxBgBlue),
    blockTxBgGreen: useImage(imagePaths.blockTxBgGreen),
    blockTxBgPink: useImage(imagePaths.blockTxBgPink),
    blockTxBgPurple: useImage(imagePaths.blockTxBgPurple),
    blockTxBgYellow: useImage(imagePaths.blockTxBgYellow),
    blockTxBgEmpty: useImage(imagePaths.blockTxBgEmpty),
    blockTxIconTx: useImage(imagePaths.blockTxIconTx),
    blockTxIconSegwit: useImage(imagePaths.blockTxIconSegwit),
    blockTxIconBlob: useImage(imagePaths.blockTxIconBlob),
    blockTxIconOrdinal: useImage(imagePaths.blockTxIconOrdinal),
    blockTxIconRunes: useImage(imagePaths.blockTxIconRunes),
    blockTxIconBridge: useImage(imagePaths.blockTxIconBridge),
    blockTxIconSwap: useImage(imagePaths.blockTxIconSwap),
    blockTxIconNfts: useImage(imagePaths.blockTxIconNfts),
    blockTxIconOracle: useImage(imagePaths.blockTxIconOracle),
    blockTxIconDao: useImage(imagePaths.blockTxIconDao),
    blockTxIconGmswap: useImage(imagePaths.blockTxIconGmswap),
    blockTxIconArtsea: useImage(imagePaths.blockTxIconArtsea),
    blockTxIconPaave: useImage(imagePaths.blockTxIconPaave),
    blockTxIconHodlee: useImage(imagePaths.blockTxIconHodlee),
    blockTxIconWagmi: useImage(imagePaths.blockTxIconWagmi),
    blockTxIconUnrug: useImage(imagePaths.blockTxIconUnrug),
    blockTxIcon42inch: useImage(imagePaths.blockTxIcon42inch),
    blockTxIconLendme: useImage(imagePaths.blockTxIconLendme),
    blockTxIconGalaxia: useImage(imagePaths.blockTxIconGalaxia),
    blockTxIconJourney: useImage(imagePaths.blockTxIconJourney),
    blockGrid: useImage(imagePaths.blockGrid),
    blockGridMin: useImage(imagePaths.blockGridMin),
    blockConnector: useImage(imagePaths.blockConnector),

    // Staking
    stakingBg: useImage(imagePaths.stakingBg),
    stakingButtonBg: useImage(imagePaths.stakingButtonBg),
    stakingAmountsBg: useImage(imagePaths.stakingAmountsBg),

    txBackground: useImage(imagePaths.txBackground),
    l2TxBackground: useImage(imagePaths.l2TxBackground),
    navButton: useImage(imagePaths.navButton),
    navButtonActive: useImage(imagePaths.navButtonActive),
    navIconGame: useImage(imagePaths.navIconGame),
    navIconStaking: useImage(imagePaths.navIconStaking),
    navIconShop: useImage(imagePaths.navIconShop),
    navIconFlag: useImage(imagePaths.navIconFlag),
    navIconMedal: useImage(imagePaths.navIconMedal),
    navIconSettings: useImage(imagePaths.navIconSettings),
    navIconGameActive: useImage(imagePaths.navIconGameActive),
    navIconStakingActive: useImage(imagePaths.navIconStakingActive),
    navIconShopActive: useImage(imagePaths.navIconShopActive),
    navIconFlagActive: useImage(imagePaths.navIconFlagActive),
    navIconMedalActive: useImage(imagePaths.navIconMedalActive),
    navIconSettingsActive: useImage(imagePaths.navIconSettingsActive),
    shopBg: useImage(imagePaths.shopBg),
    shopBtc: useImage(imagePaths.shopBtc),
    shopClock: useImage(imagePaths.shopClock),
    shopTitle: useImage(imagePaths.shopTitle),
    shopSeparator: useImage(imagePaths.shopSeparator),
    shopNamePlaque: useImage(imagePaths.shopNamePlaque),
    shopTab: useImage(imagePaths.shopTab),
    shopTabActive: useImage(imagePaths.shopTabActive),
    shopTxBuyButton: useImage(imagePaths.shopTxBuyButton),
    shopAutoBuyButton: useImage(imagePaths.shopAutoBuyButton),
    shopIconBgBlue: useImage(imagePaths.shopIconBgBlue),
    shopIconBgGreen: useImage(imagePaths.shopIconBgGreen),
    shopIconBgPink: useImage(imagePaths.shopIconBgPink),
    shopIconBgPurple: useImage(imagePaths.shopIconBgPurple),
    shopIconBgYellow: useImage(imagePaths.shopIconBgYellow),
    shopLock: useImage(imagePaths.shopLock),
    shopBlockDifficulty: useImage(imagePaths.shopBlockDifficulty),
    shopBlockSize: useImage(imagePaths.shopBlockSize),
    shopBlockReward: useImage(imagePaths.shopBlockReward),
    shopDaComp: useImage(imagePaths.shopDaComp),
    shopMevBoost: useImage(imagePaths.shopMevBoost),
    shopRecursiveProof: useImage(imagePaths.shopRecursiveProof),
    shopAutomationsMinerBase: useImage(imagePaths.shopAutomationsMinerBase),
    shopAutomationsMinerCpu: useImage(imagePaths.shopAutomationsMinerCpu),
    shopAutomationsMinerGpu: useImage(imagePaths.shopAutomationsMinerGpu),
    shopAutomationsMinerAsic: useImage(imagePaths.shopAutomationsMinerAsic),
    shopAutomationsMinerAnt: useImage(imagePaths.shopAutomationsMinerAnt),
    shopAutomationsMinerBitmain: useImage(
      imagePaths.shopAutomationsMinerBitmain,
    ),
    shopAutomationsMinerQuantum: useImage(
      imagePaths.shopAutomationsMinerQuantum,
    ),
    achievmentsBg: useImage(imagePaths.achievmentsBg),
    achievementsTileLocked: useImage(imagePaths.achievementsTileLocked),
    achievementsTileProgress: useImage(imagePaths.achievementsTileProgress),
    achievementsTileAchieved: useImage(imagePaths.achievementsTileAchieved),
    achievementsTitle: useImage(imagePaths.achievementsTitle),
    achievementsTileOverlay: useImage(imagePaths.achievementsTileOverlay),
    achievements100: useImage(imagePaths.achievements100),
    achievements1000: useImage(imagePaths.achievements1000),
    achievementsStake: useImage(imagePaths.achievementsStake),
    achievementsL2: useImage(imagePaths.achievementsL2),
    achievementsMining: useImage(imagePaths.achievementsMining),
    achievementsMoney1: useImage(imagePaths.achievementsMoney1),
    achievementsMoney2: useImage(imagePaths.achievementsMoney2),
    achievementsMoney3: useImage(imagePaths.achievementsMoney3),
    achievmentsMoney4: useImage(imagePaths.achievmentsMoney4),
    achievementsAutomationDa: useImage(imagePaths.achievementsAutomationDa),
    achievementsAutomationStwo: useImage(imagePaths.achievementsAutomationStwo),
    achievmentsAutomationSequencer: useImage(
      imagePaths.achievmentsAutomationSequencer,
    ),
    achievmentsAutomationMiner: useImage(imagePaths.achievmentsAutomationMiner),
    achievementsL1Dapps: useImage(imagePaths.achievementsL1Dapps),
    achievementsL1Transactions: useImage(imagePaths.achievementsL1Transactions),
    achievementsL1Upgrades: useImage(imagePaths.achievementsL1Upgrades),
    achievementsL1Blocks1: useImage(imagePaths.achievementsL1Blocks1),
    achievementsL1Blocks2: useImage(imagePaths.achievementsL1Blocks2),
    achievementsL1Blocks3: useImage(imagePaths.achievementsL1Blocks3),
    achievementsL1Blocks4: useImage(imagePaths.achievementsL1Blocks4),
    achievementsL2Dapps: useImage(imagePaths.achievementsL2Dapps),
    achievementsL2Transactions: useImage(imagePaths.achievementsL2Transactions),
    achievementsL2Upgrades: useImage(imagePaths.achievementsL2Upgrades),
    achievementsL2Blocks1: useImage(imagePaths.achievementsL2Blocks1),
    achievementsL2Blocks2: useImage(imagePaths.achievementsL2Blocks2),
    achievementsL2Blocks3: useImage(imagePaths.achievementsL2Blocks3),
    achievementsL2Blocks4: useImage(imagePaths.achievementsL2Blocks4),
    shopAutomationSequencer0: useImage(imagePaths.shopAutomationsSequencer0),
    shopAutomationSequencer1: useImage(imagePaths.shopAutomationsSequencer1),
    shopAutomationSequencer2: useImage(imagePaths.shopAutomationsSequencer2),
    shopAutomationSequencer3: useImage(imagePaths.shopAutomationsSequencer3),
    shopAutomationSequencer4: useImage(imagePaths.shopAutomationsSequencer4),
    shopAutomationProver0: useImage(imagePaths.shopAutomationsProver0),
    shopAutomationProver1: useImage(imagePaths.shopAutomationsProver1),
    shopAutomationProver2: useImage(imagePaths.shopAutomationsProver2),
    shopAutomationProver3: useImage(imagePaths.shopAutomationsProver3),
    shopAutomationProver4: useImage(imagePaths.shopAutomationsProver4),
    shopAutomationProver5: useImage(imagePaths.shopAutomationsProver5),
    shopAutomationDa0: useImage(imagePaths.shopAutomationsDa0),
    shopAutomationDa1: useImage(imagePaths.shopAutomationsDa1),
    shopAutomationDa2: useImage(imagePaths.shopAutomationsDa2),
    shopAutomationDa3: useImage(imagePaths.shopAutomationsDa3),
    shopAutomationDa4: useImage(imagePaths.shopAutomationsDa4),

    // tutorial
    tutorialArrow: useImage(imagePaths.tutorialArrow),
    tutorialWindow: useImage(imagePaths.tutorialWindow),

    prestige1: useImage(imagePaths.prestige1),
    prestige2: useImage(imagePaths.prestige2),
    prestige3: useImage(imagePaths.prestige3),
    prestige4: useImage(imagePaths.prestige4),
    prestige5: useImage(imagePaths.prestige5),
    prestige6: useImage(imagePaths.prestige6),
    prestige7: useImage(imagePaths.prestige7),
    prestige8: useImage(imagePaths.prestige8),
    prestige9: useImage(imagePaths.prestige9),
    prestige10: useImage(imagePaths.prestige10),
  };

  // Check if all images are loaded
  useEffect(() => {
    const imageValues = Object.values(images);
    const allImagesLoaded = imageValues.every((image) => image !== null);

    if (allImagesLoaded && globalIsLoading) {
      const imagesMap = {
        background: images.background,
        logo: images.logo,
        logoP: images.logoP,
        logoO: images.logoO,
        logoW: images.logoW,
        logoExclamation: images.logoExclamation,
        sublogo: images.sublogo,
        "logo.starknet": images.starknet,
        "background.grid": images.backgroundGrid,
        "background.shop": images.shopBg,
        "background.staking": images.stakingBg,
        header: images.header,
        "header.switch": images.headerSwitch,
        "header.switch.active": images.headerSwitchActive,
        "header.switch.inactive": images.headerSwitchInactive,
        "notif.unlock": images.notificationUnlock,
        "bar.top": images.topBar,
        "icon.random": images.iconRandom,
        "icon.close": images.iconClose,
        "icon.edit": images.iconEdit,
        "button.basic": images.basicButton,
        "button.secondary": images.secondaryButton,
        "staking.button": images.stakingButton,
        "nouns.titleplate": images.nounsTitleplate,
        "nouns.slots": images.nounsSlots,
        "nouns.tab.inactive": images.nounsTabInactive,
        "nouns.tab.active": images.nounsTabActive,
        "nouns.creator.bg": images.nounsCreatorBg,
        "nouns.creator.button": images.nounsCreatorButton,
        "l2.bars.bg": images.l2BarsBg,
        "l2.bars.bar": images.l2BarsBar,
        "l2.bars.plaque": images.l2BarsPlaque,
        "tx.border": images.txsBorder,
        "tx.tab.active": images.txTabActive,
        "tx.tab.inactive": images.txTabInactive,
        "tx.button.bg.blue": images.txButtonBlueEmpty,
        "tx.button.bg.green": images.txButtonGreenEmpty,
        "tx.button.bg.pink": images.txButtonPinkEmpty,
        "tx.button.bg.purple": images.txButtonPurpleEmpty,
        "tx.button.bg.yellow": images.txButtonYellowEmpty,
        "tx.button.inner.blue": images.txButtonBlueInner,
        "tx.button.inner.green": images.txButtonGreenInner,
        "tx.button.inner.pink": images.txButtonPinkInner,
        "tx.button.inner.purple": images.txButtonPurpleInner,
        "tx.button.inner.yellow": images.txButtonYellowInner,
        "tx.icon.tx": images.txIconTx,
        "tx.icon.segwit": images.txIconSegwit,
        "tx.icon.blob": images.txIconBlob,
        "tx.icon.ordinal": images.txIconOrdinal,
        "tx.icon.runes": images.txIconRunes,
        "tx.icon.bridge": images.txIconBridge,
        "tx.icon.swap": images.txIconSwap,
        "tx.icon.nfts": images.txIconNfts,
        "tx.icon.oracle": images.txIconOracle,
        "tx.icon.dao": images.txIconDao,
        "tx.icon.gmswap": images.txIconGmswap,
        "tx.icon.artsea": images.txIconArtsea,
        "tx.icon.paave": images.txIconPaave,
        "tx.icon.hodlee": images.txIconHodlee,
        "tx.icon.wagmi": images.txIconWagmi,
        "tx.icon.unrug": images.txIconUnrug,
        "tx.icon.42inch": images.txIcon42inch,
        "tx.icon.lendme": images.txIconLendme,
        "tx.icon.galaxia": images.txIconGalaxia,
        "tx.icon.journey": images.txIconJourney,
        "tx.nameplate.blue": images.txNameplateBlue,
        "tx.nameplate.green": images.txNameplateGreen,
        "tx.nameplate.pink": images.txNameplatePink,
        "tx.nameplate.purple": images.txNameplatePurple,
        "tx.nameplate.yellow": images.txNameplateYellow,
        "tx.plaque.plus": images.txPlaquePlus,
        "tx.plaque.minus": images.txPlaqueMinus,
        "block.bg.blue": images.blockTxBgBlue,
        "block.bg.green": images.blockTxBgGreen,
        "block.bg.pink": images.blockTxBgPink,
        "block.bg.purple": images.blockTxBgPurple,
        "block.bg.yellow": images.blockTxBgYellow,
        "block.bg.empty": images.blockTxBgEmpty,
        "block.icon.tx": images.blockTxIconTx,
        "block.icon.segwit": images.blockTxIconSegwit,
        "block.icon.blob": images.blockTxIconBlob,
        "block.icon.ordinal": images.blockTxIconOrdinal,
        "block.icon.runes": images.blockTxIconRunes,
        "block.icon.bridge": images.blockTxIconBridge,
        "block.icon.swap": images.blockTxIconSwap,
        "block.icon.nfts": images.blockTxIconNfts,
        "block.icon.oracle": images.blockTxIconOracle,
        "block.icon.dao": images.blockTxIconDao,
        "block.icon.gmswap": images.blockTxIconGmswap,
        "block.icon.artsea": images.blockTxIconArtsea,
        "block.icon.paave": images.blockTxIconPaave,
        "block.icon.hodlee": images.blockTxIconHodlee,
        "block.icon.wagmi": images.blockTxIconWagmi,
        "block.icon.unrug": images.blockTxIconUnrug,
        "block.icon.42inch": images.blockTxIcon42inch,
        "block.icon.lendme": images.blockTxIconLendme,
        "block.icon.galaxia": images.blockTxIconGalaxia,
        "block.icon.journey": images.blockTxIconJourney,
        "block.grid": images.blockGrid,
        "block.grid.min": images.blockGridMin,
        "block.connector": images.blockConnector,
        "tx.bg": images.txBackground,
        "tx.bg.l2": images.l2TxBackground,
        "nav.button": images.navButton,
        "nav.button.active": images.navButtonActive,
        "nav.icon.game": images.navIconGame,
        "nav.icon.staking": images.navIconStaking,
        "nav.icon.shop": images.navIconShop,
        "nav.icon.flag": images.navIconFlag,
        "nav.icon.medal": images.navIconMedal,
        "nav.icon.settings": images.navIconSettings,
        "nav.icon.game.active": images.navIconGameActive,
        "nav.icon.staking.active": images.navIconStakingActive,
        "nav.icon.shop.active": images.navIconShopActive,
        "nav.icon.flag.active": images.navIconFlagActive,
        "nav.icon.medal.active": images.navIconMedalActive,
        "nav.icon.settings.active": images.navIconSettingsActive,
        "shop.btc": images.shopBtc,
        "shop.clock": images.shopClock,
        "shop.title": images.shopTitle,
        "shop.separator": images.shopSeparator,
        "shop.name.plaque": images.shopNamePlaque,
        "shop.tab": images.shopTab,
        "shop.tab.active": images.shopTabActive,
        "shop.tx.buy": images.shopTxBuyButton,
        "shop.auto.buy": images.shopAutoBuyButton,
        "shop.icon.bg.blue": images.shopIconBgBlue,
        "shop.icon.bg.green": images.shopIconBgGreen,
        "shop.icon.bg.pink": images.shopIconBgPink,
        "shop.icon.bg.purple": images.shopIconBgPurple,
        "shop.icon.bg.yellow": images.shopIconBgYellow,
        "shop.lock": images.shopLock,
        "shop.upgrades.blockDifficulty": images.shopBlockDifficulty,
        "shop.upgrades.blockSize": images.shopBlockSize,
        "shop.upgrades.blockReward": images.shopBlockReward,
        "shop.upgrades.daCompression": images.shopDaComp,
        "shop.upgrades.mevBoost": images.shopMevBoost,
        "shop.upgrades.recursiveProving": images.shopRecursiveProof,
        "staking.button.bg": images.stakingButtonBg,
        "staking.amounts.bg": images.stakingAmountsBg,
        "achievements.bg": images.achievmentsBg,
        "achievements.tile.locked": images.achievementsTileLocked,
        "achievements.tile.progress": images.achievementsTileProgress,
        "achievements.tile.achieved": images.achievementsTileAchieved,
        "achievements.tile.overlay": images.achievementsTileOverlay,
        "achievements.title": images.achievementsTitle,
        "achievements.mission.btc.1": images.achievements100,
        "achievements.mission.btc.2": images.achievements1000,
        "achievements.mission.btc.3": images.achievements1000,
        "achievements.mission.btc.4": images.achievmentsMoney4,
        "achievements.stake": images.achievementsStake,
        "achievements.l2": images.achievementsL2,
        "achievements.mission.mine": images.achievementsMining,
        "achievements.prestige": images.prestige1,
        "achievements.prestige.max": images.prestige10,
        "achievements.money.1": images.achievementsMoney1,
        "achievements.money.2": images.achievementsMoney2,
        "achievements.money.3": images.achievementsMoney3,
        "achievements.money.4": images.achievmentsMoney4,
        "achievements.automation.da": images.achievementsAutomationDa,
        "achievements.automation.stwo": images.achievementsAutomationStwo,
        "achievements.automation.sequencer":
          images.achievmentsAutomationSequencer,
        "achievements.automation.miner": images.achievmentsAutomationMiner,
        "achievements.l1.dapps": images.achievementsL1Dapps,
        "achievements.l1.transactions": images.achievementsL1Transactions,
        "achievements.l1.upgrades": images.achievementsL1Upgrades,
        "achievements.l1.blocks.1": images.achievementsL1Blocks1,
        "achievements.l1.blocks.2": images.achievementsL1Blocks2,
        "achievements.l1.blocks.3": images.achievementsL1Blocks3,
        "achievements.l1.blocks.4": images.achievementsL1Blocks4,
        "achievements.l2.dapps": images.achievementsL2Dapps,
        "achievements.l2.transactions": images.achievementsL2Transactions,
        "achievements.l2.upgrades": images.achievementsL2Upgrades,
        "achievements.l2.blocks.1": images.achievementsL2Blocks1,
        "achievements.l2.blocks.2": images.achievementsL2Blocks2,
        "achievements.l2.blocks.3": images.achievementsL2Blocks3,
        "achievements.l2.blocks.4": images.achievementsL2Blocks4,
        ...Array.from({ length: 10 }, (_, i) => ({
          [`prestige.${i + 1}`]:
            images[`prestige${i + 1}` as keyof typeof images],
        })).reduce((acc, obj) => ({ ...acc, ...obj }), {}),
        ...Array.from({ length: 7 }, (_, i) => ({
          [`shop.automation.miner.${i}`]:
            images[
              `shopAutomationsMiner${
                ["Base", "Cpu", "Gpu", "Asic", "Ant", "Bitmain", "Quantum"][i]
              }` as keyof typeof images
            ],
        })).reduce((acc, obj) => ({ ...acc, ...obj }), {}),
        "shop.automation.sequencer.0": images.shopAutomationSequencer0,
        "shop.automation.sequencer.1": images.shopAutomationSequencer1,
        "shop.automation.sequencer.2": images.shopAutomationSequencer2,
        "shop.automation.sequencer.3": images.shopAutomationSequencer3,
        "shop.automation.sequencer.4": images.shopAutomationSequencer4,
        "shop.automation.prover.0": images.shopAutomationProver0,
        "shop.automation.prover.1": images.shopAutomationProver1,
        "shop.automation.prover.2": images.shopAutomationProver2,
        "shop.automation.prover.3": images.shopAutomationProver3,
        "shop.automation.prover.4": images.shopAutomationProver4,
        "shop.automation.prover.5": images.shopAutomationProver5,
        "shop.automation.da.0": images.shopAutomationDa0,
        "shop.automation.da.1": images.shopAutomationDa1,
        "shop.automation.da.2": images.shopAutomationDa2,
        "shop.automation.da.3": images.shopAutomationDa3,
        "shop.automation.da.4": images.shopAutomationDa4,
        "tutorial.arrow": images.tutorialArrow,
        "tutorial.window": images.tutorialWindow,
      };

      globalImages = imagesMap;
      globalIsLoading = false;
      setIsLoading(false);

      subscribers.forEach((callback) => callback());
    }
  }, [images]);

  return { isLoading, images: globalImages };
};

// Hook for components that need to access preloaded images reactively
export const usePreloadedImages = () => {
  const [isLoading, setIsLoading] = useState(globalIsLoading);
  const [images, setImages] = useState(globalImages);

  useEffect(() => {
    const updateState = () => {
      setIsLoading(globalIsLoading);
      setImages(globalImages);
    };
    subscribers.add(updateState);
    updateState();

    return () => {
      subscribers.delete(updateState);
    };
  }, []);

  return { images, isLoading };
};
