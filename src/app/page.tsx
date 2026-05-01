import { getPosts } from "@/actions/getPosts";
import FeedGrid from "@/components/shared/FeedGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center pt-16 pb-14 gap-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.08]">
          The Wall of<br />
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Thoughts
          </span>
        </h1>

        <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
          Mau bisikin rahasia, teriak soal mimpi, atau sekadar spill isi hati?{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Tumpahin aja di sini.
          </span>
        </p>
      </div>

      {/* ── Feed ─────────────────────────────────────────── */}
      <FeedGrid posts={posts} />
    </div>
  );
}
