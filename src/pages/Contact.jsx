import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import authApi from '@/api/authApi';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Contact() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authApi.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl('Dashboard'), { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await base44.functions.invoke('sendContactMessage', formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message sent! We will get back to you shortly.');
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again or email us directly at lifemedsworld@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'We\'ll respond within 24 hours',
    value: 'hello@doseontime.com',
    href: 'mailto:hello@doseontime.com'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Fri from 8am to 6pm',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come say hello',
    value: '123 Health Street, SF, CA',
    href: '#'
  }];





  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-6">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              We'd Love to
              <span className="block bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                Hear from You
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Have questions about Life Meds? Our team is here to help you on your health journey.

            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-600 mb-8">Fill out the form and we'll get back to you within 24 hours.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitted && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-slate-700">Your Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500"
                      disabled={isSubmitting} />

                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500"
                      disabled={isSubmitting} />

                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-slate-700">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    disabled={isSubmitting}>

                    <SelectTrigger className="mt-2 h-12 rounded-xl border-slate-200">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-slate-700">Your Message</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="mt-2 min-h-[150px] rounded-xl border-slate-200 focus:border-sky-500"
                    disabled={isSubmitting} />

                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base disabled:opacity-50">

                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>

            {/* Map / Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative">

              <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl h-full min-h-[400px]">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696ac834a009f7df3923d685/efdeca0f3_portrait-beautiful-happy-senior-woman_329181-25731.jpg"
                  alt="Customer Support"
                  className="w-full h-full object-cover" />

              </div>
            </motion.div>
          </div>
        </div>
      </section>



      <Footer />
    </div>);

}