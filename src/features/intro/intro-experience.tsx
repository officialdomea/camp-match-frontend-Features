import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Check, MapPin, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import listingOne from "@/assets/listing-1.jpg";
import listingTwo from "@/assets/listing-2.jpg";
import listingThree from "@/assets/listing-3.jpg";
import listingFour from "@/assets/listing-4.jpg";
import listingFive from "@/assets/listing-5.jpg";
import { Button } from "@/components/ui/button";
import { markIntroCompleted } from "./persistence";
import "./intro-experience.css";

const slides = [
  {
    eyebrow: "FOR STUDENTS",
    headline: "Your next chapter starts here.",
    copy: "Discover student-friendly accommodation, explore properties around your university, and find a place that feels right for you.",
    image: listingOne,
    imageAlt: "Bright student room with a study desk and a single bed",
  },
  {
    eyebrow: "FOR HOUSE SCOUTS",
    headline: "Local knowledge. Real opportunities.",
    copy: "Help students discover suitable accommodation by connecting them with properties in the areas you know.",
    image: listingTwo,
    imageAlt: "Apartment building in a leafy residential neighbourhood",
  },
  {
    eyebrow: "FOR PROPERTY OWNERS",
    headline: "Your properties. Your control.",
    copy: "Showcase your accommodation, manage availability, and connect with students searching for their next home.",
    image: listingThree,
    imageAlt: "Welcoming shared living room with natural light",
  },
  {
    eyebrow: "ROOMMATE MATCHING",
    headline: "Better living starts with compatibility.",
    copy: "Explore potential roommates based on housing preferences, budget, location, and shared living expectations.",
    image: listingFour,
    imageAlt: "Neat shared student room with two beds and a study desk",
  },
  {
    eyebrow: "WELCOME TO CAMP MATCH",
    headline: "Your next home starts with Camp Match.",
    copy: "Discover accommodation. Connect with potential roommates. Make your next move with confidence.",
    image: listingFive,
    imageAlt: "Clean, bright kitchen in a student-friendly home",
  },
] as const;

type AuthDestination = "/register" | "/login";

