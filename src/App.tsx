import { useEffect, useState } from "react";
import { Gallery } from "./Gallery";
import { byId } from "./dashboards/registry";

/** tiny hash router: `#/` = gallery, `#/d/<id>` = one dashboard */
function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "");
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();

  // "#/d/fleetflow" or "#/d/fleetflow/shipments" -> dashboard id + section
  const match = route.match(/^d\/([\w-]+)(?:\/([\w-]+))?$/);
  const dash = match ? byId(match[1]) : undefined;

  if (dash) {
    const View = dash.component;
    return <View />;
  }

  if (route) {
    // unknown or malformed dashboard route — say so instead of a silent
    // redirect, so a typo'd link doesn't look like it "worked"
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center">
        <div>
          <p className="text-[13px] font-medium text-mute-100">
            No dashboard at <span className="num text-mute-300">/{route}</span>
          </p>
          <a
            href="#/"
            className="mt-3 inline-block rounded-lg bg-signal px-3 py-1.5 text-[12px] font-semibold text-ink-950"
          >
            Back to shelf
          </a>
        </div>
      </div>
    );
  }

  return <Gallery />;
}
