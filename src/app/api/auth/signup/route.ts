import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import { compare } from 'bcryptjs'

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }
        const client = await clientPromise
        const db = client.db()
        const user = await db.collection('users').findOne({ email: credentials.email })
        if (!user || !user.password) {
          throw new Error('User not found')
        }
        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }
        return { id: user._id.toString(), email: user.email, name: user.name }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }