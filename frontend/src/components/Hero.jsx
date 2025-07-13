function Hero() {
  const subtitleOptions = [
    'Find and share high-quality notes to support your peers.',
    'Make studying easier — for you and for someone else.',
    // prettier-ignore
    "Your notes could be someone else’s lifeline.",
    // prettier-ignore
    "Let’s help each other study smarter, not harder.",
    'Catch up, review, and help others do the same.',
    'Study smarter. Share easier.',
    // prettier-ignore
    "You’ve got the notes — we’ve got the platform.",
    // prettier-ignore
    "It’s a good day to help someone pass their midterm.",
    'A better way to study — together.',
    'Contribute what you can. Learn what you need.',
    'Make your effort count — upload and support the community.',
    'Built for students, powered by students.',
    'Helping you pass with other people’s effort.',
    'You took notes? Hero. Legend. Icon.',
    // prettier-ignore
    "Because professors don't always upload the slides.",
    // prettier-ignore
    "Asking for notes is awkward. This isn’t.",
    "Missed your 9am? We've all been there.",
    'Study notes: now with 100% less guilt.',
    'Built for students. Powered by collective stress.',
    // prettier-ignore
    "Notes so good, you’ll think you actually went to class.",
    'Upload notes. Gain karma. Maybe even GPA.',
    'LeBron? Nah. This is the real finals MVP.',
    // prettier-ignore
    "Need coffee? Sorry, we don’t do that. But here’s some notes.",
    'Crowdsourced academic success.',
  ]

  const subtitle =
    subtitleOptions[Math.floor(Math.random() * subtitleOptions.length)]

  // TODO: Add a rotation effect for the subtitle to change every few seconds

  return (
    <>
      <section className="bg-blue-800 font-heading px-4 py-8 sm:px-8 sm:py-12 rounded-lg shadow mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white">Welcome, User!</h1>
          <p className="text-gray-100 mt-2 text-lg">{subtitle}</p>
        </div>
      </section>
    </>
  )
}

export default Hero
