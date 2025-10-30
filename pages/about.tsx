import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';
import { prisma } from '../lib/prisma';
import { Button } from '@/components/ui/button';

// export async function getStaticProps() {
//   const editors = await prisma.user.findMany({
//     where: {
//       OR: [
//         { role: 'editor' },
//         { role: 'moderator' },
//       ]
//     },
//     select: {
//       id: true,
//       username: true,
//       first_name: true,
//       last_name: true,
//       bio: true,
//       profile_image_url: true,
//     },
//   });

//   return {
//     props: { editors },
//     revalidate: false,
//   };
// }

// interface Editor {
//   id: string;
//   username: string;
//   first_name: string;
//   last_name: string;
//   bio: string;
//   profile_image_url: string | null;
// }

// interface AboutPageProps {
//   editors: Editor[];
// }

const AboutPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-between w-full">
      {/* Hero Section */}
      <div className="min-h-screen bg-light dark:bg-dark py-8 sm:py-16 px-4">
        <section className="container mx-auto text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent dark:text-accentDark mb-4">
            About Dev Trend
          </h1>
          <p className="text-base sm:text-lg text-gray dark:text-light max-w-2xl mx-auto px-4">
            Dev Trend is your go-to source for the latest in web development, programming, and tech news. Our mission is to empower developers and tech enthusiasts with insightful articles, tutorials, and resources.
          </p>
        </section>

        {/* Our Mission Section */}
        <section className="container mx-auto text-center mb-8 sm:mb-16 px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-accent dark:text-accentDark">
                Our Mission
              </h2>
              <p className="text-gray dark:text-light leading-relaxed mb-6">
                At Dev Trend, we believe in sharing knowledge and fostering a community where developers of all levels can learn, grow, and contribute. Our content covers a wide range of topics, from beginner tutorials to advanced tech discussions, ensuring there&apos;s something for everyone.
              </p>
              <Link href="/contact">
                <Button>
                  Contact Us
                </Button>
              </Link>
            </div>
            <div className="flex-1 w-full max-w-md">
              <Image
                src="/static/images/mission.jpg"
                alt="Our Mission"
                width={500}
                height={300}
                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow w-full"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto text-center mb-8 sm:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-accent dark:text-accentDark">
            Meet Our Team
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8 bg-light/50 dark:bg-dark/50 shadow-lg hover:shadow-xl transition-all rounded-xl p-6 backdrop-blur-sm">
            <div className="flex-shrink-0 w-full max-w-[250px]">
              <Image
                src="/static/images/profile.jpg"
                alt="Team Member"
                width={300}
                height={300}
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow w-full"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-4 text-left flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-accent dark:text-accentDark mb-2">
                Abdallah Saber
              </h3>
              <p className="text-gray dark:text-light font-medium mb-3">
                Founder & Editor-in-Chief
              </p>
              <p className="text-sm sm:text-base text-gray dark:text-light mb-6">
                I am a full-stack developer and tech enthusiast with a passion for building and sharing knowledge. I have been working in the tech industry for over 3 years and have experience in a wide range of technologies, including ML, AI, and Full-Stack Development.
              </p>
              <div className="flex space-x-4">
                <SocialIcon
                  url="https://abdallah-saber.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  style={{ width: '35px', height: '35px' }}
                />
                <SocialIcon
                  url="https://www.linkedin.com/in/abdallah-saber065/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  style={{ width: '35px', height: '35px' }}
                />
                <SocialIcon
                  url="https://twitter.com/DevTrend0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  style={{ width: '35px', height: '35px' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Editors Grid Section
        <section className="container mx-auto text-center mb-8 sm:mb-16 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {editors.map((editor) => (
              <div key={editor.id} className="bg-light dark:bg-dark shadow-lg hover:shadow-xl transition-all rounded-xl p-6">
                <Image
                  src={editor.profile_image_url || '/static/images/default-profile.jpg'}
                  alt={`${editor.first_name} ${editor.last_name}`}
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md hover:shadow-lg transition-shadow w-full"
                  style={{ objectFit: "cover" }}
                />
                <Link href={`/authors/${editor.username}`} className="text-xl sm:text-2xl font-semibold text-accent dark:text-accentDark mt-4 block">
                  {editor.first_name} {editor.last_name}
                </Link>
                <p className="text-gray dark:text-light font-medium mb-3">
                  Editor
                </p>
                <p className="text-sm sm:text-base text-gray dark:text-light mb-6">
                  {editor.bio}
                </p>
              </div>
            ))}
          </div>
        </section> */}
      </div>
    </main>
  );
};

export default AboutPage;