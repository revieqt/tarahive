// components/ui/ToastConfig.tsx

import React from "react";
import { TText, TView, TIcon } from "@/components/ui/Themed";
import { View } from "react-native";

import { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  info: ({ text1, text2 }) => (
    <TView
      color='primary'
      style={{
        marginTop: -6,
        width: "94%",
        borderRadius: 15,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderLeftWidth: 4,
        borderColor: "#03AED2",
      }}
    >
      <TIcon name="information" size={24} color="#03AED2" />

      <View style={{ flex: 1 }}>
        <TText style={{ fontSize: 14, fontWeight: "700" }}>
          {text1}
        </TText>

        {!!text2 && (
          <TText style={{opacity: .8}}>
            {text2}
          </TText>
        )}
      </View>
    </TView>
  ),

  warning: ({ text1, text2 }) => (
    <TView
      color='primary'
      style={{
        marginTop: -6,
        width: "94%",
        borderRadius: 15,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderLeftWidth: 4,
        borderColor: "#FFC81E",
      }}
    >
      <TIcon name="information" size={24} color="#FFC81E" />

      <View style={{ flex: 1 }}>
        <TText style={{ fontSize: 14, fontWeight: "700" }}>
          {text1}
        </TText>

        {!!text2 && (
          <TText style={{opacity: .8}}>
            {text2}
          </TText>
        )}
      </View>
    </TView>
  ),

  success: ({ text1, text2 }) => (
    <TView
      color='primary'
      style={{
        marginTop: -6,
        width: "94%",
        borderRadius: 15,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderLeftWidth: 4,
        borderColor: "#22c55e",
      }}
    >
      <TIcon name="check-circle" size={24} color="#22c55e" />

      <View style={{ flex: 1 }}>
        <TText style={{ fontSize: 14, fontWeight: "700" }}>
          {text1}
        </TText>

        {!!text2 && (
          <TText style={{opacity: .8}}>
            {text2}
          </TText>
        )}
      </View>
    </TView>
  ),

  error: ({ text1, text2 }) => (
    <TView
      color='primary'
      style={{
        marginTop: -6,
        width: "94%",
        borderRadius: 15,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderLeftWidth: 4,
        borderColor: "#ef4444",
      }}
    >
      <TIcon name="alert-circle" size={24} color="#ef4444" />

      <View style={{ flex: 1 }}>
        <TText style={{ fontSize: 14, fontWeight: "700" }}>
          {text1}
        </TText>

        {!!text2 && (
          <TText style={{opacity: .8}}>
            {text2}
          </TText>
        )}
      </View>
    </TView>
  ),
};