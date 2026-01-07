'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Calendar, MapPin, Users } from 'lucide-react';

const eventSlides = [
  {
    id: 1,
    title: 'Annual Tech Summit 2025',
    description: 'Join us for the biggest technology conference of the year',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    date: 'March 15, 2025',
    location: 'Kolkata Convention Center',
    attendees: '500+',
  },
  {
    id: 2,
    title: 'Digital Innovation Workshop',
    description: 'Learn from industry experts and innovators',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
    date: 'March 20, 2025',
    location: 'Tech Park Auditorium',
    attendees: '300+',
  },
  {
    id: 3,
    title: 'Community Networking Event',
    description: 'Connect with like-minded professionals',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    date: 'March 25, 2025',
    location: 'Business Hub',
    attendees: '200+',
  },
];

export default function EventCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <div className="w-full h-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full">
          {eventSlides.map((slide) => (
            <CarouselItem key={slide.id} className="h-full">
              <Card className="border-0 shadow-lg overflow-hidden h-full">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full min-h-[600px] w-full">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h2 className="text-3xl font-bold mb-3">{slide.title}</h2>
                      <p className="text-lg mb-6 text-gray-200">{slide.description}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">{slide.date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{slide.location}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">{slide.attendees} Attendees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}