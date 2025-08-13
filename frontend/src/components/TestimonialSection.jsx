import "./TestimonialSection.css";
import Player from "@vimeo/player";
import React, { useRef, useEffect, useState } from "react";

const TestimonialSection = () => {
  const trackRef = useRef(null);
  const iframeRefs = useRef([]);
  const playersRef = useRef([]);

  const [playingState, setPlayingState] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const videos = [
  {
    id: "video0",
    name: "Mr Rajendran Sakthivel",
    src: "https://player.vimeo.com/video/1103351104?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video1",
    name: "Mrs. Manju",
    src: "https://player.vimeo.com/video/1081228912?h=477900a8cb&title=0&byline=0&portrait=0&badge=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video2",
    name: "Ms Jeslin Sabatini",
    src: "https://player.vimeo.com/video/1084259988?badge=0&title=0&byline=0&portrait=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video3",
    name: "Ms Mohana Sangari",
    src: "https://player.vimeo.com/video/1078787624?h=8817470ba2&title=0&byline=0&portrait=0&badge=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video4",
    name: "Mr Haree Harun",
    src: "https://player.vimeo.com/video/1084259918?badge=0&title=0&byline=0&portrait=0&badge=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video5",
    name: "Mr Vignesh Sivakumar",
    src: "https://player.vimeo.com/video/1090840248?h=0b3a8f1943&title=0&byline=0&portrait=0&badge=0&controls=0&sharing=0&autoplay=0&loop=0"
  },
  {
    id: "video6",
    name: "Mr Neil Issac",
    src: "https://player.vimeo.com/video/1090840047?h=a28c1515af&title=0&byline=0&portrait=0&badge=0&controls=0&sharing=0&autoplay=0&loop=0"
  }
];


  useEffect(() => {
    setPlayingState(Array(videos.length).fill(false));
  }, [videos.length]);

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.matchMedia("(min-width: 1240px)").matches);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Auto-scroll right-to-left when not paused
  useEffect(() => {
    if (!isDesktop) return;
    const track = trackRef.current;
    if (!track) return;

    let animationFrame;
    const speed = 50; // pixels per second
    let last = performance.now();

    const animate = (now) => {
      const delta = now - last;
      if (!isPaused) {
        track.scrollLeft -= (speed * delta) / 1000;
        if (track.scrollLeft <= 0) {
          track.scrollLeft = track.scrollWidth;
        }
      }
      last = now;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isDesktop, isPaused]);

  // Toggle play/pause for individual videos
  const handlePlay = (index) => {
    if (!playersRef.current[index]) {
      playersRef.current[index] = new Player(iframeRefs.current[index]);
    }
    const player = playersRef.current[index];
    if (playingState[index]) player.pause();
    else player.play();

    setPlayingState((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <section className="testimonial-section">
      <div className="text-content">
        <h2><span>Client</span> Testimonials</h2>
        <p>Our Success Stories</p>
      </div>

      <div
        className="testimonial-row"
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {videos.map((video, idx) => (
          <div
            key={video.id}
            className="video-card"
            data-name={video.name}
            onClick={() => handlePlay(idx)}
          >
            <div className="video-overlay"></div>
            <iframe
              ref={(el) => (iframeRefs.current[idx] = el)}
              src={video.src}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              title={`Vimeo ${video.id}`}
            ></iframe>
            {!playingState[idx] && (
              <div
                className="play-button"
                onClick={(e) => { e.stopPropagation(); handlePlay(idx); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
