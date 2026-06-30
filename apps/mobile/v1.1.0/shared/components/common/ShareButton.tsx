import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle} from 'react-native';
import ShareModal from '../modals/ShareModal';

interface ShareButtonProps {
    path?: string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ path = '', children, style }) => {
    const [openShareModal, setOpenShareModal] = React.useState(false);

    return (
        <>
            <TouchableOpacity onPress={() => setOpenShareModal(true)} style={style}>
                {children}
            </TouchableOpacity>

            <ShareModal
                visible={openShareModal}
                path={path}
                onClose={() => setOpenShareModal(false)}
            />
        </>

    );
};

export default ShareButton;
