import React, { useContext, createContext } from 'react';
import { useImage } from '@shopify/react-native-skia';

type ImageProviderType = {
  getImage: (key: string) => ReturnType<typeof useImage>;
};

export const useImageProvider = () => {
  const context = useContext(ImageProviderContext);
  if (!context) {
    throw new Error('useImageProvider must be used within an ImageProvider');
  }
  return context;
}
const ImageProviderContext = createContext<ImageProviderType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const assetsPath = "../../assets";
  const unknownImage = useImage(require(`${assetsPath}/images/questionMark.png`));

  // Load General Images
  const background = useImage(require(`${assetsPath}/background.png`));
  const backgroundGrid = useImage(require(`${assetsPath}/background-grid.png`));
  const balance = useImage(require(`${assetsPath}/balance.png`));

  // Load Transaction Images 
  const txButtonsPath = `${assetsPath}/transactions/backgrounds`;
  const txButtonBlueEmpty = useImage(require(`${txButtonsPath}/button_blue_empty.png`));
  const txButtonGreenEmpty = useImage(require(`${txButtonsPath}/button_green_empty.png`));
  const txButtonPinkEmpty = useImage(require(`${txButtonsPath}/button_pink_empty.png`));
  const txButtonPurpleEmpty = useImage(require(`${txButtonsPath}/button_purple_empty.png`));
  const txButtonYellowEmpty = useImage(require(`${txButtonsPath}/button_yellow_empty.png`));
  const txButtonBlueInner = useImage(require(`${txButtonsPath}/button_blue_inner.png`));
  const txButtonGreenInner = useImage(require(`${txButtonsPath}/button_green_inner.png`));
  const txButtonPinkInner = useImage(require(`${txButtonsPath}/button_pink_inner.png`));
  const txButtonPurpleInner = useImage(require(`${txButtonsPath}/button_purple_inner.png`));
  const txButtonYellowInner = useImage(require(`${txButtonsPath}/button_yellow_inner.png`));

  const txIconsPath = `${assetsPath}/transactions/icons`;
  const txIconTx = useImage(require(`${txIconsPath}/icon_tx_lg.png`));
  const txIconBlob = useImage(require(`${txIconsPath}/icon_blob_lg.png`));
  const txIconNft = useImage(require(`${txIconsPath}/icon_nft_lg.png`));

  const txNameplatePath = `${assetsPath}/transactions/nameplate`;
  const txNameplateBlue = useImage(require(`${txNameplatePath}/nameplate_blue.png`));
  const txNameplateGreen = useImage(require(`${txNameplatePath}/nameplate_green.png`));
  const txNameplatePink = useImage(require(`${txNameplatePath}/nameplate_pink.png`));
  const txNameplatePurple = useImage(require(`${txNameplatePath}/nameplate_purple.png`));
  const txNameplateYellow = useImage(require(`${txNameplatePath}/nameplate_yellow.png`));

  const txPlaque = useImage(require(`${assetsPath}/transactions/value_plaque.png`));

  // Load Block Images
  const blockTxBgPath = `${assetsPath}/block/backgrounds`;
  const blockTxBgBlue = useImage(require(`${blockTxBgPath}/blockchain_block_blue.png`));
  const blockTxBgGreen = useImage(require(`${blockTxBgPath}/blockchain_block_green.png`));
  const blockTxBgPink = useImage(require(`${blockTxBgPath}/blockchain_block_pink.png`));
  const blockTxBgPurple = useImage(require(`${blockTxBgPath}/blockchain_block_purple.png`));
  const blockTxBgYellow = useImage(require(`${blockTxBgPath}/blockchain_block_yellow.png`));
  const blockTxBgEmpty = useImage(require(`${blockTxBgPath}/blockchain_block_empty.png`));

  const blockTxIconsPath = `${assetsPath}/block/icons`;
  const blockTxIconTx = useImage(require(`${blockTxIconsPath}/icon_tx_sm.png`));
  const blockTxIconBlob = useImage(require(`${blockTxIconsPath}/icon_blob_sm.png`));
  const blockTxIconNft = useImage(require(`${blockTxIconsPath}/icon_nft_sm.png`));

  const blockGrid = useImage(require(`${assetsPath}/block/blockchain_grid.png`));
  const blockGridMin = useImage(require(`${assetsPath}/block/blockchain_grid_inactive.png`));
  const blockConnector = useImage(require(`${assetsPath}/block/blockchain_grid_chainconnector.png`));

  // Load Navigation Images
  const navPath = `${assetsPath}/navigation`;
  const navBg = useImage(require(`${navPath}/background.png`));
  const navButton = useImage(require(`${navPath}/menu_button_normal.png`));
  const navButtonActive = useImage(require(`${navPath}/menu_button_selected.png`));

  const navIconGame = useImage(require(`${navPath}/icon_game.png`));
  const navIconShop = useImage(require(`${navPath}/icon_shop.png`));
  const navIconFlag = useImage(require(`${navPath}/icon_flag.png`));
  const navIconMedal = useImage(require(`${navPath}/icon_medal.png`));
  const navIconSettings = useImage(require(`${navPath}/icon_settings.png`));
  const navIconGameActive = useImage(require(`${navPath}/icon_game_selected.png`));
  const navIconShopActive = useImage(require(`${navPath}/icon_shop_selected.png`));
  const navIconFlagActive = useImage(require(`${navPath}/icon_flag_selected.png`));
  const navIconMedalActive = useImage(require(`${navPath}/icon_medal_selected.png`));
  const navIconSettingsActive = useImage(require(`${navPath}/icon_settings_selected.png`));

  const imagesMap: Record<string, ReturnType<typeof useImage>> = {
    'background': background,
    'background.grid': backgroundGrid,
    'balance': balance,
    'unknown': unknownImage,
    'tx.button.bg.blue': txButtonBlueEmpty,
    'tx.button.bg.green': txButtonGreenEmpty,
    'tx.button.bg.pink': txButtonPinkEmpty,
    'tx.button.bg.purple': txButtonPurpleEmpty,
    'tx.button.bg.yellow': txButtonYellowEmpty,
    'tx.button.inner.blue': txButtonBlueInner,
    'tx.button.inner.green': txButtonGreenInner,
    'tx.button.inner.pink': txButtonPinkInner,
    'tx.button.inner.purple': txButtonPurpleInner,
    'tx.button.inner.yellow': txButtonYellowInner,
    'tx.icon.tx': txIconTx,
    'tx.icon.blob': txIconBlob,
    'tx.icon.nft': txIconNft,
    'tx.nameplate.blue': txNameplateBlue,
    'tx.nameplate.green': txNameplateGreen,
    'tx.nameplate.pink': txNameplatePink,
    'tx.nameplate.purple': txNameplatePurple,
    'tx.nameplate.yellow': txNameplateYellow,
    'tx.plaque': txPlaque,
    'block.bg.blue': blockTxBgBlue,
    'block.bg.green': blockTxBgGreen,
    'block.bg.pink': blockTxBgPink,
    'block.bg.purple': blockTxBgPurple,
    'block.bg.yellow': blockTxBgYellow,
    'block.bg.empty': blockTxBgEmpty,
    'block.icon.tx': blockTxIconTx,
    'block.icon.blob': blockTxIconBlob,
    'block.icon.nft': blockTxIconNft,
    'block.grid': blockGrid,
    'block.grid.min': blockGridMin,
    'block.connector': blockConnector,
    'nav.bg': navBg,
    'nav.button': navButton,
    'nav.button.active': navButtonActive,
    'nav.icon.game': navIconGame,
    'nav.icon.shop': navIconShop,
    'nav.icon.flag': navIconFlag,
    'nav.icon.medal': navIconMedal,
    'nav.icon.settings': navIconSettings,
    'nav.icon.game.active': navIconGameActive,
    'nav.icon.shop.active': navIconShopActive,
    'nav.icon.flag.active': navIconFlagActive,
    'nav.icon.medal.active': navIconMedalActive,
    'nav.icon.settings.active': navIconSettingsActive,
  };
  const getImage = (key: string) => {
    const image = imagesMap[key];
    if (image) {
      return image;
    } else {
      console.warn(`Image not found for key: ${key}`);
      return unknownImage;
    }
  }

  return (
    <ImageProviderContext.Provider value={{ getImage }}>
      {children}
    </ImageProviderContext.Provider>
  );
}
