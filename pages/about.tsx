import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Code2, Lightbulb, Users, Zap, ArrowRight } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center w-full bg-light dark:bg-dark overflow-hidden">

      {/* Hero */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-24 pb-28 sm:pt-32 sm:pb-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-[400px] h-[300px] bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold tracking-wider uppercase mb-6"
        >
          <Zap className="w-3 h-3" />
          About DevTrend
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight max-w-3xl"
        >
          Built for{' '}
          <span className="text-gold">developers</span>
          <br />
          by developers
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
        >
          Dev Trend is your essential source for web development, AI engineering, and modern tech -
          providing deep-dive articles, tutorials, and insights that help you ship better software.
        </motion.p>
      </section>

      {/* Stats */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20 sm:pb-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              { value: '50+', label: 'Articles published' },
              { value: '3+', label: 'Years of experience' },
              { value: '10k+', label: 'Monthly readers' },
              { value: '100%', label: 'Open to community' },
            ] as { value: string; label: string }[]
          ).map(({ value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark text-center"
            >
              <span className="text-2xl sm:text-3xl font-display font-bold text-gold">{value}</span>
              <span className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-24 sm:pb-32">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gold" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At Dev Trend, we believe in sharing knowledge and fostering a community where developers of
              all levels can learn, grow, and contribute. Our content spans from beginner tutorials to
              advanced system design discussions.
            </p>
            <ul className="space-y-3">
              {(
                [
                  { icon: Code2, text: 'Practical, production-ready code examples' },
                  { icon: Lightbulb, text: 'AI & emerging tech deep-dives' },
                  { icon: Users, text: 'Community-first, free forever' },
                ] as { icon: React.ElementType; text: string }[]
              ).map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-6 h-6 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-gold" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/contact">
              <Button size="lg" className="gap-2">
                Get in touch <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gold/[0.08] rounded-3xl blur-2xl scale-105 pointer-events-none" />
            <Image
              src="/static/images/mission.webp"
              alt="Our Mission"
              width={600}
              height={400}
              className="relative rounded-2xl w-full object-cover border border-lightBorder dark:border-darkBorder"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-28 sm:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-1 h-8 rounded-full bg-gold" />
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">The Team</h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            A small, focused team obsessed with developer experience and quality content.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65 }}
          className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10 rounded-3xl bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark"
        >
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gold/[0.15] rounded-2xl blur-lg scale-110 pointer-events-none" />
            <Image
              src="/static/images/profile.webp"
              alt="Abdallah Saber"
              width={180}
              height={180}
              className="relative rounded-2xl object-cover w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] border-2 border-gold/30"
            />
          </div>

          <div className="text-center sm:text-left space-y-3 flex-1">
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">Abdallah Saber</h3>
              <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                Founder &amp; Editor-in-Chief
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Full-stack developer and tech enthusiast with a passion for building and sharing knowledge.
              3+ years in the industry, experienced across ML, AI, and modern full-stack engineering.
            </p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <SocialIcon
                url="https://abdallah-saber.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ width: '32px', height: '32px' }}
              />
              <SocialIcon
                url="https://www.linkedin.com/in/abdallah-saber065/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ width: '32px', height: '32px' }}
              />
              <SocialIcon
                url="https://twitter.com/DevTrend0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                style={{ width: '32px', height: '32px' }}
              />
            </div>
          </div>
        </motion.div>
      </section>

    </main>
  );
};

export default AboutPage;
