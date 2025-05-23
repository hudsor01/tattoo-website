import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <SignUp 
          routing="hash"
          signInUrl="/sign-in"
          forceRedirectUrl="/admin"
          fallbackRedirectUrl="/admin"
        />
      </div>
    </div>
  )
}