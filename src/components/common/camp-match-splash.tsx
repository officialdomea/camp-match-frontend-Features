import { House, Link2, PersonStanding } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import "./camp-match-splash.css";

type CampMatchSplashProps = {
  children: ReactNode;
  durationMs?: number;
};

export function CampMatchSplash({ children, durationMs = 5000 }: CampMatchSplashProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs]);

  return (
    <>
      {children}
      {visible ? (
        <div className="camp-match-splash" role="status" aria-label="Loading Camp Match">
          <div className="camp-match-splash__content">
            <div className="camp-match-splash__wordmark" aria-label="Camp Match">
              {"CAMP MATCH".split("").map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  className={character === " " ? "camp-match-splash__space" : ""}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {character}
                </span>
              ))}
            </div>

            <div className="camp-match-splash__scene" aria-hidden="true">
              <div className="camp-match-splash__connection">
                <Link2 />
              </div>
              <div className="camp-match-splash__people">
                <PersonStanding className="camp-match-splash__person camp-match-splash__person--left" />
                <PersonStanding className="camp-match-splash__person camp-match-splash__person--right" />
              </div>
              <House className="camp-match-splash__house" />
            </div>

            <p className="camp-match-splash__tagline">Find your place. Make your connection.</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
