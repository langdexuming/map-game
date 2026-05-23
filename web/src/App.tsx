import {useState} from 'react';
import {AlertTriangle} from 'lucide-react';
import {useGameSession} from './state/useGameSession';
import {MapCanvas} from './components/MapCanvas';
import {TopHud} from './components/TopHud';
import {SideDock, type PanelKey} from './components/SideDock';
import {Drawer} from './components/Drawer';
import {RegionsPanel} from './components/panels/RegionsPanel';
import {MissionsPanel} from './components/panels/MissionsPanel';
import {TripsPanel} from './components/panels/TripsPanel';
import {LogPanel} from './components/panels/LogPanel';
import {HqPanel} from './components/panels/HqPanel';
import {CityPopover} from './components/CityPopover';
import {PlannerBar} from './components/PlannerBar';
import {EventModal} from './components/EventModal';
import {ResultOverlay} from './components/ResultOverlay';

export default function App() {
  const session = useGameSession();
  const {t, error, usingFallback, project} = session;

  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{xPct: number; yPct: number} | null>(null);

  function togglePanel(key: NonNullable<PanelKey>) {
    setActivePanel((current) => (current === key ? null : key));
  }

  function onCityClickFromMap(cityId: number, anchor: {xPct: number; yPct: number}) {
    const city = session.cityById.get(cityId);
    if (!city) return;
    session.handleCityClick(city);
    setPopoverAnchor(anchor);
  }

  function onCityClickFromPanel(cityId: number) {
    const city = session.cityById.get(cityId);
    if (!city) return;
    session.handleCityClick(city);
    if (project) {
      const anchor = project(city.lng, city.lat);
      setPopoverAnchor(anchor);
    }
  }

  function closePopover() {
    setPopoverAnchor(null);
    session.setSelectedCityId(null);
  }

  function setStartFromPopover() {
    if (!session.selectedCity) return;
    session.resetTravelSelection(true);
    session.handleCityClick(session.selectedCity);
  }

  function setEndFromPopover() {
    if (!session.selectedCity) return;
    if (session.travelFromId == null || session.travelFromId === session.selectedCity.id) {
      return;
    }
    session.handleCityClick(session.selectedCity);
  }

  const showPopover = session.selectedCity != null && popoverAnchor != null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapCanvas session={session} onCityClick={onCityClickFromMap} />

      <TopHud session={session} />

      <SideDock session={session} active={activePanel} onToggle={togglePanel} />

      {error && !usingFallback ? (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-lg bg-rose-500/90 border border-rose-300 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
          <AlertTriangle size={14} />
          {t.loadFailed}: {error}
        </div>
      ) : null}

      {activePanel === 'regions' ? (
        <Drawer title={t.regions} onClose={() => setActivePanel(null)}>
          <RegionsPanel session={session} onPickCity={onCityClickFromPanel} />
        </Drawer>
      ) : null}
      {activePanel === 'missions' ? (
        <Drawer title={t.missions} onClose={() => setActivePanel(null)}>
          <MissionsPanel session={session} />
        </Drawer>
      ) : null}
      {activePanel === 'trips' ? (
        <Drawer title={t.activeTrips} onClose={() => setActivePanel(null)}>
          <TripsPanel session={session} />
        </Drawer>
      ) : null}
      {activePanel === 'hq' ? (
        <Drawer title={t.baseTitle} onClose={() => setActivePanel(null)}>
          <HqPanel session={session} />
        </Drawer>
      ) : null}
      {activePanel === 'log' ? (
        <Drawer title={t.travelFeed} onClose={() => setActivePanel(null)}>
          <LogPanel session={session} />
        </Drawer>
      ) : null}

      {showPopover ? (
        <CityPopover
          session={session}
          anchor={popoverAnchor!}
          onClose={closePopover}
          onSetStart={setStartFromPopover}
          onSetEnd={setEndFromPopover}
        />
      ) : null}

      <PlannerBar session={session} />

      <EventModal session={session} />
      <ResultOverlay session={session} />
    </div>
  );
}
