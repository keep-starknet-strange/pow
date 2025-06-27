import React, { useContext, createContext } from "react";
import { useImage } from "@shopify/react-native-skia";

type ImageProviderType = {
  getImage: (key: string) => ReturnType<typeof useImage>;
};

export const useImageProvider = () => {
  const context = useContext(ImageProviderContext);
  if (!context) {
    throw new Error("useImageProvider must be used within an ImageProvider");
  }
  return context;
};
const ImageProviderContext = createContext<ImageProviderType | undefined>(
  undefined,
);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const assetsPath = "../../assets";
  const unknownImage = useImage(
    require(`${assetsPath}/images/questionMark.png`),
  );

  // Load General Images
  const background = useImage(require(`${assetsPath}/background.png`));
  const backgroundGrid = useImage(require(`${assetsPath}/background-grid.png`));
  const balanceL1 = useImage(require(`${assetsPath}/gui_balance_top_l1.png`));
  const balanceL2 = useImage(require(`${assetsPath}/gui_balance_top_l2.png`));

  // Load Transaction Images
  const txButtonsPath = `${assetsPath}/transactions/backgrounds`;
  const txButtonBlueEmpty = useImage(
    require(`${txButtonsPath}/button_blue_empty.png`),
  );
  const txButtonGreenEmpty = useImage(
    require(`${txButtonsPath}/button_green_empty.png`),
  );
  const txButtonPinkEmpty = useImage(
    require(`${txButtonsPath}/button_pink_empty.png`),
  );
  const txButtonPurpleEmpty = useImage(
    require(`${txButtonsPath}/button_purple_empty.png`),
  );
  const txButtonYellowEmpty = useImage(
    require(`${txButtonsPath}/button_yellow_empty.png`),
  );
  const txButtonBlueInner = useImage(
    require(`${txButtonsPath}/button_blue_inner.png`),
  );
  const txButtonGreenInner = useImage(
    require(`${txButtonsPath}/button_green_inner.png`),
  );
  const txButtonPinkInner = useImage(
    require(`${txButtonsPath}/button_pink_inner.png`),
  );
  const txButtonPurpleInner = useImage(
    require(`${txButtonsPath}/button_purple_inner.png`),
  );
  const txButtonYellowInner = useImage(
    require(`${txButtonsPath}/button_yellow_inner.png`),
  );

  const txIconsPath = `${assetsPath}/transactions/icons`;
  const txIconTx = useImage(require(`${txIconsPath}/icon_tx_lg.png`));
  const txIconBlob = useImage(require(`${txIconsPath}/icon_blob_lg.png`));
  const txIconNft = useImage(require(`${txIconsPath}/icon_nft_lg.png`));
  const txIconBridge = useImage(require(`${txIconsPath}/icon_bridge_lg.png`));
  const txIconDao = useImage(require(`${txIconsPath}/icon_dao_lg.png`));
  const txIconIsa = useImage(require(`${txIconsPath}/icon_isa_lg.png`));
  const txIconRunes = useImage(require(`${txIconsPath}/icon_runes_lg.png`));

  const txIconTxSm = useImage(require(`${txIconsPath}/icon_tx_sm.png`));
  const txIconBlobSm = useImage(require(`${txIconsPath}/icon_blob_sm.png`));
  const txIconNftSm = useImage(require(`${txIconsPath}/icon_nft_sm.png`));
  const txIconBridgeSm = useImage(
    require(`${txIconsPath}/icon_bridge_sm.png`),
  );
  const txIconDaoSm = useImage(require(`${txIconsPath}/icon_dao_sm.png`));
  const txIconIsaSm = useImage(require(`${txIconsPath}/icon_isa_sm.png`));
  const txIconRunesSm = useImage(require(`${txIconsPath}/icon_runes_sm.png`));

  const txNameplatePath = `${assetsPath}/transactions/nameplate`;
  const txNameplateBlue = useImage(
    require(`${txNameplatePath}/nameplate_blue.png`),
  );
  const txNameplateGreen = useImage(
    require(`${txNameplatePath}/nameplate_green.png`),
  );
  const txNameplatePink = useImage(
    require(`${txNameplatePath}/nameplate_pink.png`),
  );
  const txNameplatePurple = useImage(
    require(`${txNameplatePath}/nameplate_purple.png`),
  );
  const txNameplateYellow = useImage(
    require(`${txNameplatePath}/nameplate_yellow.png`),
  );

  const txPlaque = useImage(
    require(`${assetsPath}/transactions/value_plaque.png`),
  );

  // Load Block Images
  const blockTxBgPath = `${assetsPath}/block/backgrounds`;
  const blockTxBgBlue = useImage(
    require(`${blockTxBgPath}/blockchain_block_blue.png`),
  );
  const blockTxBgGreen = useImage(
    require(`${blockTxBgPath}/blockchain_block_green.png`),
  );
  const blockTxBgPink = useImage(
    require(`${blockTxBgPath}/blockchain_block_pink.png`),
  );
  const blockTxBgPurple = useImage(
    require(`${blockTxBgPath}/blockchain_block_purple.png`),
  );
  const blockTxBgYellow = useImage(
    require(`${blockTxBgPath}/blockchain_block_yellow.png`),
  );
  const blockTxBgEmpty = useImage(
    require(`${blockTxBgPath}/blockchain_block_empty.png`),
  );

  const blockTxIconsPath = `${assetsPath}/block/icons`;
  const blockTxIconTx = useImage(require(`${blockTxIconsPath}/icon_tx_sm.png`));
  const blockTxIconBlob = useImage(
    require(`${blockTxIconsPath}/icon_blob_sm.png`),
  );
  const blockTxIconNft = useImage(
    require(`${blockTxIconsPath}/icon_nft_sm.png`),
  );

  const blockGrid = useImage(
    require(`${assetsPath}/block/blockchain_grid.png`),
  );
  const blockGridMin = useImage(
    require(`${assetsPath}/block/blockchain_grid_inactive.png`),
  );
  const blockConnector = useImage(
    require(`${assetsPath}/block/blockchain_grid_chainconnector.png`),
  );

  // Load Navigation Images
  const navPath = `${assetsPath}/navigation`;
  const navBg = useImage(require(`${navPath}/background.png`));
  const navButton = useImage(require(`${navPath}/menu_button_normal.png`));
  const navButtonActive = useImage(
    require(`${navPath}/menu_button_selected.png`),
  );

  const navIconGame = useImage(require(`${navPath}/icon_game.png`));
  const navIconShop = useImage(require(`${navPath}/icon_shop.png`));
  const navIconFlag = useImage(require(`${navPath}/icon_flag.png`));
  const navIconMedal = useImage(require(`${navPath}/icon_medal.png`));
  const navIconSettings = useImage(require(`${navPath}/icon_settings.png`));
  const navIconGameActive = useImage(
    require(`${navPath}/icon_game_selected.png`),
  );
  const navIconShopActive = useImage(
    require(`${navPath}/icon_shop_selected.png`),
  );
  const navIconFlagActive = useImage(
    require(`${navPath}/icon_flag_selected.png`),
  );
  const navIconMedalActive = useImage(
    require(`${navPath}/icon_medal_selected.png`),
  );
  const navIconSettingsActive = useImage(
    require(`${navPath}/icon_settings_selected.png`),
  );

  // Load Shop Images
  const shopPath = `${assetsPath}/shop`;
  const shopBg = useImage(require(`${shopPath}/shop_bg.png`));
  const shopTitle = useImage(require(`${shopPath}/title_bar.png`));
  const shopSeparator = useImage(require(`${shopPath}/shop_line.png`));
  const shopNamePlaque = useImage(require(`${shopPath}/shop_name_plaque.png`));
  const shopTab = useImage(require(`${shopPath}/shop_tab.png`));
  const shopTabActive = useImage(require(`${shopPath}/shop_tab_active.png`));
  const shopTxBuyButton = useImage(require(`${shopPath}/shop_transactions_buy_button.png`));
  const shopAutoBuyButton = useImage(require(`${shopPath}/shop_automation_buy_button.png`));
  const shopIconBg = useImage(require(`${shopPath}/shop_icon_background.png`));
  const shopLock = useImage(require(`${shopPath}/icon_lock.png`));

  const upgradesPath = `${assetsPath}/shop/icons/upgrades`;
  const shopBlockDifficulty = useImage(require(`${upgradesPath}/icon_blockDifficulty.png`));
  const shopBlockSize = useImage(require(`${upgradesPath}/icon_blockSize.png`));
  const shopBlockReward = useImage(require(`${upgradesPath}/icon_blockReward.png`));
  const shopDaComp = useImage(require(`${upgradesPath}/icon_daComp.png`));
  const shopMevBoost = useImage(require(`${upgradesPath}/icon_mevBoost.png`));
  const shopRecursiveProof = useImage(require(`${upgradesPath}/icon_recursiveProof.png`));

  const automationsPath = `${assetsPath}/shop/icons/automations`;
  const shopAutomationsMinerBase = useImage(require(`${automationsPath}/Miner/icon_baseMiner.png`));
  const shopAutomationsMinerCpu = useImage(require(`${automationsPath}/Miner/icon_cpu.png`));
  const shopAutomationsMinerGpu = useImage(require(`${automationsPath}/Miner/icon_mining.png`));
  const shopAutomationsMinerAsic = useImage(require(`${automationsPath}/Miner/icon_asic.png`));
  const shopAutomationsMinerAnt = useImage(require(`${automationsPath}/Miner/icon_antMiner.png`));
  const shopAutomationsMinerBitmain = useImage(require(`${automationsPath}/Miner/icon_bitmain.png`));
  const shopAutomationsMinerQuantum = useImage(require(`${automationsPath}/Miner/icon_quantumMiner.png`));

  // Achievements Images
  const achievementsPath = `${assetsPath}/achievements`;
  const achievmentsBg = useImage(require(`${achievementsPath}/achievements_bg.png`));
  const achievementsTileLocked = useImage(require(`${achievementsPath}/achievements_tile_locked.png`));
  const achievementsTileProgress = useImage(require(`${achievementsPath}/achievements_tile_in_progress.png`));
  const achievementsTileAchieved = useImage(require(`${achievementsPath}/achievements_achieved.png`));
  const achievementsTitle = useImage(require(`${achievementsPath}/achievements_category_plaque.png`));
  const achievementsTileOverlay = useImage(require(`${achievementsPath}/achievements_tile.png`));

  const achievmentsIconsPath = `${assetsPath}/achievements/icons`;
  const achievements100 = useImage(require(`${achievmentsIconsPath}/icon_100.png`));
  const achievements1000 = useImage(require(`${achievmentsIconsPath}/icon_1000.png`));
  const achievementsStake = useImage(require(`${achievmentsIconsPath}/icon_achieveStake.png`));
  const achievementsL2 = useImage(require(`${achievmentsIconsPath}/icon_achieveL2.png`));
  const achievementsMining = useImage(require(`${achievmentsIconsPath}/icon_achieveMining.png`));
  const achievementsMoneyPath = `${achievmentsIconsPath}/Money`;
  const achievementsMoney1 = useImage(require(`${achievementsMoneyPath}/icon_100btc.png`));
  const achievementsMoney2 = useImage(require(`${achievementsMoneyPath}/icon_1000btc.png`));
  const achievementsMoney3 = useImage(require(`${achievementsMoneyPath}/icon_10000btc.png`));
  
  const achievementsAutomationPath = `${achievmentsIconsPath}/Automation`;
  const achievementsAutomationDa = useImage(require(`${achievementsAutomationPath}/icon_achieveDa.png`));
  const achievementsAutomationStwo = useImage(require(`${achievementsAutomationPath}/icon_achieveStwo.png`));

  const achievementsLayerPath = `${achievmentsIconsPath}/Layer1-2`;
  const achievementsL1Dapps = useImage(require(`${achievementsLayerPath}/icon_l1dapps.png`));
  const achievementsL1Transactions = useImage(require(`${achievementsLayerPath}/icon_l1transactions.png`));
  const achievementsL1Upgrades = useImage(require(`${achievementsLayerPath}/icon_l1upgrades.png`));
  const achievementsL1Blocks1 = useImage(require(`${achievementsLayerPath}/icon_l110blocks.png`));
  const achievementsL1Blocks2 = useImage(require(`${achievementsLayerPath}/icon_l1100blocks.png`));
  const achievementsL1Blocks3 = useImage(require(`${achievementsLayerPath}/icon_l11000blocks.png`));
  const achievementsL2Dapps = useImage(require(`${achievementsLayerPath}/icon_l2dapps.png`));
  const achievementsL2Transactions = useImage(require(`${achievementsLayerPath}/icon_l2transactions.png`));
  const achievementsL2Upgrades = useImage(require(`${achievementsLayerPath}/icon_l2upgrades.png`));
  const achievementsL2Blocks1 = useImage(require(`${achievementsLayerPath}/icon_l210blocks.png`));
  const achievementsL2Blocks2 = useImage(require(`${achievementsLayerPath}/icon_l2100blocks.png`));
  const achievementsL2Blocks3 = useImage(require(`${achievementsLayerPath}/icon_l21000blocks.png`));

  // Prestige icons
  const prestigeIconsPath = `${assetsPath}/prestige`;
  const prestige1 = useImage(require(`${prestigeIconsPath}/icon_prestige1.png`));
  const prestige2 = useImage(require(`${prestigeIconsPath}/icon_prestige2.png`));
  const prestige3 = useImage(require(`${prestigeIconsPath}/icon_prestige3.png`));
  const prestige4 = useImage(require(`${prestigeIconsPath}/icon_prestige4.png`));
  const prestige5 = useImage(require(`${prestigeIconsPath}/icon_prestige5.png`));
  const prestige6 = useImage(require(`${prestigeIconsPath}/icon_prestige6.png`));
  const prestige7 = useImage(require(`${prestigeIconsPath}/icon_prestige7.png`));
  const prestige8 = useImage(require(`${prestigeIconsPath}/icon_prestige8.png`));
  const prestige9 = useImage(require(`${prestigeIconsPath}/icon_prestige9.png`));
  const prestige10 = useImage(require(`${prestigeIconsPath}/icon_prestige10.png`));

  const imagesMap: Record<string, ReturnType<typeof useImage>> = {
    "background": background,
    "background.grid": backgroundGrid,
    "background.shop": shopBg,
    "balance.l1": balanceL1,
    "balance.l2": balanceL2,
    "unknown": unknownImage,
    "tx.button.bg.blue": txButtonBlueEmpty,
    "tx.button.bg.green": txButtonGreenEmpty,
    "tx.button.bg.pink": txButtonPinkEmpty,
    "tx.button.bg.purple": txButtonPurpleEmpty,
    "tx.button.bg.yellow": txButtonYellowEmpty,
    "tx.button.inner.blue": txButtonBlueInner,
    "tx.button.inner.green": txButtonGreenInner,
    "tx.button.inner.pink": txButtonPinkInner,
    "tx.button.inner.purple": txButtonPurpleInner,
    "tx.button.inner.yellow": txButtonYellowInner,
    "tx.icon.tx": txIconTx,
    "tx.icon.blob": txIconBlob,
    "tx.icon.nft": txIconNft,
    "tx.icon.bridge": txIconBridge,
    "tx.icon.dao": txIconDao,
    "tx.icon.isa": txIconIsa,
    "tx.icon.runes": txIconRunes,
    "tx.icon.tx.sm": txIconTxSm,
    "tx.icon.blob.sm": txIconBlobSm,
    "tx.icon.nft.sm": txIconNftSm,
    "tx.icon.bridge.sm": txIconBridgeSm,
    "tx.icon.dao.sm": txIconDaoSm,
    "tx.icon.isa.sm": txIconIsaSm,
    "tx.icon.runes.sm": txIconRunesSm,
    "tx.nameplate.blue": txNameplateBlue,
    "tx.nameplate.green": txNameplateGreen,
    "tx.nameplate.pink": txNameplatePink,
    "tx.nameplate.purple": txNameplatePurple,
    "tx.nameplate.yellow": txNameplateYellow,
    "tx.plaque": txPlaque,
    "block.bg.blue": blockTxBgBlue,
    "block.bg.green": blockTxBgGreen,
    "block.bg.pink": blockTxBgPink,
    "block.bg.purple": blockTxBgPurple,
    "block.bg.yellow": blockTxBgYellow,
    "block.bg.empty": blockTxBgEmpty,
    "block.icon.tx": blockTxIconTx,
    "block.icon.blob": blockTxIconBlob,
    "block.icon.nft": blockTxIconNft,
    "block.grid": blockGrid,
    "block.grid.min": blockGridMin,
    "block.connector": blockConnector,
    "nav.bg": navBg,
    "nav.button": navButton,
    "nav.button.active": navButtonActive,
    "nav.icon.game": navIconGame,
    "nav.icon.shop": navIconShop,
    "nav.icon.flag": navIconFlag,
    "nav.icon.medal": navIconMedal,
    "nav.icon.settings": navIconSettings,
    "nav.icon.game.active": navIconGameActive,
    "nav.icon.shop.active": navIconShopActive,
    "nav.icon.flag.active": navIconFlagActive,
    "nav.icon.medal.active": navIconMedalActive,
    "nav.icon.settings.active": navIconSettingsActive,
    "shop.title": shopTitle,
    "shop.separator": shopSeparator,
    "shop.name.plaque": shopNamePlaque,
    "shop.tab": shopTab,
    "shop.tab.active": shopTabActive,
    "shop.tx.buy": shopTxBuyButton,
    "shop.auto.buy": shopAutoBuyButton,
    "shop.tx.bg": shopIconBg,
    "shop.lock": shopLock,
    "shop.upgrades.blockDifficulty": shopBlockDifficulty,
    "shop.upgrades.blockSize": shopBlockSize,
    "shop.upgrades.blockReward": shopBlockReward,
    "shop.upgrades.daComp": shopDaComp,
    "shop.upgrades.mevBoost": shopMevBoost,
    "shop.upgrades.recursiveProof": shopRecursiveProof,
    "shop.automation.miner.0": shopAutomationsMinerBase,
    "shop.automation.miner.1": shopAutomationsMinerCpu,
    "shop.automation.miner.2": shopAutomationsMinerGpu,
    "shop.automation.miner.3": shopAutomationsMinerAsic,
    "shop.automation.miner.4": shopAutomationsMinerAnt,
    "shop.automation.miner.5": shopAutomationsMinerBitmain,
    "shop.automation.miner.6": shopAutomationsMinerQuantum,
    "achievements.bg": achievmentsBg,
    "achievements.tile.locked": achievementsTileLocked,
    "achievements.tile.progress": achievementsTileProgress,
    "achievements.tile.achieved": achievementsTileAchieved,
    "achievements.tile.overlay": achievementsTileOverlay,
    "achievements.title": achievementsTitle,
    "achievements.mission.btc.1": achievements100,
    "achievements.mission.btc.2": achievements1000,
    "achievements.stake": achievementsStake,
    "achievements.l2": achievementsL2,
    "achievements.mission.mine": achievementsMining,
    "achievements.prestige": prestige1,
    "achievements.prestige.max": prestige10,
    "achievements.money.1": achievementsMoney1,
    "achievements.money.2": achievementsMoney2,
    "achievements.money.3": achievementsMoney3,
    "achievements.automation.da": achievementsAutomationDa,
    "achievements.automation.stwo": achievementsAutomationStwo,
    "achievements.l1.dapps": achievementsL1Dapps,
    "achievements.l1.transactions": achievementsL1Transactions,
    "achievements.l1.upgrades": achievementsL1Upgrades,
    "achievements.l1.blocks.1": achievementsL1Blocks1,
    "achievements.l1.blocks.2": achievementsL1Blocks2,
    "achievements.l1.blocks.3": achievementsL1Blocks3,
    "achievements.l2.dapps": achievementsL2Dapps,
    "achievements.l2.transactions": achievementsL2Transactions,
    "achievements.l2.upgrades": achievementsL2Upgrades,
    "achievements.l2.blocks.1": achievementsL2Blocks1,
    "achievements.l2.blocks.2": achievementsL2Blocks2,
    "achievements.l2.blocks.3": achievementsL2Blocks3,
    "prestige.1": prestige1,
    "prestige.2": prestige2,
    "prestige.3": prestige3,
    "prestige.4": prestige4,
    "prestige.5": prestige5,
    "prestige.6": prestige6,
    "prestige.7": prestige7,
    "prestige.8": prestige8,
    "prestige.9": prestige9,
    "prestige.10": prestige10,
  };

  const getImage = (key: string) => {
    const image = imagesMap[key];
    if (image) {
      return image;
    } else {
      console.warn(`Image not found for key: ${key}`);
      return unknownImage;
    }
  };

  return (
    <ImageProviderContext.Provider value={{ getImage }}>
      {children}
    </ImageProviderContext.Provider>
  );
};
