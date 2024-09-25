import React, { useState } from 'react';
import { SocialIcon } from 'react-social-icons';

import { ClipLoader } from 'react-spinners'; // Import the spinner

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
    <div className="min-h-screen flex flex-col justify-between bg-base-100">
      <main className="container mx-auto py-16 px-4 flex-1">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or want to contribute to Dev Trend? Get in touch with us using the form below or connect with us on social media!
          </p>
        </section>
        <section className="max-w-2xl mx-auto">
          <form className="bg-base-200 p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-secondary">Your Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-secondary">Your Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-secondary">Message</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                className="textarea textarea-bordered w-full"
                rows={5}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Send Message'}
            </button>
            {success && <p className="text-green-500 mt-4">Message sent successfully!</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        </section>
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-secondary">Connect with Us</h2>
          <p className="text-lg text-gray-600 mb-8">
            Follow us on social media to stay updated with the latest articles, news, and more!
          </p>
          <div className="flex justify-center space-x-4">
            <SocialIcon url="https://twitter.com/yourtwitterhandle" fgColor="#ffffff" bgColor="#1DA1F2" />
            <SocialIcon url="https://linkedin.com/in/yourlinkedinhandle" fgColor="#ffffff" bgColor="#0077B5" />
            <SocialIcon url="https://github.com/yourgithubhandle" fgColor="#ffffff" bgColor="#333333" />
            <SocialIcon url="https://facebook.com/yourfacebookhandle" fgColor="#ffffff" bgColor="#3b5998" />
            <SocialIcon url="https://instagram.com/yourinstagramhandle" fgColor="#ffffff" bgColor="#E1306C" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;