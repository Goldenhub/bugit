export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-5xl">✉️</div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Check your email</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          A sign-in link has been sent. Click it to continue — it expires in 24 hours.
        </p>
      </div>
    </div>
  );
}
