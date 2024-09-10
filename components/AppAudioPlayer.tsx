'use client';

import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Divider, Chip } from "@nextui-org/react";
import {useAudioPlayer, useAudioPlayerDispatch} from "@/providers/AudioPlayerProvider";

type Props = {

}

const AppAudioPlayer: React.FC<Props> = ({  }) =>
{
    const { track, isPlay } = useAudioPlayer();
    const { setTrack, setIsPlay } = useAudioPlayerDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure({
        isOpen: isPlay,
        onClose() {
            setIsPlay(false);
            setTrack(null);
        }
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={'3xl'}
            backdrop={'blur'}
            className={'dark'}
            scrollBehavior={'outside'}
        >
            <ModalContent>
                {
                    (onClose) => (
                        <>
                            <ModalHeader>{ track?.title ?? "Title" }</ModalHeader>
                            <ModalBody>
                                <div className={'container max-w-[1024px] m-auto flex flex-col align-middle'}>
                                    <div className={'flex items-center mb-4'}>
                                        <img src={track?.image_url} className={'mr-4 w-1/5'} alt={track?.title}/>
                                        <audio src={track?.audio_url} controls/>
                                    </div>
                                    <h3 className={'text-2xl mb-4'}>Lyrics</h3>
                                    <pre className={'mb-6'}>{track?.lyric}</pre>
                                    <Divider className={'my-4'}/>
                                    <h3 className={'text-2xl mb-4'}>Prompt</h3>
                                    <p className={'mb-6'}>{track?.gpt_description_prompt}</p>
                                    <Divider className={'my-4'}/>
                                    <h3 className={'text-2xl mb-4'}>Tags</h3>
                                    <div className={'-mx-1'}>{
                                        track?.tags?.split(' ').map((tag) => (
                                            <Chip key={tag} color={'primary'} className={'m-1'}>{tag}</Chip>
                                        ))
                                    }</div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )
                }
            </ModalContent>
        </Modal>
        // <audio src={audioUrl} controls />
    )
}

export default AppAudioPlayer;