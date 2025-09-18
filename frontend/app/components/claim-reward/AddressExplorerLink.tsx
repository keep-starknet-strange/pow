import React, { useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text, Linking } from "react-native";

type AddressExplorerLinkStyles = {
  linkSlot: any;
  linkWrap: any;
  linkText: any;
  linkDisabled: any;
  validationSlot: any;
  errorInline: any;
};

type Props = {
  address: string;
  network?: string;
  styles: AddressExplorerLinkStyles;
  label?: string;
};

const AddressExplorerLinkComponent: React.FC<Props> = ({
  address,
  network,
  styles,
  label = "View address on Voyager",
}) => {
  const addr = useMemo(() => (address || "").trim(), [address]);
  const isValid = useMemo(() => /^0x[a-fA-F0-9]{63,64}$/.test(addr), [addr]);
  const explorerBase = useMemo(
    () =>
      network === "SN_SEPOLIA"
        ? "https://sepolia.voyager.online"
        : "https://voyager.online",
    [network]
  );

  const handlePress = useCallback(() => {
    if (!isValid) return;
    Linking.openURL(`${explorerBase}/contract/${addr}`);
  }, [isValid, explorerBase, addr]);

  return (
    <>
      <View style={styles.linkSlot}>
        <TouchableOpacity
          style={styles.linkWrap}
          disabled={!isValid}
          onPress={handlePress}
        >
          <Text style={[styles.linkText, !isValid && styles.linkDisabled]}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.validationSlot}>
        {addr.length > 0 && !isValid ? (
          <Text style={styles.errorInline}>Invalid address</Text>
        ) : null}
      </View>
    </>
  );
};

export const AddressExplorerLink = React.memo(AddressExplorerLinkComponent);
