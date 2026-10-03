import React from "react";
import { Linking, Text, View, StyleSheet } from "react-native";
import { TText } from "./Themed";

interface Props {
  children: string;
  fontSize?: number;
}

export const Markdown: React.FC<Props> = ({ children, fontSize = 13 }) => {
  const lines = children.split("\n");

  const renderInline = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>()]+|\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {
      const markdownLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const rawUrl = markdownLink ? null : part.match(/^https?:\/\/[^\s<>()]+$/)?.[0];
      const url = markdownLink?.[2] ?? rawUrl;

      if (url && /^(https?:\/\/|mailto:)/i.test(url)) {
        const label = markdownLink?.[1] ?? url.replace(/[.,!?;:]+$/, '');
        const trailingPunctuation = markdownLink ? '' : url.slice(label.length);

        return (
          <React.Fragment key={index}>
            <TText
              accessibilityRole="link"
              style={[{ fontSize }, styles.link]}
              onPress={() => {
                void Linking.openURL(url.replace(/[.,!?;:]+$/, '')).catch((error) =>
                  console.warn('Unable to open link:', error),
                );
              }}
            >
              {label}
            </TText>
            {trailingPunctuation ? <TText style={{ fontSize }}>{trailingPunctuation}</TText> : null}
          </React.Fragment>
        );
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <TText key={index} style={{fontSize: fontSize, fontWeight: 800}}>
            {part.slice(2, -2)}
          </TText>
        );
      }

    //   if (part.startsWith("*") && part.endsWith("*")) {
    //     return (
    //       <Text key={index} style={styles.italic}>
    //         {part.slice(1, -1)}
    //       </Text>
    //     );
    //   }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <Text key={index} style={styles.code}>
            {part.slice(1, -1)}
          </Text>
        );
      }

      return <TText key={index} style={{fontSize: fontSize}}>
        {part}
      </TText>;
    });
  };

  return (
    <View>
      {lines.map((line, index) => {
        // Heading 1: #
        if (line.startsWith("# ")) {
          return (
            <TText 
              key={index} 
              style={styles.heading1}
            >
              {renderInline(line.slice(2))}
            </TText>
          );
        }

        // Heading 2: ##
        if (line.startsWith("## ")) {
          return (
            <TText 
              key={index} 
              style={styles.heading2}
            >
              {renderInline(line.slice(3))}
            </TText>
          );
        }

        // Heading 3: ###
        if (line.startsWith("### ")) {
          return (
            <TText 
              key={index} 
              style={styles.heading3}
            >
              {renderInline(line.slice(4))}
            </TText>
          );
        }

        // Heading 4: ####
        if (line.startsWith("#### ")) {
          return (
            <TText 
              key={index} 
              style={styles.heading4}
            >
              {renderInline(line.slice(5))}
            </TText>
          );
        }

        // list item
        if (line.startsWith("- ")) {
          return (
            <View key={index} style={styles.listRow}>
              <TText style={styles.bullet}>•</TText>
              <TText style={styles.text}>{renderInline(line.slice(2))}</TText>
            </View>
          );
        }

        return (
          <Text key={index} style={styles.text}>
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'PoppinsBold',
  },
  link: {
    textDecorationLine: 'underline',
  },

  heading1: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
  },

  heading2: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
  },

  heading3: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  heading4: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
  },

  italic: {
    fontStyle: "italic",
  },

  code: {
    fontFamily: "monospace",
    backgroundColor: "#eee",
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  listRow: {
    flexDirection: "row",
    marginVertical: 2,
  },

  bullet: {
    marginRight: 6,
  },
});