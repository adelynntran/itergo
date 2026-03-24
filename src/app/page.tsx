import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="paper-canvas min-h-screen relative overflow-hidden">
      {/* Layered paper background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-[600px] h-[800px] kraft-paper rotate-[-3deg] opacity-60"
          style={{ boxShadow: "4px 6px 20px rgba(0,0,0,0.1)" }}
        />
        <div
          className="absolute top-40 right-20 w-[500px] h-[600px] dotted-paper rotate-[2deg]"
          style={{ boxShadow: "2px 4px 15px rgba(0,0,0,0.08)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📒</span>
            <span className="font-handwriting text-3xl text-ink">itergo</span>
          </div>
          <Link
            href="/login"
            className="sticky-note px-5 py-2 font-handwriting text-lg text-ink-medium hover:rotate-0 transition-transform"
          >
            sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Washi tape */}
            <div className="washi-tape washi-pink absolute -top-3 left-[20%] rotate-[-5deg]" />
            <div className="washi-tape washi-yellow absolute -top-3 right-[25%] rotate-[8deg]" />

            {/* Main paper */}
            <div className="torn-paper lined-paper p-8 pt-16 pb-12">
              {/* Spiral holes */}
              <div className="absolute left-8 top-0 bottom-0 flex flex-col justify-around py-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-ink-light/40 bg-paper-cream"
                  />
                ))}
              </div>

              <div className="ml-12 text-center">
                {/* Tag */}
                <div className="inline-block mb-6">
                  <div className="tag-label font-handwriting text-sm text-ink-medium">
                    <Sparkles size={14} className="inline mr-1" />
                    from &quot;someday&quot; to memories
                  </div>
                </div>

                <h1 className="font-handwriting text-5xl md:text-7xl text-ink leading-tight mb-4">
                  plan trips the way
                  <br />
                  <span className="sketch-underline">friends actually do</span>
                </h1>

                <p className="text-xl text-ink-medium max-w-2xl mx-auto mb-8 leading-relaxed">
                  Stop losing ideas in group chats.{" "}
                  <span className="marker-highlight">From dreaming</span> to
                  planning to traveling to{" "}
                  <span className="marker-pink">remembering</span> &mdash; all in
                  one beautiful place.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="kraft-paper px-8 py-4 font-handwriting text-2xl text-ink rounded-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2"
                  >
                    start planning free
                    <ArrowRight size={24} />
                  </Link>
                  <Link
                    href="/login"
                    className="font-handwriting text-xl text-ink-medium border-b-2 border-dashed border-ink-light pb-1 hover:text-ink transition-colors"
                  >
                    I have an account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Photo collage */}
          <div className="mt-16 relative">
            <div className="flex flex-wrap justify-center gap-6 items-start">
              {[
                {
                  img: "https://images.pexels.com/photos/4205842/pexels-photo-4205842.jpeg?auto=compress&cs=tinysrgb&w=400",
                  label: "Kyoto",
                  rotate: "-5deg",
                },
                {
                  img: "https://images.pexels.com/photos/31786621/pexels-photo-31786621.jpeg?auto=compress&cs=tinysrgb&w=400",
                  label: "Amalfi",
                  rotate: "3deg",
                },
                {
                  img: "https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=400",
                  label: "Cape Town",
                  rotate: "-2deg",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="photo-taped w-48"
                  style={{ transform: `rotate(${card.rotate})` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.img}
                    alt={card.label}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <p className="font-handwriting text-xl text-center mt-2 text-ink-medium">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Decorative sticky note */}
            <div className="absolute -bottom-8 right-10 sticky-note p-3 rotate-[6deg] hidden md:block">
              <p className="font-handwriting text-sm text-ink-medium">
                someday... ✓
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features as sticky notes */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-handwriting text-4xl text-ink mb-2">
              one plan, four moments
            </h2>
            <p className="text-lg text-ink-medium">
              every adventure has a lifecycle
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Dream",
                desc: 'Dump all your "we should go" ideas',
                color: "sticky-note",
                icon: "\u2601\uFE0F",
              },
              {
                title: "Plan",
                desc: "Turn dreams into real itineraries",
                color: "sticky-note-pink",
                icon: "\uD83D\uDCCB",
              },
              {
                title: "Go",
                desc: "Navigate your day, stay on track",
                color: "sticky-note-blue",
                icon: "\uD83E\uDDED",
              },
              {
                title: "Remember",
                desc: "Create a beautiful journal",
                color: "sticky-note-green",
                icon: "\uD83D\uDC9D",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`${feature.color} p-5`}
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i)}deg)`,
                }}
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="font-handwriting text-2xl text-ink mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-xl mx-auto">
          <div className="lined-paper p-8 torn-paper relative">
            <div className="washi-tape absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-2deg]" />
            <div className="text-center">
              <div className="flex justify-center -space-x-3 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-paper bg-paper-aged shadow-md"
                  />
                ))}
              </div>
              <p className="font-handwriting text-2xl text-ink mb-2">
                &quot;finally, an app that gets how friends plan!&quot;
              </p>
              <p className="text-sm text-ink-light">
                built for friend groups who actually follow through
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="kraft-paper p-8 rounded-sm shadow-lg layered-papers">
            <h2 className="font-handwriting text-3xl text-ink mb-4">
              your next adventure starts here
            </h2>
            <Link
              href="/signup"
              className="inline-block bg-ink text-paper-cream px-8 py-3 text-lg rounded-sm hover:bg-ink-medium transition-colors"
            >
              get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-dashed border-paper-kraft">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-ink-light" />
            <span className="font-handwriting text-xl text-ink-medium">
              itergo
            </span>
          </div>
          <p className="text-sm text-ink-light">
            made with love for wanderers
          </p>
        </div>
      </footer>
    </div>
  );
}
