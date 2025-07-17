import { useImage } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";

const assetsPath = "../../assets";

const imagePaths = {
  // General Images
  background: require(`${assetsPath}/background.png`),
  backgroundGrid: require(`${assetsPath}/background-grid.png`),
  balanceL1: require(`${assetsPath}/gui_balance_top_l1.png`),
  balanceL2: require(`${assetsPath}/gui_balance_top_l2.png`),
  unknownImage: require(`${assetsPath}/images/questionMark.png`),

  // Transaction Images - Backgrounds
  txButtonBlueEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_blue_empty.png`,
  ),
  txButtonGreenEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_green_empty.png`,
  ),
  txButtonPinkEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_pink_empty.png`,
  ),
  txButtonPurpleEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_purple_empty.png`,
  ),
  txButtonYellowEmpty: require(
    `${assetsPath}/transactions/backgrounds/button_yellow_empty.png`,
  ),
  txButtonBlueInner: require(
    `${assetsPath}/transactions/backgrounds/button_blue_inner.png`,
  ),
  txButtonGreenInner: require(
    `${assetsPath}/transactions/backgrounds/button_green_inner.png`,
  ),
  txButtonPinkInner: require(
    `${assetsPath}/transactions/backgrounds/button_pink_inner.png`,
  ),
  txButtonPurpleInner: require(
    `${assetsPath}/transactions/backgrounds/button_purple_inner.png`,
  ),
  txButtonYellowInner: require(
    `${assetsPath}/transactions/backgrounds/button_yellow_inner.png`,
  ),

  // Transaction Images - Icons
  txIconTx: require(`${assetsPath}/transactions/icons/icon_tx_lg.png`),
  txIconBlob: require(`${assetsPath}/transactions/icons/icon_blob_lg.png`),
  txIconNft: require(`${assetsPath}/transactions/icons/icon_nft_lg.png`),
  txIconBridge: require(`${assetsPath}/transactions/icons/icon_bridge_lg.png`),
  txIconDao: require(`${assetsPath}/transactions/icons/icon_dao_lg.png`),
  txIconIsa: require(`${assetsPath}/transactions/icons/icon_isa_lg.png`),
  txIconRunes: require(`${assetsPath}/transactions/icons/icon_runes_lg.png`),
  txIconTxSm: require(`${assetsPath}/transactions/icons/icon_tx_sm.png`),
  txIconBlobSm: require(`${assetsPath}/transactions/icons/icon_blob_sm.png`),
  txIconNftSm: require(`${assetsPath}/transactions/icons/icon_nft_sm.png`),
  txIconBridgeSm: require(
    `${assetsPath}/transactions/icons/icon_bridge_sm.png`,
  ),
  txIconDaoSm: require(`${assetsPath}/transactions/icons/icon_dao_sm.png`),
  txIconIsaSm: require(`${assetsPath}/transactions/icons/icon_isa_sm.png`),
  txIconRunesSm: require(`${assetsPath}/transactions/icons/icon_runes_sm.png`),

  // Transaction Images - Nameplates
  txNameplateBlue: require(
    `${assetsPath}/transactions/nameplate/nameplate_blue.png`,
  ),
  txNameplateGreen: require(
    `${assetsPath}/transactions/nameplate/nameplate_green.png`,
  ),
  txNameplatePink: require(
    `${assetsPath}/transactions/nameplate/nameplate_pink.png`,
  ),
  txNameplatePurple: require(
    `${assetsPath}/transactions/nameplate/nameplate_purple.png`,
  ),
  txNameplateYellow: require(
    `${assetsPath}/transactions/nameplate/nameplate_yellow.png`,
  ),
  txPlaque: require(`${assetsPath}/transactions/value_plaque.png`),

  // Block Images
  blockTxBgBlue: require(
    `${assetsPath}/block/backgrounds/blockchain_block_blue.png`,
  ),
  blockTxBgGreen: require(
    `${assetsPath}/block/backgrounds/blockchain_block_green.png`,
  ),
  blockTxBgPink: require(
    `${assetsPath}/block/backgrounds/blockchain_block_pink.png`,
  ),
  blockTxBgPurple: require(
    `${assetsPath}/block/backgrounds/blockchain_block_purple.png`,
  ),
  blockTxBgYellow: require(
    `${assetsPath}/block/backgrounds/blockchain_block_yellow.png`,
  ),
  blockTxBgEmpty: require(
    `${assetsPath}/block/backgrounds/blockchain_block_empty.png`,
  ),
  blockTxIconTx: require(`${assetsPath}/block/icons/icon_tx_sm.png`),
  blockTxIconBlob: require(`${assetsPath}/block/icons/icon_blob_sm.png`),
  blockTxIconNft: require(`${assetsPath}/block/icons/icon_nft_sm.png`),
  blockGrid: require(`${assetsPath}/block/blockchain_grid.png`),
  blockGridMin: require(`${assetsPath}/block/blockchain_grid_inactive.png`),
  blockConnector: require(
    `${assetsPath}/block/blockchain_grid_chainconnector.png`,
  ),

  // Staking
  stakingBg: require(`${assetsPath}/staking/staking_bg.png`),
  stakingButtonBg: require(`${assetsPath}/staking/button.png`),
  stakingAmountsBg: require(`${assetsPath}/staking/staking_amounts_bg.png`),

  // Navigation Images
  navBg: require(`${assetsPath}/navigation/background.png`),
  navButton: require(`${assetsPath}/navigation/menu_button_normal.png`),
  navButtonActive: require(`${assetsPath}/navigation/menu_button_selected.png`),
  navIconGame: require(`${assetsPath}/navigation/icon_game.png`),
  navIconShop: require(`${assetsPath}/navigation/icon_shop.png`),
  navIconFlag: require(`${assetsPath}/navigation/icon_flag.png`),
  navIconMedal: require(`${assetsPath}/navigation/icon_medal.png`),
  navIconSettings: require(`${assetsPath}/navigation/icon_settings.png`),
  navIconGameActive: require(`${assetsPath}/navigation/icon_game_selected.png`),
  navIconShopActive: require(`${assetsPath}/navigation/icon_shop_selected.png`),
  navIconFlagActive: require(`${assetsPath}/navigation/icon_flag_selected.png`),
  navIconStaking: require(`${assetsPath}/navigation/icon_staking.png`),
  navIconStakingActive: require(
    `${assetsPath}/navigation/icon_staking_selected.png`,
  ),
  navIconMedalActive: require(
    `${assetsPath}/navigation/icon_medal_selected.png`,
  ),
  navIconSettingsActive: require(
    `${assetsPath}/navigation/icon_settings_selected.png`,
  ),

  // Shop Images
  shopBg: require(`${assetsPath}/shop/shop_bg.png`),
  shopTitle: require(`${assetsPath}/shop/title_bar.png`),
  shopSeparator: require(`${assetsPath}/shop/shop_line.png`),
  shopNamePlaque: require(`${assetsPath}/shop/shop_name_plaque.png`),
  shopTab: require(`${assetsPath}/shop/shop_tab.png`),
  shopTabActive: require(`${assetsPath}/shop/shop_tab_active.png`),
  shopTxBuyButton: require(
    `${assetsPath}/shop/shop_transactions_buy_button.png`,
  ),
  shopAutoBuyButton: require(
    `${assetsPath}/shop/shop_automation_buy_button.png`,
  ),
  shopIconBg: require(`${assetsPath}/shop/shop_icon_background.png`),
  shopLock: require(`${assetsPath}/shop/icon_lock.png`),

  // Shop Upgrades
  shopBlockDifficulty: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockDifficulty.png`,
  ),
  shopBlockSize: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockSize.png`,
  ),
  shopBlockReward: require(
    `${assetsPath}/shop/icons/upgrades/icon_blockReward.png`,
  ),
  shopDaComp: require(`${assetsPath}/shop/icons/upgrades/icon_daComp.png`),
  shopMevBoost: require(`${assetsPath}/shop/icons/upgrades/icon_mevBoost.png`),
  shopRecursiveProof: require(
    `${assetsPath}/shop/icons/upgrades/icon_recursiveProof.png`,
  ),

  // Shop Automations
  shopAutomationsMinerBase: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_baseMiner.png`,
  ),
  shopAutomationsMinerCpu: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_cpu.png`,
  ),
  shopAutomationsMinerGpu: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_mining.png`,
  ),
  shopAutomationsMinerAsic: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_asic.png`,
  ),
  shopAutomationsMinerAnt: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_antMiner.png`,
  ),
  shopAutomationsMinerBitmain: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_bitmain.png`,
  ),
  shopAutomationsMinerQuantum: require(
    `${assetsPath}/shop/icons/automations/Miner/icon_quantumMiner.png`,
  ),

  // Achievement Images
  achievmentsBg: require(`${assetsPath}/achievements/achievements_bg.png`),
  achievementsTileLocked: require(
    `${assetsPath}/achievements/achievements_tile_locked.png`,
  ),
  achievementsTileProgress: require(
    `${assetsPath}/achievements/achievements_tile_in_progress.png`,
  ),
  achievementsTileAchieved: require(
    `${assetsPath}/achievements/achievements_achieved.png`,
  ),
  achievementsTitle: require(
    `${assetsPath}/achievements/achievements_category_plaque.png`,
  ),
  achievementsTileOverlay: require(
    `${assetsPath}/achievements/achievements_tile.png`,
  ),
  achievements100: require(`${assetsPath}/achievements/icons/icon_100.png`),
  achievements1000: require(`${assetsPath}/achievements/icons/icon_1000.png`),
  achievementsStake: require(
    `${assetsPath}/achievements/icons/icon_achieveStake.png`,
  ),
  achievementsL2: require(
    `${assetsPath}/achievements/icons/icon_achieveL2.png`,
  ),
  achievementsMining: require(
    `${assetsPath}/achievements/icons/icon_achieveMining.png`,
  ),
  achievementsMoney1: require(
    `${assetsPath}/achievements/icons/Money/icon_100btc.png`,
  ),
  achievementsMoney2: require(
    `${assetsPath}/achievements/icons/Money/icon_1000btc.png`,
  ),
  achievementsMoney3: require(
    `${assetsPath}/achievements/icons/Money/icon_10000btc.png`,
  ),
  achievementsAutomationDa: require(
    `${assetsPath}/achievements/icons/Automation/icon_achieveDa.png`,
  ),
  achievementsAutomationStwo: require(
    `${assetsPath}/achievements/icons/Automation/icon_achieveStwo.png`,
  ),
  achievementsL1Dapps: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1dapps.png`,
  ),
  achievementsL1Transactions: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1transactions.png`,
  ),
  achievementsL1Upgrades: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1upgrades.png`,
  ),
  achievementsL1Blocks1: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l110blocks.png`,
  ),
  achievementsL1Blocks2: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l1100blocks.png`,
  ),
  achievementsL1Blocks3: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l11000blocks.png`,
  ),
  achievementsL2Dapps: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2dapps.png`,
  ),
  achievementsL2Transactions: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2transactions.png`,
  ),
  achievementsL2Upgrades: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2upgrades.png`,
  ),
  achievementsL2Blocks1: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l210blocks.png`,
  ),
  achievementsL2Blocks2: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l2100blocks.png`,
  ),
  achievementsL2Blocks3: require(
    `${assetsPath}/achievements/icons/Layer1-2/icon_l21000blocks.png`,
  ),

  // Prestige Icons
  prestige1: require(`${assetsPath}/prestige/icon_prestige1.png`),
  prestige2: require(`${assetsPath}/prestige/icon_prestige2.png`),
  prestige3: require(`${assetsPath}/prestige/icon_prestige3.png`),
  prestige4: require(`${assetsPath}/prestige/icon_prestige4.png`),
  prestige5: require(`${assetsPath}/prestige/icon_prestige5.png`),
  prestige6: require(`${assetsPath}/prestige/icon_prestige6.png`),
  prestige7: require(`${assetsPath}/prestige/icon_prestige7.png`),
  prestige8: require(`${assetsPath}/prestige/icon_prestige8.png`),
  prestige9: require(`${assetsPath}/prestige/icon_prestige9.png`),
  prestige10: require(`${assetsPath}/prestige/icon_prestige10.png`),
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
    // General Images
    background: useImage(imagePaths.background),
    backgroundGrid: useImage(imagePaths.backgroundGrid),
    balanceL1: useImage(imagePaths.balanceL1),
    balanceL2: useImage(imagePaths.balanceL2),
    unknownImage: useImage(imagePaths.unknownImage),

    // Transaction Images - Backgrounds
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

    // Transaction Images - Icons
    txIconTx: useImage(imagePaths.txIconTx),
    txIconBlob: useImage(imagePaths.txIconBlob),
    txIconNft: useImage(imagePaths.txIconNft),
    txIconBridge: useImage(imagePaths.txIconBridge),
    txIconDao: useImage(imagePaths.txIconDao),
    txIconIsa: useImage(imagePaths.txIconIsa),
    txIconRunes: useImage(imagePaths.txIconRunes),
    txIconTxSm: useImage(imagePaths.txIconTxSm),
    txIconBlobSm: useImage(imagePaths.txIconBlobSm),
    txIconNftSm: useImage(imagePaths.txIconNftSm),
    txIconBridgeSm: useImage(imagePaths.txIconBridgeSm),
    txIconDaoSm: useImage(imagePaths.txIconDaoSm),
    txIconIsaSm: useImage(imagePaths.txIconIsaSm),
    txIconRunesSm: useImage(imagePaths.txIconRunesSm),

    // Transaction Images - Nameplates
    txNameplateBlue: useImage(imagePaths.txNameplateBlue),
    txNameplateGreen: useImage(imagePaths.txNameplateGreen),
    txNameplatePink: useImage(imagePaths.txNameplatePink),
    txNameplatePurple: useImage(imagePaths.txNameplatePurple),
    txNameplateYellow: useImage(imagePaths.txNameplateYellow),
    txPlaque: useImage(imagePaths.txPlaque),

    // Block Images
    blockTxBgBlue: useImage(imagePaths.blockTxBgBlue),
    blockTxBgGreen: useImage(imagePaths.blockTxBgGreen),
    blockTxBgPink: useImage(imagePaths.blockTxBgPink),
    blockTxBgPurple: useImage(imagePaths.blockTxBgPurple),
    blockTxBgYellow: useImage(imagePaths.blockTxBgYellow),
    blockTxBgEmpty: useImage(imagePaths.blockTxBgEmpty),
    blockTxIconTx: useImage(imagePaths.blockTxIconTx),
    blockTxIconBlob: useImage(imagePaths.blockTxIconBlob),
    blockTxIconNft: useImage(imagePaths.blockTxIconNft),
    blockGrid: useImage(imagePaths.blockGrid),
    blockGridMin: useImage(imagePaths.blockGridMin),
    blockConnector: useImage(imagePaths.blockConnector),

    // Staking
    stakingBg: useImage(imagePaths.stakingBg),
    stakingButtonBg: useImage(imagePaths.stakingButtonBg),
    stakingAmountsBg: useImage(imagePaths.stakingAmountsBg),

    // Navigation Images
    navBg: useImage(imagePaths.navBg),
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

    // Shop Images
    shopBg: useImage(imagePaths.shopBg),
    shopTitle: useImage(imagePaths.shopTitle),
    shopSeparator: useImage(imagePaths.shopSeparator),
    shopNamePlaque: useImage(imagePaths.shopNamePlaque),
    shopTab: useImage(imagePaths.shopTab),
    shopTabActive: useImage(imagePaths.shopTabActive),
    shopTxBuyButton: useImage(imagePaths.shopTxBuyButton),
    shopAutoBuyButton: useImage(imagePaths.shopAutoBuyButton),
    shopIconBg: useImage(imagePaths.shopIconBg),
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

    // Achievement Images
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
    achievementsAutomationDa: useImage(imagePaths.achievementsAutomationDa),
    achievementsAutomationStwo: useImage(imagePaths.achievementsAutomationStwo),
    achievementsL1Dapps: useImage(imagePaths.achievementsL1Dapps),
    achievementsL1Transactions: useImage(imagePaths.achievementsL1Transactions),
    achievementsL1Upgrades: useImage(imagePaths.achievementsL1Upgrades),
    achievementsL1Blocks1: useImage(imagePaths.achievementsL1Blocks1),
    achievementsL1Blocks2: useImage(imagePaths.achievementsL1Blocks2),
    achievementsL1Blocks3: useImage(imagePaths.achievementsL1Blocks3),
    achievementsL2Dapps: useImage(imagePaths.achievementsL2Dapps),
    achievementsL2Transactions: useImage(imagePaths.achievementsL2Transactions),
    achievementsL2Upgrades: useImage(imagePaths.achievementsL2Upgrades),
    achievementsL2Blocks1: useImage(imagePaths.achievementsL2Blocks1),
    achievementsL2Blocks2: useImage(imagePaths.achievementsL2Blocks2),
    achievementsL2Blocks3: useImage(imagePaths.achievementsL2Blocks3),

    // Prestige Icons
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
        "background.grid": images.backgroundGrid,
        "background.shop": images.shopBg,
        "background.staking": images.stakingBg,
        "balance.l1": images.balanceL1,
        "balance.l2": images.balanceL2,
        unknown: images.unknownImage,
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
        "tx.icon.blob": images.txIconBlob,
        "tx.icon.nft": images.txIconNft,
        "tx.icon.bridge": images.txIconBridge,
        "tx.icon.dao": images.txIconDao,
        "tx.icon.isa": images.txIconIsa,
        "tx.icon.runes": images.txIconRunes,
        "tx.icon.tx.sm": images.txIconTxSm,
        "tx.icon.blob.sm": images.txIconBlobSm,
        "tx.icon.nft.sm": images.txIconNftSm,
        "tx.icon.bridge.sm": images.txIconBridgeSm,
        "tx.icon.dao.sm": images.txIconDaoSm,
        "tx.icon.isa.sm": images.txIconIsaSm,
        "tx.icon.runes.sm": images.txIconRunesSm,
        "tx.nameplate.blue": images.txNameplateBlue,
        "tx.nameplate.green": images.txNameplateGreen,
        "tx.nameplate.pink": images.txNameplatePink,
        "tx.nameplate.purple": images.txNameplatePurple,
        "tx.nameplate.yellow": images.txNameplateYellow,
        "tx.plaque": images.txPlaque,
        "block.bg.blue": images.blockTxBgBlue,
        "block.bg.green": images.blockTxBgGreen,
        "block.bg.pink": images.blockTxBgPink,
        "block.bg.purple": images.blockTxBgPurple,
        "block.bg.yellow": images.blockTxBgYellow,
        "block.bg.empty": images.blockTxBgEmpty,
        "block.icon.tx": images.blockTxIconTx,
        "block.icon.blob": images.blockTxIconBlob,
        "block.icon.nft": images.blockTxIconNft,
        "block.grid": images.blockGrid,
        "block.grid.min": images.blockGridMin,
        "block.connector": images.blockConnector,
        "nav.bg": images.navBg,
        "nav.button": images.navButton,
        "nav.button.active": images.navButtonActive,
        "nav.icon.game": images.navIconGame,
        "nav.icon.shop": images.navIconShop,
        "nav.icon.flag": images.navIconFlag,
        "nav.icon.medal": images.navIconMedal,
        "nav.icon.settings": images.navIconSettings,
        "nav.icon.staking": images.navIconStaking,
        "nav.icon.game.active": images.navIconGameActive,
        "nav.icon.shop.active": images.navIconShopActive,
        "nav.icon.flag.active": images.navIconFlagActive,
        "nav.icon.medal.active": images.navIconMedalActive,
        "nav.icon.settings.active": images.navIconSettingsActive,
        "nav.icon.staking.active": images.navIconStakingActive,
        "shop.title": images.shopTitle,
        "shop.separator": images.shopSeparator,
        "shop.name.plaque": images.shopNamePlaque,
        "shop.tab": images.shopTab,
        "shop.tab.active": images.shopTabActive,
        "shop.tx.buy": images.shopTxBuyButton,
        "shop.auto.buy": images.shopAutoBuyButton,
        "shop.tx.bg": images.shopIconBg,
        "shop.lock": images.shopLock,
        "shop.upgrades.blockDifficulty": images.shopBlockDifficulty,
        "shop.upgrades.blockSize": images.shopBlockSize,
        "shop.upgrades.blockReward": images.shopBlockReward,
        "shop.upgrades.daComp": images.shopDaComp,
        "shop.upgrades.mevBoost": images.shopMevBoost,
        "shop.upgrades.recursiveProof": images.shopRecursiveProof,
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
        "achievements.stake": images.achievementsStake,
        "achievements.l2": images.achievementsL2,
        "achievements.mission.mine": images.achievementsMining,
        "achievements.prestige": images.prestige1,
        "achievements.prestige.max": images.prestige10,
        "achievements.money.1": images.achievementsMoney1,
        "achievements.money.2": images.achievementsMoney2,
        "achievements.money.3": images.achievementsMoney3,
        "achievements.automation.da": images.achievementsAutomationDa,
        "achievements.automation.stwo": images.achievementsAutomationStwo,
        "achievements.l1.dapps": images.achievementsL1Dapps,
        "achievements.l1.transactions": images.achievementsL1Transactions,
        "achievements.l1.upgrades": images.achievementsL1Upgrades,
        "achievements.l1.blocks.1": images.achievementsL1Blocks1,
        "achievements.l1.blocks.2": images.achievementsL1Blocks2,
        "achievements.l1.blocks.3": images.achievementsL1Blocks3,
        "achievements.l2.dapps": images.achievementsL2Dapps,
        "achievements.l2.transactions": images.achievementsL2Transactions,
        "achievements.l2.upgrades": images.achievementsL2Upgrades,
        "achievements.l2.blocks.1": images.achievementsL2Blocks1,
        "achievements.l2.blocks.2": images.achievementsL2Blocks2,
        "achievements.l2.blocks.3": images.achievementsL2Blocks3,
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
