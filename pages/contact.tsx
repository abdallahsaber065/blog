import React, { useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, User, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const socialLinks = [
  { url: 'https://x.com/DevTrend0', color: '#1DA1F2' },
  { url: 'https://www.linkedin.com/in/abdallah-saber065', color: '#0077B5' },
  { url: 'https://github.com/abdallah065', color: '#333333' },
  { url: 'https://www.facebook.com/devtrends', color: '#3b5998' },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false); setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setSuccess(true); setFormData({ name: '', email: '', message: '' }); }
      else { const d = await res.json(); setError(d.error || 'Failed to send message'); }
    } catch { setError('Failed to send message'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-light dark:bg-dark overflow-hidden" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <main className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Decorative blooms for "Gold Bloom" effect */}
        <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-gold/[0.08] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gold/[0.05] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold tracking-wider uppercase mb-5">
              <Mail className="w-3 h-3" />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Contact <span className="text-gold">Us</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Have questions, feedback, or want to contribute? Drop us a message.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-10">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-3"
            >
              <div className="p-8 rounded-2xl bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold" /> Your Name
                    </Label>
                    <Input id="name" type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Enter your name" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold" /> Email Address
                    </Label>
                    <Input id="email" type="email" name="email" value={formData.email}
                      onChange={handleChange} placeholder="Enter your email" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gold" /> Message
                    </Label>
                    <Textarea id="message" name="message" value={formData.message}
                      onChange={handleChange} placeholder="Write your message..." rows={5} required
                      className="resize-none" />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </Button>

                  {success && (
                    <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Message sent successfully! We&apos;ll get back to you soon.
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Social / info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="p-6 rounded-2xl bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark">
                <h3 className="font-display font-bold text-foreground mb-1">Connect with us</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Follow us on social media for the latest articles and updates.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}>
                      <SocialIcon
                        url={s.url}
                        fgColor="#ffffff"
                        bgColor={s.color}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ width: '40px', height: '40px' }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gold/[0.06] border border-gold/20">
                <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" /> Direct Email
                </h3>
                <a href="mailto:contact@devtrend.com" className="text-sm text-gold hover:underline">
                  contact@devtrend.com
                </a>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  We typically respond within 24–48 hours on business days.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;