export function IntroExperience() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef<number | undefined>(undefined);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(
    () => () => {
      if (transitionTimer.current !== undefined) window.clearTimeout(transitionTimer.current);
    },
    [],
  );

  const goTo = useCallback(
    (index: number) => {
      const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
      if (boundedIndex === activeIndexRef.current || isTransitioning) return;

      setDirection(boundedIndex > activeIndexRef.current ? "forward" : "backward");
      setActiveIndex(boundedIndex);
      if (boundedIndex === slides.length - 1) markIntroCompleted();
      setIsTransitioning(true);
      transitionTimer.current = window.setTimeout(() => setIsTransitioning(false), 420);
    },
    [isTransitioning],
  );

  function continueTo(destination: AuthDestination) {
    markIntroCompleted();
    void navigate({ to: destination });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    goTo(activeIndexRef.current + (deltaX < 0 ? 1 : -1));
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(activeIndexRef.current + 1);
      if (event.key === "ArrowLeft") goTo(activeIndexRef.current - 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo]);

  const slide = slides[activeIndex]!;
  const isFinalSlide = activeIndex === slides.length - 1;

  return (
    <main className="camp-intro" aria-label="Camp Match introduction">
      <div className="camp-intro__frame">
        <header className="camp-intro__header">
          <a className="camp-intro__brand" href="/" aria-label="Camp Match home">
            <span className="camp-intro__brand-mark" aria-hidden="true">
              <Building2 />
            </span>
            <span>CAMP MATCH</span>
          </a>
          {!isFinalSlide ? (
            <button className="camp-intro__skip" type="button" onClick={() => goTo(4)}>
              Skip <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <span className="camp-intro__header-note">A better way to find your place</span>
          )}
        </header>

        <div className="camp-intro__body" aria-live="polite" aria-atomic="true">
          <div
            key={`visual-${activeIndex}`}
            className={`camp-intro__visual camp-intro__visual--${activeIndex + 1} camp-intro__visual--${direction}`}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            {isFinalSlide ? (
              <div className="camp-intro__collage" aria-label="A glimpse of life with Camp Match">
                <img className="camp-intro__collage-main" src={listingFive} alt={slide.imageAlt} />
                <img className="camp-intro__collage-top" src={listingOne} alt="Student room" />
                <img
                  className="camp-intro__collage-side"
                  src={listingTwo}
                  alt="Apartment exterior"
                />
                <div className="camp-intro__collage-stamp" aria-hidden="true">
                  <span>FIND</span>
                  <span>YOUR</span>
                  <span>PLACE</span>
                </div>
              </div>
            ) : (
              <img className="camp-intro__hero-image" src={slide.image} alt={slide.imageAlt} />
            )}

            {activeIndex === 0 ? (
              <>
                <span className="camp-intro__image-kicker">A PLACE TO BEGIN</span>
                <div className="camp-intro__property-preview">
                  <span className="camp-intro__preview-label">ILLUSTRATIVE PREVIEW</span>
                  <div className="camp-intro__preview-row">
                    <div>
                      <strong>Private student room</strong>
                      <span>Near campus · Benin City</span>
                    </div>
                    <span className="camp-intro__price">
                      ₦280k<span>/year</span>
                    </span>
                  </div>
                </div>
              </>
            ) : null}

            {activeIndex === 1 ? (
              <>
                <div className="camp-intro__location-tag">
                  <MapPin aria-hidden="true" />
                  <span>LOCAL AREA</span>
                </div>
                <div className="camp-intro__scout-note">
                  <span>HOUSE SCOUT</span>
                  <strong>
                    Know the neighbourhood.
                    <br />
                    Help students find a fit.
                  </strong>
                </div>
              </>
            ) : null}

            {activeIndex === 2 ? (
              <div className="camp-intro__owner-preview">
                <div className="camp-intro__owner-preview-top">
                  <span className="camp-intro__owner-icon">
                    <Building2 aria-hidden="true" />
                  </span>
                  <span>
                    <small>ILLUSTRATIVE LISTING</small>
                    <strong>Shared apartment</strong>
                  </span>
                  <span className="camp-intro__dots" aria-hidden="true">
                    •••
                  </span>
                </div>
                <div className="camp-intro__owner-preview-bottom">
                  <span>Availability</span>
                  <strong>Set by you</strong>
                </div>
              </div>
            ) : null}

            {activeIndex === 3 ? (
              <div className="camp-intro__match-preview">
                <span className="camp-intro__match-label">
                  <Users aria-hidden="true" /> SAMPLE MATCH
                </span>
                <div className="camp-intro__profiles">
                  <div className="camp-intro__profile">
                    <span className="camp-intro__avatar camp-intro__avatar--one">A</span>
                    <strong>Student A</strong>
                    <span>UNIBEN · Ugbowo</span>
                  </div>
                  <span className="camp-intro__match-link" aria-hidden="true">
                    <Check />
                  </span>
                  <div className="camp-intro__profile">
                    <span className="camp-intro__avatar camp-intro__avatar--two">T</span>
                    <strong>Student B</strong>
                    <span>UNIBEN · Ugbowo</span>
                  </div>
                </div>
                <div className="camp-intro__match-footer">
                  <span>Budget and living preferences overlap</span>
                  <BadgeCheck aria-hidden="true" />
                </div>
              </div>
            ) : null}

            {isFinalSlide ? (
              <span className="camp-intro__final-caption">ROOM TO MAKE IT YOURS</span>
            ) : null}
          </div>

          <section
            key={`copy-${activeIndex}`}
            className={`camp-intro__copy camp-intro__copy--${direction}`}
            aria-labelledby="camp-intro-heading"
          >
            <p className="camp-intro__eyebrow">{slide.eyebrow}</p>
            <h1 id="camp-intro-heading">{slide.headline}</h1>
            <p className="camp-intro__description">{slide.copy}</p>
          </section>
        </div>

        <footer className="camp-intro__footer">
          <nav className="camp-intro__progress" aria-label="Introduction screens">
            {slides.map((item, index) => (
              <button
                key={item.eyebrow}
                className={`camp-intro__progress-step${index === activeIndex ? " is-active" : ""}${index < activeIndex ? " is-complete" : ""}`}
                type="button"
                aria-label={`Go to screen ${index + 1}: ${item.eyebrow.toLowerCase()}`}
                aria-current={index === activeIndex ? "step" : undefined}
                onClick={() => goTo(index)}
              >
                <span />
              </button>
            ))}
            <span className="camp-intro__counter" aria-hidden="true">
              {String(activeIndex + 1).padStart(2, "0")} <span>/</span> 05
            </span>
          </nav>

          <div className="camp-intro__actions">
            <button
              className="camp-intro__back"
              type="button"
              aria-label="Previous screen"
              disabled={activeIndex === 0 || isTransitioning}
              onClick={() => goTo(activeIndex - 1)}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            {isFinalSlide ? (
              <div className="camp-intro__final-actions">
                <Button
                  className="camp-intro__get-started"
                  size="lg"
                  onClick={() => continueTo("/register")}
                >
                  Get Started <ArrowRight aria-hidden="true" />
                </Button>
                <button
                  className="camp-intro__login"
                  type="button"
                  onClick={() => continueTo("/login")}
                >
                  I already have an account
                </button>
              </div>
            ) : (
              <Button
                className="camp-intro__next"
                size="lg"
                disabled={isTransitioning}
                onClick={() => goTo(activeIndex + 1)}
              >
                Continue <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
