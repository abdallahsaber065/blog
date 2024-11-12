import React, { useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import { ClipLoader } from 'react-spinners'; // Import the spinner

// Add this social links data array
const socialLinks = [
  { url: 'https://twitter.com/yourtwitterhandle', platform: 'twitter', color: '#1DA1F2' },
  { url: 'https://linkedin.com/in/yourlinkedinhandle', platform: 'linkedin', color: '#0077B5' },
  { url: 'https://github.com/yourgithubhandle', platform: 'github', color: '#333333' },
  { url: 'https://facebook.com/yourfacebookhandle', platform: 'facebook', color: '#3b5998' },
  { url: 'https://instagram.com/yourinstagramhandle', platform: 'instagram', color: '#E1306C' },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true); // Set loading to true

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark">
      <main className="container mx-auto py-8 md:py-16 px-4 flex-1">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-accent dark:text-accentDark mb-4">Contact Us</h1>
          <p className="text-base md:text-lg text-gray dark:text-light max-w-2xl mx-auto px-4">
            Have questions, feedback, or want to contribute to Dev Trend? Get in touch with us using the form below or connect with us on social media!
          </p>
        </section>
        <section className="max-w-2xl mx-auto px-4">
          <form className="bg-light dark:bg-dark p-4 md:p-8 rounded-lg shadow-lg space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-accent dark:text-accentDark">Your Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="input input-bordered w-full bg-light dark:bg-dark text-gray dark:text-light"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-accent dark:text-accentDark">Your Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input input-bordered w-full bg-light dark:bg-dark text-gray dark:text-light"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-accent dark:text-accentDark">Message</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                className="textarea textarea-bordered w-full bg-light dark:bg-dark text-gray dark:text-light"
                rows={5}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-accent dark:btn-accentDark w-full" disabled={loading}>
              {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Send Message'}
            </button>
            {success && <p className="text-green-500 mt-4">Message sent successfully!</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        </section>
        <section className="mt-8 md:mt-16 text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-accent dark:text-accentDark">Connect with Us</h2>
          <p className="text-base md:text-lg text-gray dark:text-light mb-6 md:mb-8">
            Follow us on social media to stay updated with the latest articles, news, and more!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => (
              <SocialIcon
                key={index}
                url={social.url}
                fgColor="#ffffff"
                bgColor={social.color}
                className="transition-transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;