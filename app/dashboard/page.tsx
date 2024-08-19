import dynamic from "next/dynamic";

const AppTrackList = dynamic(() => import("@/components/AppTrackList"), { ssr: false });

export default function DashboardHome () {
    return (
        <div>
            <h1>Dashboard</h1>
            <AppTrackList />
        </div>
    )
}