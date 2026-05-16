import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface Props {
  children: string;
  fontSize?: number;
}

export const Markdown: React.FC<Props> = ({ children, fontSize = 13 }) => {
  const lines = children.split("\n");

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <ThemedText key={index} style={{fontSize: fontSize}} type='subtitle'>
            {part.slice(2, -2)}
          </ThemedText>
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

      return <ThemedText key={index} style={{fontSize: fontSize}}>
        {part}
      </ThemedText>;
    });
  };

  return (
    <View>
      {lines.map((line, index) => {
        // Heading 1: #
        if (line.startsWith("# ")) {
          return (
            <ThemedText 
              key={index} 
              style={styles.heading1}
            >
              {renderInline(line.slice(2))}
            </ThemedText>
          );
        }

        // Heading 2: ##
        if (line.startsWith("## ")) {
          return (
            <ThemedText 
              key={index} 
              style={styles.heading2}
            >
              {renderInline(line.slice(3))}
            </ThemedText>
          );
        }

        // Heading 3: ###
        if (line.startsWith("### ")) {
          return (
            <ThemedText 
              key={index} 
              style={styles.heading3}
            >
              {renderInline(line.slice(4))}
            </ThemedText>
          );
        }

        // Heading 4: ####
        if (line.startsWith("#### ")) {
          return (
            <ThemedText 
              key={index} 
              style={styles.heading4}
            >
              {renderInline(line.slice(5))}
            </ThemedText>
          );
        }

        // list item
        if (line.startsWith("- ")) {
          return (
            <View key={index} style={styles.listRow}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.text}>{renderInline(line.slice(2))}</ThemedText>
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