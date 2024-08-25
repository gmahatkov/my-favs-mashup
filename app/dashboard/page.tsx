import dynamic from "next/dynamic";

const AppTrackList = dynamic(() => import("@/components/AppTrackList"), { ssr: false });
const AppSelectedTracks = dynamic(() => import("@/components/AppSelectedTracks"), { ssr: false });
const TrackListProvider = dynamic(() => import("@/providers/TrackListProvider"), { ssr: false });
const AppMashupPrompt = dynamic(() => import("@/components/AppMashupPrompt"), { ssr: false });

export default function DashboardHome () {
    return (
        <div className={'max-w-4xl mx-auto'}>
            <TrackListProvider>
                <h1 className={'text-4xl mb-6'}>Dashboard</h1>
                <h2 className={'text-3xl mb-5'}>Selected Tracks</h2>
                <div className={'mb-6'}>
                    <AppSelectedTracks/>
                </div>
                <div className={'mb-6'}>
                    <AppMashupPrompt/>
                </div>
                <h2 className={'text-3xl mb-5'}>Your favorite tracks</h2>
                <div>
                    <AppTrackList/>
                </div>
            </TrackListProvider>
        </div>
    )
}