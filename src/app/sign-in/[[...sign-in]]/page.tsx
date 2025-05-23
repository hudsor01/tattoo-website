import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <SignIn 
          routing="hash"
          signUpUrl="/sign-up"
          forceRedirectUrl="/admin"
          fallbackRedirectUrl="/admin"
        />
      </div>
    </div>
  )
}