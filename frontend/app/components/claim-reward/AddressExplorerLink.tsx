import React from "react";
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

export const AddressExplorerLink: React.FC<Props> = ({
  address,
  network,
  styles,
  label = "View address on Voyager",
}) => {
  const addr = (address || "").trim();
  const isValid = /^0x[a-fA-F0-9]{63,64}$/.test(addr);
  const explorerBase =
    network === "SN_SEPOLIA"
      ? "https://sepolia.voyager.online"
      : "https://voyager.online";

  return (
    <>
      <View style={styles.linkSlot}>
        <TouchableOpacity
          style={styles.linkWrap}
          disabled={!isValid}
          onPress={() => {
            if (!isValid) return;
            Linking.openURL(`${explorerBase}/contract/${addr}`);
          }}
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
