import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/lib/mongodb'

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, otp } = verifySchema.parse(body)

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('users').findOne({ email, otp })
    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    await db.collection('users').updateOne(
      { email },
      { $set: { isVerified: true }, $unset: { otp: '' } }
    )

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}