import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';
import InsightRoll from "@/components/About/InsightRoll";
import { ReactNode } from 'react';

const insights = [
  "20+ Projects Completed",
  "3+ Years of Freelancing",
  "99% Client Satisfaction",
  "20K+ Subscribers",
];

const AboutPage = () => {
  return (
    <main className="flex flex-col items-center justify-between w-full">
      {/* <InsightRoll insights={insights} /> */}

      <div className="min-h-screen bg-light dark:bg-dark py-16 px-4">
        {/* Hero Section */}
        <section className="container mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-accent dark:text-accentDark mb-4">About Dev Trend</h1>
          <p className="text-lg text-gray dark:text-light max-w-2xl mx-auto">
            Dev Trend is your go-to source for the latest in web development, programming, and tech news. Our mission is to empower developers and tech enthusiasts with insightful articles, tutorials, and resources.
          </p>
        </section>

        {/* Our Mission Section */}
        <section className="container mx-auto text-center mb-16">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-accent dark:text-accentDark">Our Mission</h2>
              <p className="text-gray dark:text-light leading-relaxed mb-4">
                At Dev Trend, we believe in sharing knowledge and fostering a community where developers of all levels can learn, grow, and contribute. Our content covers a wide range of topics, from beginner tutorials to advanced tech discussions, ensuring there&apos;s something for everyone.
              </p>
              <Link href="/contact">
                <button className="btn btn-accent dark:btn-accentDark">Contact Us</button>
              </Link>
            </div>
            <div className="flex-1 mt-8 md:mt-0">
              <Image
                src="/static/images/mission.jpg"
                alt="Our Mission"
                width={500}
                height={300}
                className="rounded-lg shadow-lg"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-8 text-accent dark:text-accentDark">Meet Our Team</h2>
          <div className="flex flex-col md:flex-row items-center md:space-x-8 bg-light dark:bg-dark shadow-lg hover:shadow-xl transition-shadow rounded-lg">
            <div className="flex-shrink-0">
              <Image
                src="/static/images/profile.jpg"
                alt="Team Member"
                width={300}
                height={300}
                className="rounded-lg"
              />
            </div>
            <div className="p-4 text-left">
              <h3 className="text-xl font-semibold text-accent dark:text-accentDark">Abdallah Saber</h3>
              <p className="text-gray dark:text-light">Founder & Editor-in-Chief</p>
              <p className="text-sm mt-2 text-gray dark:text-light">
                I am a full-stack developer and tech enthusiast with a passion for building and sharing knowledge. I have been working in the tech industry for over 3 years and have experience in a wide range of technologies, including ML, AI, and Full-Stack Development.
              </p>
              <div className="mt-4 flex space-x-4">
                <SocialIcon url="https://abdallah-saber.vercel.app/" target="_blank" rel="noopener noreferrer" className="mr-4" />
                <SocialIcon url="https://www.linkedin.com/in/abdallah-saber065/" target="_blank" rel="noopener noreferrer" className="mr-4" />
                <SocialIcon url="https://twitter.com/DevTrend0" target="_blank" rel="noopener noreferrer" className="mr-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        {/* <section className="container mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 text-accent">Join Our Community</h2>
        <p className="text-gray max-w-xl mx-auto mb-4">
          Become a part of the Dev Trend community and stay updated with the latest tech news, tutorials, and resources. Join us today and start contributing to the conversation!
        </p>
        <Link href="/signup">
          <button className="btn btn-accent">Register Now</button>
        </Link>
      </section> */}
      </div>
    </main>
  );
};

export default AboutPage;