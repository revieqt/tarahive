import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import * as ExpoRouter from 'expo-router';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import React, { useEffect, useMemo, useState } from 'react';
import StickyScrollView from '@/components/ui/StickyScrollView';
import Header from '@/components/common/Header';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/context/LanguageContext';
import { useDoc } from '@/hooks/shared/useDoc';
import HiveBg from '@/components/common/HiveBg';
import { formatDateToString } from '@/utils/formatDateToString'

type DocsRouteParams = {
  id?: string;
  name?: string;
  section?: string;
};

const getParamValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default function DocsScreen() {
  const params = (ExpoRouter as any).useLocalSearchParams?.() as DocsRouteParams;
  const router = (ExpoRouter as any).useRouter?.();
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const { t } = useLanguage();
  const id = getParamValue(params.id);
  const initialSection = getParamValue(params.section);
  const [selectedSectionId, setSelectedSectionId] = useState(initialSection ?? '');
  const primaryColor = useThemeColor({}, 'primary');
  const { index, section, isLoading, isError, error } = useDoc(id, selectedSectionId || undefined, {
    includeIndex: true,
  });

  useEffect(() => {
    setSelectedSectionId(initialSection ?? '');
  }, [initialSection]);

  const sections = useMemo(
    () =>
      (index?.groups ?? []).flatMap((group) =>
        group.sections.map((sectionItem) => ({
          ...sectionItem,
          groupName: group.name,
        }))
      ),
    [index]
  );

  const activeSectionIndex = sections.findIndex((item) => item.id === selectedSectionId);
  const isSectionView = !!selectedSectionId;
  const title = name ?? index?.name ?? id ?? 'Docs';

  const openSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    router.setParams({ section: sectionId });
  };

  const goToMenu = () => {
    setSelectedSectionId('');
    router.setParams({ section: '' });
  };

  const goToPreviousSection = () => {
    if (activeSectionIndex > 0) {
      openSection(sections[activeSectionIndex - 1].id);
    }
  };

  const goToNextSection = () => {
    if (activeSectionIndex >= 0 && activeSectionIndex < sections.length - 1) {
      openSection(sections[activeSectionIndex + 1].id);
    }
  };

  const renderBlock = (block: any, blockIndex: number) => {
    if (block.type === 'heading') {
      return (
        <TText key={`${block.type}-${blockIndex}`} style={styles.blockHeading}>
          {block.text}
        </TText>
      );
    }

    if (block.type === 'paragraph') {
      return (
        <TText key={`${block.type}-${blockIndex}`} style={styles.blockText}>
          {block.text}
        </TText>
      );
    }

    if (block.type === 'list') {
      return (
        <View key={`${block.type}-${blockIndex}`} style={styles.listContainer}>
          
          {(block.items ?? []).map((item: string, index: number) => (
            <View key={`${item}-${index}`} style={styles.listItem}>
              <TText>•</TText>   
              <TText style={{marginLeft: 6, lineHeight: 20}}>
                {item}
              </TText>
            </View>
          ))}
        </View>
      );
    }

    if (block.type === 'note') {
      return (
        <View key={`${block.type}-${blockIndex}`} style={[styles.noteBlock, { borderColor: accentColor }]}>
          <TIcon name='information' size={20} color={accentColor}/>
          <TText style={{lineHeight: 19 }}>{block.text}</TText>
        </View>
      );
    }

    if (block.type === 'image') {
      return (
        <TText key={`${block.type}-${blockIndex}`} style={styles.imageCaption}>
          {block.caption ?? 'Image'}
        </TText>
      );
    }

    return null;
  };

  return (
    <TView style={{ flex: 1 }}>
      <HiveBg/>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: '3%', paddingBottom: 80 }}
      >
        {isLoading ? (
          <TView style={styles.centeredState}>
            <TText style={styles.stateText}>{t('common.common.loading')}</TText>
          </TView>
        ) : isError ? (
          <TView style={styles.centeredState}>
            <TText style={styles.stateText}>{error instanceof Error ? error.message : 'Unable to load doc content.'}</TText>
          </TView>
        ) : isSectionView ? (
          <>
            <Header title={section?.title ?? title} 
              subtitle={section?.subtitle}
            />
            {section?.blocks?.map((block, index) => renderBlock(block, index))}
          </>
        ) : (
          <>
            {index?.groups?.map((group) => (
              <TView key={group.name} style={styles.groupContainer}>
                <Header
                  title={group.name}
                  subtitle={`${formatDateToString(index.created_on)} (v${index.version})`}
                />
                {group.sections.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.sectionButton}
                    onPress={() => openSection(item.id)}
                  >
                    <TText style={{textDecorationLine: 'underline'}}>{item.title}</TText>
                    <TIcon name="chevron-right" size={15} />
                  </TouchableOpacity>
                ))}
              </TView>
            ))}
          </>
        )}
      </ScrollView>

      {isSectionView && (
        <LinearGradient
          colors={['transparent', primaryColor]}
          style={styles.sectionButtonsContainer}
        >
          <TouchableOpacity
            style={[styles.sideButton, { backgroundColor: primaryColor }]}
            onPress={goToPreviousSection}
            disabled={activeSectionIndex <= 0}
          >
            <TIcon name="chevron-left" size={15} />
            <TText style={{ opacity: 0.7, fontSize: 11 }}>{t('common.common.prev')}</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: primaryColor }]}
            onPress={goToMenu}
          >
            <TText>{section?.title ?? 'Section'}</TText>
            <TText style={{ opacity: 0.5, fontSize: 11 }}>Go back to Menu</TText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, { backgroundColor: primaryColor }]}
            onPress={goToNextSection}
            disabled={activeSectionIndex < 0 || activeSectionIndex >= sections.length - 1}
          >
            <TText style={{ opacity: 0.7, fontSize: 11 }}>{t('common.common.next')}</TText>
            <TIcon name="chevron-right" size={15} />
          </TouchableOpacity>
        </LinearGradient>
      )}
    </TView>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    gap: 8,
  },
  stateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 10,
  },
  groupContainer: {
    gap: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    opacity: 0.7,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc4',
  },
  blockHeading: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc9',
    paddingBottom: 5,
  },
  blockText: {
    lineHeight: 22,
    marginBottom: 10,
  },
  listContainer: {
    marginBottom: 10,
    gap: 6,
    marginLeft: 8
  },
  listItem:{
    flexDirection: 'row'
  },
  noteBlock:{
    padding: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,.6)'
  },
  imageCaption: {
    marginBottom: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  sectionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '3%',
    zIndex: 100,
    flexDirection: 'row',
    gap: 5,
  },
  sideButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ccc4',
    height: 47,
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ccc4',
    height: 47,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});