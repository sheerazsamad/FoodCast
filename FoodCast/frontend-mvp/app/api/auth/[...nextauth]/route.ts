import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    },
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (profile) {
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.picture
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken
      session.user.id = token.sub
      session.user.email = token.email
      session.user.name = token.name
      session.user.image = token.picture
      return session
    },
    async redirect({ url, baseUrl }) {
      // If coming from signup page, redirect back to signup with step parameter
      if (url.includes('/signup')) {
        return `${baseUrl}/signup?step=details`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: '/signup', // Redirect to our custom signup page
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
