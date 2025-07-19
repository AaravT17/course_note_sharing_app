import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { SUBTITLE_ROTATION_INTERVAL_SECONDS } from '../config/constants.js'

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
    'Contribute what you can. Learn what you need.',
    'Make your effort count — upload and support the community.',
    'Give a little help. Get a little back.',
    'Good things happen to those who share notes.',
    // prettier-ignore
    "We're here to help you pass- with other people’s effort.",
    'You took notes? Hero. Legend. Icon.',
    // prettier-ignore
    "Professor didn’t upload the slides? We’ve got you.",
    // prettier-ignore
    "Felt awkward asking for notes? Don’t worry, you don’t have to.",
    'Missed your 9am? We’ve all been there.',
    // prettier-ignore
    "Here’s some notes, now with 100% less guilt.",
    // prettier-ignore
    "We’ve got notes so good, you’ll think you actually went to class.",
    'Upload notes. Gain karma. Maybe even GPA.',
    'LeBron? Nah. You could be the real finals MVP, if you share your notes 👀.',
    // prettier-ignore
    "Need coffee? Sorry, we don’t do that. But here’s some notes.",
    // prettier-ignore
    "You've entered the academic black market.",
  ]

  const { user } = useSelector((state) => state.user)

  const [subtitle, setSubtitle] = useState(
    subtitleOptions[Math.floor(Math.random() * subtitleOptions.length)]
  )

  useEffect(() => {
    console.log('Effect ran: setting up interval')
    const intervalId = setInterval(() => {
      setSubtitle((prevSubtitle) => {
        let newSubtitle =
          subtitleOptions[Math.floor(Math.random() * subtitleOptions.length)]
        while (newSubtitle === prevSubtitle) {
          newSubtitle =
            subtitleOptions[Math.floor(Math.random() * subtitleOptions.length)]
        }
        return newSubtitle
      })
    }, SUBTITLE_ROTATION_INTERVAL_SECONDS * 1000)
    return () => clearInterval(intervalId)
  }, [])

  // TODO: Add a fade out effect for the subtitle change

  return (
    <>
      <section className="bg-blue-800 font-heading px-4 py-8 sm:px-8 sm:py-12 rounded-lg shadow mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome, {user && user.name ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-gray-300 font-heading italic mt-3 text-base">
            {subtitle}
          </p>
        </div>
      </section>
    </>
  )
}

export default Hero
