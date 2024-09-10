import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import withProviderHOC from "@/utils/withProviderHOC";

const AppTrackList = dynamic(() => import("@/components/AppTrackList"), { ssr: false });
const AppSelectedTracks = dynamic(() => import("@/components/AppSelectedTracks"), { ssr: false });
const TrackListProvider = dynamic(() => import("@/providers/TrackListProvider"), { ssr: false });
const AudioPlayerProvider = dynamic(() => import("@/providers/AudioPlayerProvider"), { ssr: false });
const AppMashupPrompt = dynamic(() => import("@/components/AppMashupPrompt"), { ssr: false });
const AppAudioPlayer = dynamic(() => import("@/components/AppAudioPlayer"), { ssr: false });

const DashboardHome: React.FC = () =>
{
    const loading = (<Spinner color={'primary'} />);

    return (
        <div className={'max-w-4xl mx-auto'}>
            <h1 className={'text-4xl mb-6'}>Dashboard</h1>
            <h2 className={'text-3xl mb-5'}>Selected Tracks</h2>
            <div className={'mb-6'}>
                <Suspense fallback={loading}>
                    <AppSelectedTracks/>
                </Suspense>
            </div>
            <div className={'mb-6'}>
                <Suspense fallback={loading}>
                    <AppMashupPrompt/>
                </Suspense>
            </div>
            <h2 className={'text-3xl mb-5'}>Your favorite tracks</h2>
            <div>
                <Suspense fallback={loading}>
                    <AppTrackList/>
                </Suspense>
            </div>
            <AppAudioPlayer />
        </div>
    )
}

export default withProviderHOC([TrackListProvider, AudioPlayerProvider])(DashboardHome);