import dynamic from "next/dynamic";

const AppTrackList = dynamic(() => import("@/components/AppTrackList"), { ssr: false });
const TrackListProvider = dynamic(() => import("@/providers/TrackListProvider"), { ssr: false });
const SelectedTracksProvider = dynamic(() => import("@/providers/SelectedTracksProvider"), { ssr: false });

export default function DashboardHome () {
    return (
        <TrackListProvider>
            <SelectedTracksProvider>
                <AppTrackList />
            </SelectedTracksProvider>
        </TrackListProvider>
    )
}