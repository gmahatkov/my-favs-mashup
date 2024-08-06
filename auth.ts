import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
    providers: [
        Spotify({
            clientId: process.env.AUTH_SPOTIFY_ID as string,
            clientSecret: process.env.AUTH_SPOTIFY_SECRET as string,
            authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,user-library-read",
        }),
    ],
    callbacks: {
        async jwt({ user, account, token }) {
            if (account && account.provider === "spotify") {
                token.spotify = {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                };
            }
            return token;
        },
        async session({ session, token, user }) {
            // @ts-ignore
            session.spotify = token.spotify;
            return session;
        },
    },

});
