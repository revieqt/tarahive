import { StyleSheet, TouchableOpacity } from 'react-native';
import * as ExpoRouter from 'expo-router';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import React, { useEffect, useMemo, useState } from 'react';
import StickyScrollView from '@/shared/components/ui/StickyScrollView';
import Header from '@/shared/components/common/Header';
import { TIcon, TText, TView } from '@/shared/components/ui/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useDoc } from '@/shared/hooks/useDoc';

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
        <TText key={`${block.type}-${blockIndex}`} type="subtitle" style={styles.blockHeading}>
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
        <TView key={`${block.type}-${blockIndex}`} style={styles.listContainer}>
          {(block.items ?? []).map((item: string, index: number) => (
            <TText key={`${item}-${index}`} style={styles.listItem}>
              • {item}
            </TText>
          ))}
        </TView>
      );
    }

    if (block.type === 'note') {
      return (
        <TText key={`${block.type}-${blockIndex}`} style={styles.noteText}>
          {block.text}
        </TText>
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
    <>
      <StickyScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: '3%' }}
        headerAppearOn={200}
        title={title}
        subtitle={isSectionView ? section?.subtitle ?? section?.title : 'Profile'}
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
            <Header title={section?.title ?? title} />
            {section?.subtitle ? <TText style={styles.subtitle}>{section.subtitle}</TText> : null}
            {section?.blocks?.map((block, index) => renderBlock(block, index))}
          </>
        ) : (
          <>
            <Header title={title} />
            {index?.groups?.map((group) => (
              <TView key={group.name} style={styles.groupContainer}>
                <TText type="subtitle">{group.name}</TText>
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
      </StickyScrollView>

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
    </>
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
    opacity: 0.7,
    marginBottom: 16,
  },
  groupContainer: {
    marginTop: 12,
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
  },
  blockText: {
    lineHeight: 22,
    marginBottom: 10,
  },
  listContainer: {
    marginBottom: 10,
    gap: 6,
  },
  listItem: {
    lineHeight: 20,
  },
  noteText: {
    marginVertical: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ccc2',
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